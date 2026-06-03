import React, { Dispatch, useEffect, useRef, useState } from "react";
import ConfirmInput from "./confirmInput";
import { LoaderSpinner2, LoaderSpinner3 } from "./loaders/loaders";
import toast from "react-hot-toast";

type ConfirmModalVariant = "danger" | "warning" | "info";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  onConfirm: () => void;
  isMutating?: boolean;
  onCancel: () => void;
  setConfirmAction?: Dispatch<React.SetStateAction<boolean>>;
  actionConfirmValue?: string;
  value?: "result" | "course" | "student" | null;
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

function ConfirmModal({
  open,
  title = "Confirm action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  children,
  variant = "danger",
  isMutating = false,
  onConfirm,
  onCancel,
  setConfirmAction,
  actionConfirmValue,
  value = null,
}: ConfirmModalProps) {
  const [actionConfirmInput, setActionConfirmInput] = useState("");
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

  // set the confirm action state
  useEffect(() => {
    if (!setConfirmAction) return;
    if (actionConfirmInput === actionConfirmValue) {
      setConfirmAction(true);
    } else {
      setConfirmAction(false);
    }
  }, [actionConfirmInput]);

  // if (!open) return null;
  const onConfirmFn = () => {
    if (actionConfirmInput === actionConfirmValue) {
      setActionConfirmInput("");
      onConfirm();
    } else
      toast.error(
        `${value === "result" || value === "student" ? "Reg Number" : "Course code"} doesnt match`,
      );
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className={`fixed inset-0 z-50 items-center justify-center bg-black/35 p-[1rem] animate-[fadeOverlay_0.15s_ease] ${
        open ? "flex" : "hidden"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="
    flex w-full max-w-[380px] flex-col
    rounded-[16px]
    border border-[#E5E7EB]
    bg-white
    px-[1.5rem]
    pt-[1.75rem]
    pb-[1.25rem]
    animate-[scaleIn_0.15s_ease]
  "
      >
        {/* Icon */}
        <div
          aria-hidden="true"
          className="
    mb-[1rem]
    flex h-[44px] w-[44px]
    select-none items-center justify-center
    rounded-full
    text-[18px]
    font-bold
  "
          style={{
            backgroundColor: v.iconBg,
            color: v.iconColor,
            fontFamily: "Georgia, serif",
          }}
        >
          {v.icon}
        </div>

        {/* Title */}
        <p
          id="confirm-modal-title"
          className="
    mb-[0.375rem]
    text-[16px]
    font-semibold
    text-gray-900
  "
        >
          {title}
        </p>
        {/* Message */}
        <p
          className="
    mb-[1.5rem]
    text-[14px]
    leading-[1.6]
    text-gray-500
  "
        >
          Are you sure you want to{" "}
          <strong className="font-medium text-gray-700">{message}</strong>? This
          action cannot be undone.
        </p>

        {/* Divider */}
        <div
          className="
    mb-[1.25rem]
    h-px
    bg-gray-100
  "
        />
        {/* Confirmation Input */}
        {actionConfirmValue && (
          <ConfirmInput
            value={value || ""}
            deleteConfirmValue={actionConfirmValue}
            deleteConfirmInput={actionConfirmInput}
            setDeleteConfirmInput={setActionConfirmInput}
          />
        )}

        {/* Actions */}
        <div className="flex justify-end gap-[0.5rem]">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="
    rounded-[8px]
    border border-[#E5E7EB]
    bg-white
    px-[1.125rem]
    py-[0.5rem]
    text-[13px]
    font-medium
    text-gray-700
    transition-all
    hover:bg-gray-50
    active:scale-[0.98]
  "
          >
            {cancelLabel}
          </button>
          {/* Confirm btn */}
          <button
            onClick={onConfirmFn}
            disabled={isMutating}
            className="flex gap-8 items-center
rounded-[8px] border-0 px-[1.125rem] py-[0.5rem] text-[13px] font-medium transition-all active:scale-[0.98]
    disabled:opacity-50  disabled:cursor-not-allowed "
            style={{
              backgroundColor: v.confirmBg,
              color: v.confirmText,
            }}
          >
            {confirmLabel}
            {isMutating && <LoaderSpinner3 size={10} />}
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

export default React.memo(ConfirmModal);

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
