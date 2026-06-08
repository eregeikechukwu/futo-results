/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * parser.ts — Spatial-Aware OCR Table Parser
 * Worker-ready TypeScript port of the FUTO spatial parser engine.
 *
 * Fixes applied vs. the original server.js:
 *  1. regNo cleaning now preserves FUTO format  e.g. "2019/1/12345ME"
 *  2. groupWordsIntoRows uses a rolling average Y so drifting rows don't split
 *  3. detectColumns merges adjacent single-char tokens (handles "REG. NO." split)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WordToken {
  text: string;
  x: number; // centre X
  y: number; // centre Y
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  confidence: number;
}

interface Column {
  header: string;
  normalizedHeader: string;
  centerX: number;
  left: number;
  right: number;
}

interface ParsedRow {
  name: string | null;
  regNo: string | null;
  program: string | null;
  test: number | null;
  lab: number | null;
  exam: number | null;
  total: number | null;
  grade: string | null;
  remark: string | null;
  _calculated?: string[];
  [key: string]: unknown;
}

interface ParseResult {
  headers: string[];
  headerMapping: Record<string, string>;
  data: ParsedRow[];
  rawText: string;
  metadata: {
    totalWordsDetected: number;
    totalRowsDetected: number;
    headerRowIndex: number;
    dataRowsParsed: number;
    columns: number;
    processingMethod: string;
  };
}

// ---------------------------------------------------------------------------
// Step 1 — Extract word tokens with bounding-box positions
// ---------------------------------------------------------------------------

function extractSpatialWords(result: any): WordToken[] {
  const words: WordToken[] = [];
  const pages = result.fullTextAnnotation?.pages ?? [];

  for (const page of pages) {
    for (const block of page.blocks ?? []) {
      for (const paragraph of block.paragraphs ?? []) {
        for (const word of paragraph.words ?? []) {
          const text: string = word.symbols.map((s: any) => s.text).join("");
          const vertices: { x?: number; y?: number }[] =
            word.boundingBox?.vertices ?? [];

          const left = Math.min(...vertices.map((v) => v.x ?? 0));
          const right = Math.max(...vertices.map((v) => v.x ?? 0));
          const top = Math.min(...vertices.map((v) => v.y ?? 0));
          const bottom = Math.max(...vertices.map((v) => v.y ?? 0));

          words.push({
            text,
            x: (left + right) / 2,
            y: (top + bottom) / 2,
            left,
            right,
            top,
            bottom,
            width: right - left,
            height: bottom - top,
            confidence: word.confidence ?? 0,
          });
        }
      }
    }
  }

  console.log(`[parser] Extracted ${words.length} word tokens`);
  return words;
}

// ---------------------------------------------------------------------------
// Step 2 — Group tokens into rows
// FIX: rolling-average Y prevents drifting rows from splitting mid-row.
// ---------------------------------------------------------------------------

function groupWordsIntoRows(
  words: WordToken[],
  yToleranceFactor = 0.6,
): WordToken[][] {
  if (words.length === 0) return [];

  // Tolerance scales with the median word height so it works across DPI ranges.
  const heights = words.map((w) => w.height).sort((a, b) => a - b);
  const medianH = heights[Math.floor(heights.length / 2)] || 15;
  const yTolerance = Math.max(8, medianH * yToleranceFactor);

  console.log(
    `[parser] Row grouping — median height: ${medianH.toFixed(1)}px, tolerance: ${yTolerance.toFixed(1)}px`,
  );

  const sorted = [...words].sort((a, b) => a.y - b.y);

  const rows: WordToken[][] = [];
  let currentRow: WordToken[] = [sorted[0]];

  // FIX: track a rolling average Y rather than the Y of the first word only.
  let rowYSum = sorted[0].y;
  let rowYCount = 1;

  for (let i = 1; i < sorted.length; i++) {
    const word = sorted[i];
    const avgRowY = rowYSum / rowYCount;

    if (Math.abs(word.y - avgRowY) < yTolerance) {
      // Word belongs to the current row — update the running average.
      currentRow.push(word);
      rowYSum += word.y;
      rowYCount += 1;
    } else {
      currentRow.sort((a, b) => a.x - b.x);
      rows.push(currentRow);
      currentRow = [word];
      rowYSum = word.y;
      rowYCount = 1;
    }
  }

  if (currentRow.length > 0) {
    currentRow.sort((a, b) => a.x - b.x);
    rows.push(currentRow);
  }

  console.log(`[parser] Grouped into ${rows.length} rows`);
  return rows;
}

// ---------------------------------------------------------------------------
// Step 3 — Detect column boundaries from the header row
// FIX: merge adjacent tokens whose combined text matches a known multi-word
//      header (e.g. ["REG.", "NO."] → "REG. NO.") before computing boundaries.
// ---------------------------------------------------------------------------

const MULTI_WORD_HEADERS: string[] = [
  "reg. no.",
  "reg no",
  "s/n",
  "full name",
  "student name",
  "pass/fail",
  "ca1",
  "ca 1",
];

function mergeAdjacentHeaderTokens(headerRow: WordToken[]): WordToken[] {
  const merged: WordToken[] = [];
  let i = 0;

  while (i < headerRow.length) {
    let found = false;

    // Try to merge current token with the next one(s).
    for (let len = Math.min(3, headerRow.length - i); len > 1; len--) {
      const candidate = headerRow
        .slice(i, i + len)
        .map((w) => w.text)
        .join(" ")
        .toLowerCase();

      if (MULTI_WORD_HEADERS.includes(candidate)) {
        const group = headerRow.slice(i, i + len);
        merged.push({
          text: group.map((w) => w.text).join(" "),
          left: group[0].left,
          right: group[group.length - 1].right,
          top: Math.min(...group.map((w) => w.top)),
          bottom: Math.max(...group.map((w) => w.bottom)),
          x: (group[0].left + group[group.length - 1].right) / 2,
          y: group.reduce((s, w) => s + w.y, 0) / group.length,
          width: group[group.length - 1].right - group[0].left,
          height: Math.max(...group.map((w) => w.height)),
          confidence: Math.min(...group.map((w) => w.confidence)),
        });
        i += len;
        found = true;
        break;
      }
    }

    if (!found) {
      merged.push(headerRow[i]);
      i++;
    }
  }

  return merged;
}

function detectColumns(rawHeaderRow: WordToken[]): Column[] {
  // FIX: merge multi-word header tokens first.
  const headerRow = mergeAdjacentHeaderTokens(rawHeaderRow);

  if (headerRow.length === 0) return [];

  const columns: Column[] = headerRow.map((word, index) => {
    let colLeft = word.left;
    let colRight = word.right;

    if (index > 0) {
      colLeft = (headerRow[index - 1].right + word.left) / 2;
    }
    if (index < headerRow.length - 1) {
      colRight = (word.right + headerRow[index + 1].left) / 2;
    }

    return {
      header: word.text,
      normalizedHeader: normalizeFieldName(word.text),
      centerX: word.x,
      left: colLeft,
      right: colRight,
    };
  });

  console.log("[parser] Columns detected:");
  columns.forEach((c, i) =>
    console.log(
      `  ${i + 1}. "${c.header}" → ${c.normalizedHeader}  (x: ${c.left.toFixed(0)}–${c.right.toFixed(0)})`,
    ),
  );

  return columns;
}

// ---------------------------------------------------------------------------
// Step 4 — Find the header row
// ---------------------------------------------------------------------------

function findHeaderRow(rows: WordToken[][]): number {
  const requiredKeywords = ["reg", "test", "exam", "total", "grade"];
  const bonusKeywords = [
    "name",
    "regno",
    "regnumber",
    "student",
    "matric",
    "id",
    "program",
    "ca",
    "quiz",
    "lab",
    "practical",
    "examination",
    "sum",
    "score",
    "result",
    "remark",
    "status",
  ];

  let bestIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < Math.min(15, rows.length); i++) {
    const row = rows[i];
    const text = row.map((w) => w.text.toLowerCase()).join(" ");

    const requiredHits = requiredKeywords.filter((kw) =>
      text.includes(kw),
    ).length;

    if (requiredHits < 3) continue;

    // A header row should never contain 8+ digit registration numbers.
    if (row.some((w) => /^\d{8,}$/.test(w.text))) continue;

    let score = requiredHits * 20;
    score += bonusKeywords.filter((kw) => text.includes(kw)).length * 5;
    score += [15, 10, 5][i] ?? 0; // earlier rows score higher

    if (row.length > 1) {
      const spread =
        Math.max(...row.map((w) => w.x)) - Math.min(...row.map((w) => w.x));
      score += spread / 20;
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex >= 0 && bestScore > 30) {
    console.log(
      `[parser] Header row: index ${bestIndex} (score ${bestScore.toFixed(1)})`,
    );
    return bestIndex;
  }

  console.warn("[parser] No clear header row — defaulting to row 0");
  return 0;
}

// ---------------------------------------------------------------------------
// Step 5 — Match data-row tokens to columns by spatial X position
// ---------------------------------------------------------------------------

function matchWordsToColumns(
  rowWords: WordToken[],
  columns: Column[],
): Record<string, string | null> {
  const rowData: Record<string, string | null> = {};
  for (const col of columns) rowData[col.header] = null;

  for (const word of rowWords) {
    let bestCol: Column | null = null;
    let bestDist = Infinity;

    for (const col of columns) {
      if (word.x >= col.left && word.x <= col.right) {
        bestCol = col;
        break;
      }
      const dist = Math.abs(word.x - col.centerX);
      if (dist < bestDist) {
        bestDist = dist;
        bestCol = col;
      }
    }

    if (bestCol) {
      rowData[bestCol.header] = rowData[bestCol.header]
        ? rowData[bestCol.header] + " " + word.text
        : word.text;
    }
  }

  return rowData;
}

// ---------------------------------------------------------------------------
// Utilities — field name normalisation & value cleaning
// ---------------------------------------------------------------------------

function normalizeFieldName(header: string): string {
  const n = header.toLowerCase().trim();

  const mapping: Record<string, string[]> = {
    name: ["name", "student", "fullname", "full name", "student name"],
    regNo: [
      "regno",
      "reg no",
      "reg. no.",
      "reg. no",
      "reg",
      "registration",
      "matric",
      "student id",
      "id",
      "s/n",
    ],
    program: ["program", "programme", "course", "dept", "department"],
    test: ["test", "ca", "ca1", "ca 1", "quiz", "continuous", "assessment"],
    lab: ["lab", "practical", "laboratory"],
    exam: ["exam", "examination", "final"],
    total: ["total", "sum", "aggregate", "score"],
    grade: ["grade", "letter"],
    remark: ["remark", "status", "result", "pass/fail"],
  };

  for (const [standard, variants] of Object.entries(mapping)) {
    for (const variant of variants) {
      if (n.includes(variant) || variant.includes(n)) return standard;
    }
  }

  return header;
}

function cleanFieldValue(fieldName: string, value: string | null): unknown {
  if (value == null) return null;
  const cleaned = String(value).trim();
  if (cleaned === "") return null;

  switch (fieldName) {
    case "regNo": {
      // FUTO reg numbers are all-numeric e.g. "20231453773".
      // Correct common OCR substitutions then strip everything non-digit.
      const rn = cleaned
        .replace(/[O]/gi, "0")
        .replace(/[Il]/g, "1")
        .replace(/[^\d]/g, "");
      return rn.length >= 2 ? rn : null;
    }

    case "test":
    case "lab":
    case "exam":
    case "total": {
      // O → 0 is a common OCR error in numeric fields.
      const score = parseFloat(
        cleaned.replace(/[O]/g, "0").replace(/[^\d.]/g, ""),
      );
      return !isNaN(score) && score >= 0 && score <= 100 ? score : null;
    }

    case "grade": {
      const g = cleaned.toUpperCase();
      return /^[A-F][+-]?$/.test(g) ? g : null;
    }

    case "remark":
      if (/pass/i.test(cleaned)) return "Pass";
      if (/fail/i.test(cleaned)) return "Fail";
      return cleaned;

    default:
      return cleaned;
  }
}

function calculateMissingFields(row: ParsedRow): ParsedRow {
  if (
    row.total == null &&
    (row.test != null || row.lab != null || row.exam != null)
  ) {
    row.total = (row.test ?? 0) + (row.lab ?? 0) + (row.exam ?? 0);
    (row._calculated ??= []).push("total");
  }

  if (row.grade == null && row.total != null) {
    if (row.total >= 70) row.grade = "A";
    else if (row.total >= 60) row.grade = "B";
    else if (row.total >= 50) row.grade = "C";
    else if (row.total >= 45) row.grade = "D";
    else if (row.total >= 40) row.grade = "E";
    else row.grade = "F";
    (row._calculated ??= []).push("grade");
  }

  if (row.remark == null && row.total != null) {
    row.remark = row.total >= 40 ? "Pass" : "Fail";
    (row._calculated ??= []).push("remark");
  }

  return row;
}

function isValidRow(row: ParsedRow): boolean {
  return !!(
    row.name ||
    row.regNo ||
    row.test != null ||
    row.lab != null ||
    row.exam != null ||
    row.total != null ||
    row.grade != null
  );
}

// ---------------------------------------------------------------------------
// Main export — call this from the worker's processJob()
// ---------------------------------------------------------------------------

export async function parseSpatialTable(
  visionResult: any,
): Promise<ParseResult> {
  const words = extractSpatialWords(visionResult);
  if (words.length === 0) throw new Error("No text detected in image");

  const rows = groupWordsIntoRows(words);
  if (rows.length === 0) throw new Error("No rows detected");

  const headerRowIndex = findHeaderRow(rows);
  const headerRow = rows[headerRowIndex];
  const columns = detectColumns(headerRow);

  console.log(
    `[parser] Header at row ${headerRowIndex}, ${columns.length} columns, ${rows.length - headerRowIndex - 1} data rows`,
  );

  const dataRows: ParsedRow[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const rawRow = matchWordsToColumns(rows[i], columns);
    const cleanedRow: ParsedRow = {
      name: null,
      regNo: null,
      program: null,
      test: null,
      lab: null,
      exam: null,
      total: null,
      grade: null,
      remark: null,
    };

    for (const [header, value] of Object.entries(rawRow)) {
      const field = normalizeFieldName(header);
      const cleanedValue = cleanFieldValue(field, value) as any;

      // Only overwrite an existing value with null if we have nothing better.
      if (!(field in cleanedRow) || cleanedValue !== null) {
        (cleanedRow as any)[field] = cleanedValue;
      }
    }

    const enriched = calculateMissingFields(cleanedRow);

    if (isValidRow(enriched)) {
      dataRows.push(enriched);
    } else {
      console.log(
        `[parser] Row ${i - headerRowIndex} skipped — insufficient data`,
      );
    }
  }

  console.log(`[parser] Done — ${dataRows.length} valid rows`);

  return {
    headers: columns.map((c) => c.normalizedHeader),
    headerMapping: Object.fromEntries(
      columns.map((c) => [c.header, c.normalizedHeader]),
    ),
    data: dataRows,
    rawText: visionResult.fullTextAnnotation?.text ?? "",
    metadata: {
      totalWordsDetected: words.length,
      totalRowsDetected: rows.length,
      headerRowIndex,
      dataRowsParsed: dataRows.length,
      columns: columns.length,
      processingMethod: "spatial-aware-parsing-v3-futo",
    },
  };
}
