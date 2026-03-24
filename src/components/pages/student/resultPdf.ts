"use client";

// It builds real PDF binary files, not HTML-to-PDF conversions.
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import { formatCgpa } from "@/utils/systemUtils";
import { SemesterResult } from "./types";

// ─── COLOR PALETTE ────────────────────────────────────────────────────────────
// pdf-lib uses rgb(r, g, b) where each channel is 0.0–1.0 (not 0–255).
// To convert a hex color: divide each channel by 255.
// e.g. #123E7D → r=18/255=0.071, g=62/255=0.243, b=125/255=0.490
//
// To change the theme, edit these values. Everything in the document
// references these names, so one change here affects the whole PDF.
const COLOR = {
  primary: rgb(0.071, 0.227, 0.49), // Deep navy — header bg, table header bg, CGPA card bg | hex: #123E7D
  accent: rgb(0.18, 0.459, 0.871), // Bright blue — stripe, section title, left bars         | hex: #2E75DE
  lightBg: rgb(0.953, 0.961, 0.976), // Near-white — info card bg, footer bg                   | hex: #F3F5F9
  border: rgb(0.851, 0.875, 0.918), // Soft gray — row dividers, footer top line               | hex: #D9DFEA
  text: rgb(0.098, 0.122, 0.169), // Dark ink — all regular body text                        | hex: #191F2B
  muted: rgb(0.459, 0.494, 0.569), // Mid gray — labels, footer disclaimer                    | hex: #757E91
  white: rgb(1, 1, 1), // Pure white — text on dark backgrounds
  rowAlt: rgb(0.976, 0.98, 0.988), // Very light gray — every other table row (zebra)         | hex: #F9FAFB
  green: rgb(0.082, 0.502, 0.337), // Pass green — grade cell when student passes              | hex: #158056
  red: rgb(0.749, 0.149, 0.196), // Fail red — grade cell when student fails                | hex: #BF2632
};

// ─── PAGE LAYOUT CONSTANTS ────────────────────────────────────────────────────
// All measurements are in PDF points (pt). 1pt = 1/72 inch.
// A4 paper is 210mm × 297mm = 595pt × 842pt.
//
// IMPORTANT: pdf-lib's coordinate system starts at the BOTTOM-LEFT corner.
// y=0 is the bottom of the page, y=842 is the top.
// This is the opposite of CSS/HTML. Keep this in mind when positioning elements.
//
// To position something from the top: use (PAGE_H - distanceFromTop).
// Example: to place text 30pt from the top → y = PAGE_H - 30 = 812
const PAGE_W = 595; // A4 width in points
const PAGE_H = 842; // A4 height in points
const MARGIN = 48; // Left and right margin — increase to narrow the content area
const CONTENT_W = PAGE_W - MARGIN * 2; // Usable width between margins = 499pt

// ─── HELPER: gradeColor ───────────────────────────────────────────────────────
// Returns red for failing grades, green for everything else.
// Add more failing grades to the array if your grading system uses them.
// e.g. ["F", "E", "D"] if D is also a fail in your system.
function gradeColor(grade: string) {
  const failing = ["F", "E"]; // ← Edit this list to match your grading system
  return failing.includes(grade.toUpperCase()) ? COLOR.red : COLOR.green;
}

// ─── HELPER: drawRect ────────────────────────────────────────────────────────
// Shorthand for drawing a filled rectangle.
// x, y = bottom-left corner of the rectangle (remember: y=0 is the bottom)
// w, h = width and height in points
// fill = a COLOR.xxx value
function drawRect(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: ReturnType<typeof rgb>,
) {
  page.drawRectangle({ x, y, width: w, height: h, color: fill });
}

// ─── HELPER: drawLine ────────────────────────────────────────────────────────
// Draws a horizontal or diagonal line between two points.
// thickness = stroke weight in points. 0.5 is a hairline, 1.5 is visible bold.
function drawLine(
  page: PDFPage,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = COLOR.border, // defaults to the soft gray border color
  thickness = 0.5,
) {
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    color,
    thickness,
  });
}

// ─── HELPER: text ────────────────────────────────────────────────────────────
// Shorthand for drawing a single line of text.
// x, y = bottom-left of the text baseline (again, y=0 is bottom of page)
// font = one of fontRegular, fontBold, or fontOblique (defined inside main fn)
// size = font size in points. 7–9 for small labels, 10–12 for body, 14–18 for headings.
function text(
  page: PDFPage,
  content: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color = COLOR.text, // defaults to dark ink
) {
  page.drawText(content, { x, y, font, size, color });
}

// ─── HELPER: truncate ────────────────────────────────────────────────────────
// Cuts a string to maxChars and adds "…" if it's too long.
// Used to prevent course titles or names from overflowing their column.
// Increase the column width in COLS instead of increasing maxChars
// if you find titles getting cut too aggressively.
function truncate(value: string, maxChars: number): string {
  return value.length > maxChars ? value.slice(0, maxChars - 1) + "…" : value;
}

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────────
// Call this from a button's onClick handler.
// It builds the PDF in memory and triggers a browser download.
//
// Usage:
//   // With logo:
//   const logoBuffer = await fetch('/logo.png').then(r => r.arrayBuffer());
//   await downloadSemesterResultPdf(result, cgpa, logoBuffer);
//
//   // Without logo (shows initials badge instead):
//   await downloadSemesterResultPdf(result, cgpa);
export async function downloadSemesterResultPdf(
  result: SemesterResult, // All student + course data
  semesterCgpa: number, // The computed semester CGPA to display
  logoArrayBuffer?: ArrayBuffer, // Optional: raw bytes of a PNG or JPG logo file
): Promise<void> {
  // Create a new blank PDF document
  const pdfDoc = await PDFDocument.create();

  // Add one A4 page. PAGE_W × PAGE_H = 595 × 842 points.
  // To change paper size, swap these values. Letter = [612, 792].
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

  // ── FONTS ──────────────────────────────────────────────────────────────────
  // pdf-lib ships with 14 standard fonts built into every PDF viewer.
  // They don't need to be embedded as file data — they're always available.
  // StandardFonts options: Helvetica, HelveticaBold, HelveticaOblique,
  //   TimesRoman, TimesRomanBold, Courier, CourierBold, etc.
  //
  // To use a CUSTOM FONT (e.g. Inter, Poppins):
  //   1. Fetch the font file: const fontBytes = await fetch('/fonts/Inter.ttf').then(r => r.arrayBuffer())
  //   2. Embed it: const fontRegular = await pdfDoc.embedFont(fontBytes)
  //   3. Replace the StandardFonts references below with your embedded font
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica); // Normal weight — body text, labels
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold); // Bold — headings, grades, values
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique); // Italic — subtitles, disclaimers

  // ── HEADER BAND ────────────────────────────────────────────────────────────
  // A full-width colored rectangle at the top of the page.
  // HEADER_H controls how tall the header is. Increase it to add more breathing room.
  const HEADER_H = 72; // ← Change this to make the header taller or shorter

  // Draw the main header background (navy rectangle spanning full width, top of page)
  // y = PAGE_H - HEADER_H means it starts at the top and goes down HEADER_H points
  drawRect(page, 0, PAGE_H - HEADER_H, PAGE_W, HEADER_H, COLOR.primary);

  // Draw a thin accent stripe directly below the header (3pt tall)
  // This acts as a visual separator between header and content
  // Change COLOR.accent to COLOR.primary to remove the visible contrast stripe
  drawRect(page, 0, PAGE_H - HEADER_H - 3, PAGE_W, 3, COLOR.accent);

  // ── LOGO / BADGE ───────────────────────────────────────────────────────────
  // The logo sits inside the header on the left side, vertically centered.
  // LOGO_SIZE controls the bounding box (width and height) for the logo.
  const LOGO_SIZE = 44; // ← Change this to scale the logo up or down
  const LOGO_X = MARGIN; // Aligns with the left margin
  // Vertically centers the logo within the header band
  const LOGO_Y = PAGE_H - HEADER_H + (HEADER_H - LOGO_SIZE) / 2;

  if (logoArrayBuffer) {
    // A logo file was passed in — try to embed it as PNG, then JPG as fallback
    try {
      let logoImage;
      try {
        // Try PNG first (supports transparency, better for logos)
        logoImage = await pdfDoc.embedPng(logoArrayBuffer);
      } catch {
        // If PNG fails, try JPG (no transparency support)
        logoImage = await pdfDoc.embedJpg(logoArrayBuffer);
      }

      // scaleToFit keeps the aspect ratio while fitting within LOGO_SIZE × LOGO_SIZE
      const logoDims = logoImage.scaleToFit(LOGO_SIZE, LOGO_SIZE);

      page.drawImage(logoImage, {
        x: LOGO_X,
        // Vertically center the image within the logo bounding box
        y: LOGO_Y + (LOGO_SIZE - logoDims.height) / 2,
        width: logoDims.width,
        height: logoDims.height,
      });
    } catch {
      // If both PNG and JPG embedding fail (corrupt file, wrong format, etc.)
      // fall back silently to the text initials badge
      drawInitialsBadge(page, fontBold, LOGO_X, LOGO_Y, LOGO_SIZE);
    }
  } else {
    // No logo provided — show the circular initials badge instead
    drawInitialsBadge(page, fontBold, LOGO_X, LOGO_Y, LOGO_SIZE);
  }

  // ── HEADER TEXT ────────────────────────────────────────────────────────────
  // Three lines of institution text to the right of the logo.
  // TEXT_X starts immediately after the logo + a 14pt gap.
  const TEXT_X = LOGO_X + LOGO_SIZE + 14;

  // Line 1: Portal/system name — large and bold
  // PAGE_H - 30 means 30pt from the top of the page
  text(
    page,
    "FUTO Results Portal",
    TEXT_X,
    PAGE_H - 30,
    fontBold,
    16,
    COLOR.white,
  );

  // Line 2: Full institution name — small regular
  // The light blue-gray color (0.78, 0.84, 0.93) gives a "subdued" look on the dark bg
  text(
    page,
    "Federal University of Technology, Owerri",
    TEXT_X,
    PAGE_H - 46,
    fontRegular,
    9,
    rgb(0.78, 0.84, 0.93),
  );

  // Line 3: Document type label — italic, even more muted
  text(
    page,
    "Official Academic Result Slip",
    TEXT_X,
    PAGE_H - 60,
    fontOblique,
    8.5,
    rgb(0.65, 0.73, 0.87),
  );

  // ── ISSUE DATE (top-right of header) ──────────────────────────────────────
  // Formatted as "27 Feb 2026" — change the locale or options to reformat.
  // e.g. "en-US" gives "Feb 27, 2026", removing month:"short" gives "February"
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // widthOfTextAtSize measures text width in points so we can right-align it.
  // Right-align formula: startX = (rightEdge) - (textWidth)
  const dateW = fontRegular.widthOfTextAtSize(today, 8);
  text(
    page,
    today,
    PAGE_W - MARGIN - dateW,
    PAGE_H - 30,
    fontRegular,
    8,
    rgb(0.78, 0.84, 0.93),
  );
  text(
    page,
    "Issued",
    PAGE_W - MARGIN - fontRegular.widthOfTextAtSize("Issued", 7),
    PAGE_H - 42,
    fontRegular,
    7,
    rgb(0.55, 0.63, 0.78),
  );

  // ── STUDENT INFO CARD ──────────────────────────────────────────────────────
  // A light gray card below the header containing student details in a 2-column grid.
  //
  // curY is a running Y cursor tracking where we are on the page.
  // We subtract from it as we draw each section to move down the page.
  // Remember: Y decreases as we move down (bottom-left origin system).
  let curY = PAGE_H - HEADER_H - 3 - 20; // Start 20pt below the accent stripe

  const INFO_CARD_H = 86; // ← Increase this if you add more info fields

  // Card background (light gray rectangle)
  drawRect(
    page,
    MARGIN,
    curY - INFO_CARD_H,
    CONTENT_W,
    INFO_CARD_H,
    COLOR.lightBg,
  );

  // Left accent bar — 3pt wide colored strip on the left edge of the card
  // Remove this drawRect call if you don't want the left bar
  drawRect(page, MARGIN, curY - INFO_CARD_H, 3, INFO_CARD_H, COLOR.accent);

  // Text starts 16pt from the left edge of the card (clears the accent bar)
  const infoLeft = MARGIN + 16;
  // First row of text starts 18pt below the top of the card
  const infoTop = curY - 18;
  // Vertical spacing between the label and value lines within one field
  const LINE_H = 17;

  // ── Info fields: [label, value] pairs ─────────────────────────────────────
  // Laid out in a 2-column grid (2 fields per row).
  // Add or remove fields here. If you add a 5th field, increase INFO_CARD_H above.
  const infoFields: [string, string][] = [
    ["Student Name", result.student.name],
    ["Registration No.", result.student.regNumber],
    ["Department", result.student.department],
    // Combines level + session + semester with a middle dot separator (·)
    [
      "Level / Session",
      `${result.student.level}  ·  ${result.session}  ·  ${result.semester}`,
    ],
  ];

  // Lay out fields in a 2-column grid
  // i=0 → col 0 row 0 | i=1 → col 1 row 0 | i=2 → col 0 row 1 | i=3 → col 1 row 1
  infoFields.forEach(([label, value], i) => {
    const col = i % 2; // 0 = left column, 1 = right column
    const row = Math.floor(i / 2); // 0 = first row, 1 = second row

    // Left column starts at infoLeft; right column starts at the horizontal midpoint
    const ix = col === 0 ? infoLeft : MARGIN + CONTENT_W / 2 + 8;

    // Each row is (LINE_H * 2) apart to fit label + value lines
    const iy = infoTop - row * (LINE_H * 2);

    // Label: small, uppercase, muted color
    text(page, label.toUpperCase(), ix, iy, fontRegular, 6.5, COLOR.muted);
    // Value: bold, normal color, truncated at 38 chars
    text(page, truncate(value, 38), ix, iy - 11, fontBold, 9, COLOR.text);
  });

  // Move cursor below the info card + 22pt gap before the next section
  curY -= INFO_CARD_H + 22;

  // ── SECTION TITLE ─────────────────────────────────────────────────────────
  // "COURSE RESULTS" label with a horizontal rule beneath it.
  // Change the string to rename the section heading.
  text(page, "COURSE RESULTS", MARGIN, curY, fontBold, 8, COLOR.accent);

  // Horizontal rule (1pt thick, accent color) directly under the section title
  drawLine(page, MARGIN, curY - 5, PAGE_W - MARGIN, curY - 5, COLOR.accent, 1);

  curY -= 18; // Gap between section title and table header row

  // ── RESULTS TABLE ─────────────────────────────────────────────────────────
  // Built from a COLS array of column definitions.
  // Each column: label (header text), x (left edge in pt), w (width in pt), align.
  //
  // TO ADD A COLUMN:
  //   1. Add an entry to COLS below
  //   2. Add its value to rowValues inside the forEach loop
  //   3. Make sure all column x values and widths still sum to CONTENT_W (499pt)
  //
  // TO REMOVE A COLUMN:
  //   1. Delete its entry from COLS
  //   2. Delete its value from rowValues
  //   3. Re-adjust x offsets and widths of remaining columns
  //
  // Current column widths: 62+198+38+38+38+42+42+41 = 499 = CONTENT_W ✓
  type Align = "left" | "right" | "center";
  const COLS: { label: string; x: number; w: number; align: Align }[] = [
    { label: "CODE", x: MARGIN, w: 62, align: "left" }, // Course code e.g. CSC301
    { label: "COURSE TITLE", x: MARGIN + 62, w: 198, align: "left" }, // Course name — widest column
    { label: "UNIT", x: MARGIN + 260, w: 38, align: "center" }, // Credit units
    { label: "TEST", x: MARGIN + 298, w: 38, align: "center" }, // Continuous assessment score
    { label: "LAB", x: MARGIN + 336, w: 38, align: "center" }, // Lab score (if applicable)
    { label: "EXAM", x: MARGIN + 374, w: 42, align: "center" }, // Exam score
    { label: "TOTAL", x: MARGIN + 416, w: 42, align: "center" }, // Combined total score
    { label: "GRADE", x: MARGIN + 458, w: 41, align: "center" }, // Letter grade (A, B, C, F…)
  ];

  const ROW_H = 18; // ← Height of each data row. Increase for more breathing room.
  const TABLE_HEADER_H = 20; // ← Height of the column header row (the navy bar).

  // Draw the table header background (solid navy rectangle)
  drawRect(
    page,
    MARGIN,
    curY - TABLE_HEADER_H,
    CONTENT_W,
    TABLE_HEADER_H,
    COLOR.primary,
  );

  // Draw each column header label, positioned and aligned within its column bounds
  COLS.forEach((col) => {
    const labelW = fontBold.widthOfTextAtSize(col.label, 7);

    // Calculate text x based on alignment type
    const tx =
      col.align === "center"
        ? col.x + (col.w - labelW) / 2 // centered in column
        : col.align === "right"
          ? col.x + col.w - labelW // flush right
          : col.x + 4; // flush left with 4pt padding

    // curY - 14 positions text 14pt from the top of the header bar
    // Adjust this if TABLE_HEADER_H changes
    text(page, col.label, tx, curY - 14, fontBold, 7, COLOR.white);
  });

  curY -= TABLE_HEADER_H; // Move cursor below the header bar

  // ── TABLE DATA ROWS ────────────────────────────────────────────────────────
  result.courses.forEach((course, i) => {
    // rowY = the BOTTOM edge of this row
    // Row 0: bottom = curY - ROW_H | Row 1: bottom = curY - 2*ROW_H | etc.
    const rowY = curY - (i + 1) * ROW_H;

    // Zebra striping: shade every odd row (index 1, 3, 5…) with a very light gray
    // To disable zebra striping, delete this entire if block
    if (i % 2 === 1) {
      drawRect(page, MARGIN, rowY, CONTENT_W, ROW_H, COLOR.rowAlt);
    }

    // ── Cell values for this row ─────────────────────────────────────────────
    // Order must match the COLS array above exactly (same index = same column).
    // ?? "—" means: if value is null/undefined, show a dash instead of "null"
    const rowValues: string[] = [
      course.courseCode,
      truncate(course.courseTitle, 30), // Truncate long titles at 30 chars to fit column
      String(course.unit),
      String(course.test ?? "—"), // Some courses may not have a test score
      String(course.lab ?? "—"), // Some courses may not have a lab score
      String(course.exam),
      String(course.total),
      course.grade,
    ];

    // Draw each cell, aligned within its column
    COLS.forEach((col, ci) => {
      const val = rowValues[ci];

      // Grade column (ci === 7) uses bold; all other columns use regular weight
      const cellFont = ci === 7 ? fontBold : fontRegular;
      const valW = cellFont.widthOfTextAtSize(val, 8.5);

      // Same alignment logic as the header labels above
      const tx =
        col.align === "center"
          ? col.x + (col.w - valW) / 2
          : col.align === "right"
            ? col.x + col.w - valW - 2
            : col.x + 4;

      // Grade column gets colored text (green = pass, red = fail)
      // All other columns use the standard dark ink color
      const cellColor = ci === 7 ? gradeColor(course.grade) : COLOR.text;

      // rowY + 5 vertically centers text within the row height (ROW_H = 18pt)
      // If you change ROW_H, adjust this +5 offset to keep text centered
      text(page, val, tx, rowY + 5, cellFont, 8.5, cellColor);
    });

    // Thin horizontal divider at the bottom edge of this row
    // To remove row dividers entirely, delete this line
    drawLine(page, MARGIN, rowY, PAGE_W - MARGIN, rowY, COLOR.border, 0.4);
  });

  // Advance cursor past all rows
  curY -= result.courses.length * ROW_H;

  // Bold closing line at the bottom of the entire table
  // Heavier (1pt) than the per-row dividers (0.4pt) for visual closure
  drawLine(page, MARGIN, curY, PAGE_W - MARGIN, curY, COLOR.primary, 1);

  curY -= 24; // Gap between table bottom and the CGPA summary card

  // ── CGPA SUMMARY CARD ──────────────────────────────────────────────────────
  // A compact navy card in the bottom-right corner showing the semester CGPA.
  //
  // To add more fields (e.g. total credit units, cumulative GPA):
  //   1. Increase SUMMARY_H to create vertical space
  //   2. Add more text() calls below using SUMMARY_X + 12 as the left edge
  const SUMMARY_W = 180; // ← Width of the card. Increase if CGPA value is wide.
  const SUMMARY_H = 46; // ← Height of the card. Increase to add more content lines.
  // Right-align the card against the right margin
  const SUMMARY_X = PAGE_W - MARGIN - SUMMARY_W;

  // Card body (navy background)
  drawRect(
    page,
    SUMMARY_X,
    curY - SUMMARY_H,
    SUMMARY_W,
    SUMMARY_H,
    COLOR.primary,
  );
  // Left accent bar on the card (same style as the info card)
  drawRect(page, SUMMARY_X, curY - SUMMARY_H, 3, SUMMARY_H, COLOR.accent);

  // Small uppercase label above the number
  text(
    page,
    "SEMESTER CGPA",
    SUMMARY_X + 12,
    curY - 14,
    fontRegular,
    7,
    rgb(0.78, 0.84, 0.93),
  );

  // Large CGPA value — 18pt bold white text
  // formatCgpa formats the number e.g. 4.5 → "4.50"
  // Change "/ 5.00" if your institution uses a 4.0 scale → "/ 4.00"
  text(
    page,
    `${formatCgpa(semesterCgpa)}  / 5.00`,
    SUMMARY_X + 12,
    curY - 34, // 34pt from top of card = below the label with enough gap
    fontBold,
    18,
    COLOR.white,
  );

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  // A thin bar at the very bottom of the page with disclaimer text and a page number.
  // FOOTER_Y = the height of the footer zone from y=0 (bottom of page).
  const FOOTER_Y = 36; // ← Increase to make the footer taller

  // Footer background (same light gray as the info card)
  drawRect(page, 0, 0, PAGE_W, FOOTER_Y, COLOR.lightBg);

  // Thin top border separating footer from the page content
  drawLine(page, 0, FOOTER_Y, PAGE_W, FOOTER_Y, COLOR.border, 0.5);

  // Disclaimer text — left-aligned, italic, muted
  // Edit this string to change the disclaimer message
  text(
    page,
    "This document is computer-generated and valid without a signature. For verification, visit the FUTO Results Portal.",
    MARGIN,
    14, // 14pt from the absolute bottom of the page
    fontOblique,
    7,
    COLOR.muted,
  );

  // Page number label — right-aligned using the same width-measurement trick as the date
  const pageLabel = "Page 1 of 1";
  const pageLabelW = fontRegular.widthOfTextAtSize(pageLabel, 7);
  text(
    page,
    pageLabel,
    PAGE_W - MARGIN - pageLabelW,
    14,
    fontRegular,
    7,
    COLOR.muted,
  );

  // ── SERIALIZE AND TRIGGER DOWNLOAD ────────────────────────────────────────
  // Convert the PDFDocument object into raw binary bytes (Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // Wrap in a Blob so the browser treats it as a downloadable file
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });

  // Create a temporary in-memory URL pointing to the blob
  const url = URL.createObjectURL(blob);

  // Create an invisible <a> element, programmatically click it to trigger
  // the browser's Save dialog, then immediately remove it from the DOM
  const link = document.createElement("a");
  link.href = url;
  // ↓ Edit this template to change the downloaded filename
  link.download = `${result.session}-${result.semester}-result-slip.pdf`;
  document.body.appendChild(link); // Must be in DOM for Firefox compatibility
  link.click();
  document.body.removeChild(link);

  // Free the object URL from memory — important if users download multiple times
  URL.revokeObjectURL(url);
}

// ─── FALLBACK: INITIALS BADGE ─────────────────────────────────────────────────
// Rendered in the header when no logo image is passed (or logo embedding fails).
// Shows a filled circle with institution initials centered inside.
//
// To change the initials text: edit the `initials` string below.
// To change the circle fill color: replace COLOR.accent with any COLOR.xxx value.
// x, y = the bottom-left of the bounding box for the circle.
// size = the diameter of the circle in points.
function drawInitialsBadge(
  page: PDFPage,
  fontBold: PDFFont,
  x: number,
  y: number,
  size: number,
) {
  // NOTE: drawEllipse positions from the CENTER, not the top-left corner.
  // So center point = (x + size/2, y + size/2)
  // xScale and yScale are the half-widths (radii), not the full diameter
  page.drawEllipse({
    x: x + size / 2, // horizontal center of the circle
    y: y + size / 2, // vertical center of the circle
    xScale: size / 2, // horizontal radius
    yScale: size / 2, // vertical radius
    color: COLOR.accent, // ← Change to COLOR.primary for a darker badge
  });

  const initials = "FRP"; // ← Edit to change the badge text (keep it short, 2–3 chars)
  const iw = fontBold.widthOfTextAtSize(initials, 12);

  page.drawText(initials, {
    // Horizontally center: shift right by (circle diameter - text width) / 2
    x: x + (size - iw) / 2,
    // Vertically center: circle center minus ~5pt to account for text descenders
    // If text looks too high or low, tweak this -5 value
    y: y + size / 2 - 5,
    font: fontBold,
    size: 12, // ← Reduce if using 4+ character initials to avoid overflow
    color: COLOR.white,
  });
}
