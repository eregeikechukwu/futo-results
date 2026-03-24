import { SemesterResult } from "./types";
import { formatCgpa } from "@/utils/systemUtils";

function escapeHtml(value: string): string {
  // Escapes dynamic values before injecting into the print template.
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildResultPdfTemplate(
  result: SemesterResult,
  semesterCgpa: number,
): string {
  const rowsHtml = result.courses
    .map(
      (course) => `
        <tr>
          <td>${escapeHtml(course.courseCode)}</td>
          <td>${escapeHtml(course.courseTitle)}</td>
          <td>${course.unit}</td>
          <td>${course.test}</td>
          <td>${course.lab}</td>
          <td>${course.exam}</td>
          <td>${course.total}</td>
          <td><strong>${course.grade}</strong></td>
        </tr>
      `,
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Result Slip - ${escapeHtml(result.label)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
          .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .logo {width: 400px }
          .portal { color: #4b5563; font-size: 13px; }
          .meta { margin-bottom: 16px; }
          .meta p { margin: 4px 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #f3f4f6; text-transform: uppercase; }
          .cgpa { margin-top: 12px; font-weight: 700; }
          .footer { margin-top: 18px; font-size: 12px; color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="top">
          <div>
            <img src="logo.svg" class="logo" />
            <div class="portal">Academic performance management platform</div>
          </div>
          <div>${new Date().toLocaleDateString()}</div>
        </div>

        <div class="meta">
          <p><strong>Student:</strong> ${escapeHtml(result.student.name)}</p>
          <p><strong>Reg Number:</strong> ${escapeHtml(result.student.regNumber)}</p>
          <p><strong>Department:</strong> ${escapeHtml(result.student.department)}</p>
          <p><strong>Level:</strong> ${escapeHtml(result.student.level)}</p>
          <p><strong>Session:</strong> ${escapeHtml(result.session)} (${escapeHtml(result.semester)})</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Unit</th>
              <th>Test</th>
              <th>Lab</th>
              <th>Exam</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        <p class="cgpa">Semester CGPA: ${formatCgpa(semesterCgpa)} / 5.00</p>
        <p class="footer">Genated from FUTO Results Portal. Code by <a>Nelson Erege</a></p>
      </body>
    </html>
  `;
}
