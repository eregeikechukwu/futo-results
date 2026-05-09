"use client";

import { ScifiBackground } from "@/helpers/scifiBackground";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface AdvisorInviteData {
  fullName: string;
  email: string;
  title: string;
  departmentId: string;
  admissionYear: number;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

// ── MODIFY HERE: Replace with your real departments fetched from Supabase ──
// e.g. const { data } = await supabase.from('departments').select('id, name');

// ── MODIFY HERE: Adjust the range to match your university's admission years ──
const CURRENT_YEAR = new Date().getFullYear();
const admissionYearS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

const TITLES = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms.", "Engr."];

// ─────────────────────────────────────────────────────────────────────────────
// TOAST  (inline — no external lib)
// ─────────────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | null;

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!type) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        padding: "14px 22px",
        borderRadius: 4,
        fontFamily: '"Share Tech Mono", monospace',
        fontSize: 13,
        letterSpacing: "0.05em",
        color: type === "success" ? "#4ade80" : "#f87171",
        background:
          type === "success" ? "rgba(0,15,30,0.95)" : "rgba(20,5,5,0.95)",
        border: `1px solid ${type === "success" ? "rgba(74,222,128,0.5)" : "rgba(248,113,113,0.5)"}`,
        boxShadow:
          type === "success"
            ? "0 0 20px rgba(74,222,128,0.15)"
            : "0 0 20px rgba(248,113,113,0.15)",
        animation: "toastIn 0.3s ease",
      }}
    >
      {type === "success" ? "▶ TRANSMISSION_OK — " : "✕ ERROR — "}
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label,
  id,
  children,
  glyph,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  glyph: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "#60a5fa",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ opacity: 0.5 }}>{glyph}</span> {label}
      </label>
      {children}
    </div>
  );
}

// shared input / select styles
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(4,20,50,0.7)",
  border: "1px solid rgba(37,99,235,0.35)",
  borderRadius: 3,
  color: "#e2e8f0",
  fontFamily: '"Share Tech Mono", monospace',
  fontSize: 14,
  padding: "11px 14px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function InviteAdvisorPage() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<AdvisorInviteData>({
    fullName: "",
    email: "",
    title: "",
    departmentId: "",
    admissionYear: CURRENT_YEAR,
  });
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: ToastType }>({
    msg: "",
    type: null,
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch departments from Supabase on mount
  useEffect(() => {
    async function fetchDepartments() {
      const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from("departments")
        .select("id, name, code")
        .order("name");

      if (error) {
        setToast({
          msg: "Failed to load departments: " + error.message,
          type: "error",
        });
        setIsFetching(false);
        setError(true);
        return;
      }

      setDepartments(data);
      setIsFetching(false);
      setError(false);
    }

    fetchDepartments();
  }, []);

  const closeToast = useCallback(() => setToast({ msg: "", type: null }), []);

  // ── Field change handler ─────────────────────────────────────────────────
  const set =
    (key: keyof AdvisorInviteData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({
        ...f,
        [key]:
          key === "admissionYear" ? Number(e.target.value) : e.target.value,
      }));

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("Submitting invite with data:", form);

    try {
      // ── MODIFY HERE: This hits your Next.js route handler at /api/invite-advisor ──
      // The route handler should call supabase.auth.admin.inviteUserByEmail()
      // and then insert a row into your advisor_profiles / advisor_assignments table.
      const res = await fetch("/api/invite-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error ?? "Unknown error");

      setToast({ msg: `Invite dispatched to ${form.email}`, type: "success" });
      setSubmitted(true);

      // ── MODIFY HERE: Reset the form after success if you prefer ──
      setForm({
        fullName: "",
        email: "",
        title: "",
        departmentId: "",
        admissionYear: CURRENT_YEAR,
      });
      setSubmitted(false);
    } catch (err: any) {
      setToast({ msg: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── Derived: is the form fully filled? ──────────────────────────────────
  const isValid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.title &&
    form.departmentId &&
    form.admissionYear;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Google Fonts — Share Tech Mono for the sci-fi monospace feel */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #010b18; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes panelIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        @keyframes glitch {
          0%,100% { clip-path: inset(0 0 98% 0); transform: translate(-2px,0); }
          20%      { clip-path: inset(30% 0 50% 0); transform: translate(2px,0); }
          40%      { clip-path: inset(60% 0 20% 0); transform: translate(-1px,0); }
          60%      { clip-path: inset(10% 0 80% 0); transform: translate(1px,0); }
          80%      { clip-path: inset(80% 0 5%  0); transform: translate(0,0); }
        }

        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0; }
        }

        @keyframes successPulse {
          0%   { box-shadow: 0 0 0   0   rgba(74,222,128,0.4); }
          70%  { box-shadow: 0 0 0   20px rgba(74,222,128,0); }
          100% { box-shadow: 0 0 0   0   rgba(74,222,128,0); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .sci-input:focus {
          border-color: rgba(37,99,235,0.9) !important;
          box-shadow:   0 0 0 2px rgba(37,99,235,0.2), 0 0 18px rgba(37,99,235,0.15) !important;
        }

        .sci-input::placeholder { color: rgba(100,130,180,0.4); }

        .sci-input option { background: #020d1f; color: #e2e8f0; }

        .submit-btn {
          cursor:         pointer;
          background:     linear-gradient(135deg, rgba(37,99,235,0.9), rgba(29,78,216,0.9));
          border:         1px solid rgba(96,165,250,0.6);
          color:          #fff;
          font-family:    "Orbitron", monospace;
          font-size:      12px;
          font-weight:    700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding:        16px 0;
          border-radius:  3px;
          width:          100%;
          transition:     all 0.2s;
          position:       relative;
          overflow:       hidden;
        }

        .submit-btn::before {
          content:    '';
          position:   absolute;
          inset:      0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity:    0;
          transition: opacity 0.2s;
        }

        .submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .submit-btn:hover:not(:disabled) {
          box-shadow:   0 0 30px rgba(37,99,235,0.5);
          border-color: rgba(147,197,253,0.8);
        }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .success-panel {
          animation: successPulse 0.8s ease-out;
        }
      `}</style>

      <ScifiBackground />

      <Toast message={toast.msg} type={toast.type} onClose={closeToast} />

      {/* ── Page wrapper ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
          fontFamily: '"Share Tech Mono", monospace',
        }}
      >
        {/* ── Glass panel ── */}
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "rgba(1,14,35,0.82)",
            border: "1px solid rgba(37,99,235,0.3)",
            borderRadius: 6,
            backdropFilter: "blur(18px)",
            boxShadow:
              "0 0 80px rgba(37,99,235,0.12), 0 0 1px rgba(37,99,235,0.4) inset",
            animation: "panelIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              padding: "28px 32px 24px",
              borderBottom: "1px solid rgba(37,99,235,0.2)",
              position: "relative",
            }}
          >
            {/* Glitch accent bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 32,
                right: 32,
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, #2563eb, #60a5fa, transparent)",
              }}
            />

            {/* System label */}
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                color: "rgba(37,99,235,0.7)",
                marginBottom: 10,
              }}
            >
              FUTO_PORTAL // ADMIN_CONSOLE // v2.1.0
            </div>

            {/* Main title with glitch layers */}
            <div style={{ position: "relative", display: "inline-block" }}>
              <h1
                style={{
                  fontFamily: '"Orbitron", monospace',
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#e2e8f0",
                  letterSpacing: "0.08em",
                }}
              >
                ADVISOR UPLINK
              </h1>
              {/* Glitch overlay layers */}
              {["#ff006620", "#00ffff18"].map((c, i) => (
                <h1
                  key={i}
                  aria-hidden
                  style={{
                    fontFamily: '"Orbitron", monospace',
                    fontSize: 22,
                    fontWeight: 900,
                    color: c,
                    letterSpacing: "0.08em",
                    position: "absolute",
                    top: 0,
                    left: i === 0 ? 2 : -2,
                    animation: `glitch ${2.5 + i * 0.7}s infinite`,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  ADVISOR UPLINK
                </h1>
              ))}
            </div>

            <p
              style={{
                marginTop: 8,
                fontSize: 11,
                letterSpacing: "0.12em",
                color: "rgba(148,163,184,0.7)",
              }}
            >
              INITIATE INVITE SEQUENCE — NEW FACULTY NODE
            </p>

            {/* Blinking cursor */}
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 14,
                background: "#2563eb",
                marginLeft: 4,
                verticalAlign: "middle",
                animation: "blink 1s step-end infinite",
              }}
            />
          </div>

          {/* ── Form body ── */}
          {submitted ? (
            /* ── Success state ── */
            <div
              className="success-panel"
              style={{
                padding: "56px 32px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  border: "2px solid #4ade80",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  color: "#4ade80",
                  boxShadow: "0 0 30px rgba(74,222,128,0.3)",
                }}
              >
                ✓
              </div>
              <div
                style={{
                  fontFamily: '"Orbitron", monospace',
                  fontSize: 14,
                  letterSpacing: "0.2em",
                  color: "#4ade80",
                }}
              >
                TRANSMISSION COMPLETE
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(148,163,184,0.7)",
                  letterSpacing: "0.1em",
                }}
              >
                INVITE DISPATCHED TO
                <br />
                <span style={{ color: "#93c5fd" }}>{form.email}</span>
              </div>
              <button
                className="submit-btn"
                style={{ marginTop: 8, maxWidth: 240 }}
                onClick={() => {
                  setSubmitted(false);
                  // ── MODIFY HERE: decide whether to wipe the form on "new invite" ──
                  setForm({
                    fullName: "",
                    email: "",
                    title: "",
                    departmentId: "",
                    admissionYear: CURRENT_YEAR,
                  });
                }}
              >
                ＋ NEW INVITE
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                padding: "28px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* ── Full Name ── */}
              <Field label="Full Name" id="fullName" glyph="◈">
                <input
                  id="fullName"
                  className="sci-input"
                  type="text"
                  placeholder="e.g. Chukwuemeka Obi"
                  value={form.fullName}
                  onChange={set("fullName")}
                  onFocus={() => setFocusedField("fullName")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={inputStyle}
                  // ── MODIFY HERE: add maxLength or pattern if your DB has constraints ──
                />
              </Field>

              {/* ── Email ── */}
              <Field label="Institutional Email" id="email" glyph="◉">
                <input
                  id="email"
                  className="sci-input"
                  type="email"
                  placeholder="advisor@futo.edu.ng"
                  value={form.email}
                  onChange={set("email")}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={inputStyle}
                  // ── MODIFY HERE: enforce domain pattern if only @futo.edu.ng is allowed ──
                  // pattern=".*@futo\.edu\.ng$"
                />
              </Field>

              {/* ── Title + Department (2-col grid) ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.8fr",
                  gap: 16,
                }}
              >
                {/* Title */}
                <Field label="Title" id="title" glyph="◇">
                  <select
                    id="title"
                    className="sci-input"
                    value={form.title}
                    onChange={set("title")}
                    onFocus={() => setFocusedField("title")}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={{
                      ...inputStyle,
                      appearance: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="" disabled>
                      —
                    </option>
                    {/* ── MODIFY HERE: add/remove titles to match your university norms ── */}
                    {TITLES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Department */}
                <Field label="Department" id="departmentId" glyph="◫">
                  {isFetching ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                        fontSize: 12,
                        color: "rgba(148,163,184,0.7)",
                      }}
                    >
                      Fetching departments...
                    </div>
                  ) : error ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: 12,
                        height: "100%",
                        color: "rgba(220,38,38,0.7)",
                      }}
                    >
                      Error fetching departments
                    </div>
                  ) : (
                    <select
                      id="departmentId"
                      className="sci-input"
                      value={form.departmentId}
                      onChange={set("departmentId")}
                      onFocus={() => setFocusedField("departmentId")}
                      onBlur={() => setFocusedField(null)}
                      required
                      style={{
                        ...inputStyle,
                        appearance: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="" disabled>
                        Select dept…
                      </option>
                      {/*
                      ── MODIFY HERE: Replace DEPARTMENTS constant above with a
                         useEffect that fetches from /api/departments or directly
                         from your Supabase client:
                         const { data } = await supabase.from('departments').select('id, name');
                    ──*/}
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>

              {/* ── Admission Year ── */}
              <Field
                label="Assigned Student Set (Admission Year)"
                id="admissionYear"
                glyph="◌"
              >
                <select
                  id="admissionYear"
                  className="sci-input"
                  value={form.admissionYear}
                  onChange={set("admissionYear")}
                  onFocus={() => setFocusedField("admissionYear")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{
                    ...inputStyle,
                    appearance: "none",
                    cursor: "pointer",
                  }}
                >
                  {/*
                    ── MODIFY HERE: Adjust admissionYearS range (currently last 10 years).
                       This value maps to advisor_assignments.admissionYear in your DB.
                  ──*/}
                  {admissionYearS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </Field>

              {/* ── Data preview row ── */}
              {(form.fullName || form.email) && (
                <div
                  style={{
                    background: "rgba(37,99,235,0.05)",
                    border: "1px solid rgba(37,99,235,0.2)",
                    borderRadius: 3,
                    padding: "10px 14px",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    color: "rgba(148,163,184,0.8)",
                    lineHeight: 1.8,
                  }}
                >
                  <span style={{ color: "#60a5fa" }}>PAYLOAD_PREVIEW</span>
                  <br />
                  {form.title && form.fullName && (
                    <>
                      {form.title} {form.fullName}
                      <br />
                    </>
                  )}
                  {form.email && (
                    <>
                      {form.email}
                      <br />
                    </>
                  )}
                  {form.departmentId && (
                    <>
                      DEPT:{" "}
                      {
                        departments.find((d) => d.id === form.departmentId)
                          ?.name
                      }
                      <br />
                    </>
                  )}
                  {form.admissionYear && <>SET: {form.admissionYear}</>}
                </div>
              )}

              {/* ── Submit ── */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !isValid}
              >
                {loading ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 14,
                        height: 14,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid #fff",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    TRANSMITTING…
                  </span>
                ) : (
                  "⟶ DISPATCH INVITE"
                )}
              </button>

              {/* Footer meta */}
              <div
                style={{
                  textAlign: "center",
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  color: "rgba(71,85,105,0.8)",
                  paddingTop: 4,
                }}
              >
                SECURED CHANNEL · SUPABASE ADMIN INVITE · FUTO_PORTAL
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
