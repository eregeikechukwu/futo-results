import { useEffect, useRef } from "react";

type ConfirmModalVariant = "danger" | "warning" | "info";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles: Record<
  ConfirmModalVariant,
  {
    iconBg: string;
    iconColor: string;
    confirmBg: string;
    confirmText: string;
    confirmHover: string;
    icon: string;
  }
> = {
  danger: {
    iconBg: "#FEE2E2",
    iconColor: "#DC2626",
    confirmBg: "#DC2626",
    confirmText: "#ffffff",
    confirmHover: "#B91C1C",
    icon: "⚠",
  },
  warning: {
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    confirmBg: "#D97706",
    confirmText: "#ffffff",
    confirmHover: "#B45309",
    icon: "!",
  },
  info: {
    iconBg: "#DBEAFE",
    iconColor: "#2563EB",
    confirmBg: "#2563EB",
    confirmText: "#ffffff",
    confirmHover: "#1D4ED8",
    icon: "i",
  },
};

export default function ConfirmModal({
  open,
  title = "Confirm action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const v = variantStyles[variant];

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        padding: "1rem",
        animation: "fadeOverlay 0.15s ease",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          padding: "1.75rem 1.5rem 1.25rem",
          width: "100%",
          maxWidth: "380px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          animation: "scaleIn 0.15s ease",
        }}
      >
        {/* Icon */}
        <div
          aria-hidden="true"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            backgroundColor: v.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
            fontSize: "18px",
            fontWeight: 700,
            color: v.iconColor,
            fontFamily: "Georgia, serif",
            userSelect: "none",
          }}
        >
          {v.icon}
        </div>

        {/* Title */}
        <p
          id="confirm-modal-title"
          style={{
            margin: "0 0 6px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#111827",
          }}
        >
          {title}
        </p>

        {/* Message */}
        <p
          style={{
            margin: "0 0 1.5rem",
            fontSize: "14px",
            color: "#6B7280",
            lineHeight: 1.6,
          }}
        >
          Are you sure you want to{" "}
          <strong style={{ color: "#374151", fontWeight: 500 }}>
            {message}
          </strong>
          ? This action cannot be undone.
        </p>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "#F3F4F6",
            marginBottom: "1.25rem",
          }}
        />

        {/* Actions */}
        <div
          style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
        >
          <button
            ref={cancelRef}
            onClick={onCancel}
            style={{
              fontSize: "13px",
              fontWeight: 500,
              padding: "8px 18px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              backgroundColor: "#ffffff",
              color: "#374151",
              transition: "background 0.12s, transform 0.1s",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#F9FAFB")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#ffffff")
            }
            onMouseDown={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.transform =
                "scale(0.98)")
            }
            onMouseUp={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)")
            }
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              fontSize: "13px",
              fontWeight: 500,
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: v.confirmBg,
              color: v.confirmText,
              transition: "background 0.12s, transform 0.1s",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                v.confirmHover)
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                v.confirmBg)
            }
            onMouseDown={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.transform =
                "scale(0.98)")
            }
            onMouseUp={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)")
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ─── Usage example ───────────────────────────────────────────────────────────

import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Delete record</button>

      <ConfirmModal
        open={open}
        title="Delete student record"
        message="delete this student record permanently"
        confirmLabel="Yes, delete"
        variant="danger"
        onConfirm={() => {
          // your logic here
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

─────────────────────────────────────────────────────────────────────────────── */
