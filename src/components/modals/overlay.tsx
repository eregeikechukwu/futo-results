"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function Modal({
  children,
  title,
  state,
  withTemplate,
  stall,
  toggleModal,
}: {
  children: React.ReactNode;
  title?: string;
  state?: boolean;
  withTemplate: boolean;
  toggleModal: () => void;
  stall: boolean;
}) {
  const [stallState, setStallState] = useState(stall);

  useEffect(() => {
    setStallState(stall);
  }, [stall]);

  // Prevent closing with Escape when stalled; allow when not stalled
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && state && !stallState) {
        toggleModal();
      }
    }

    if (state) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [state, stallState, toggleModal]);

  return (
    <div
      className={`modal fixed inset-0 z-50 flex items-center justify-center ${
        !state ? "pointer-events-none hidden" : "block"
      }`}
      aria-hidden={!state}
    >
      <div
        className={`modal-content ${
          withTemplate ? "modal-content-styled" : ""
        } transition-transform duration-300 ease-out transform ${
          state ? "opacity-100 block opacity-in" : "opacity-0 hidden"
        }`}
      >
        <div className="flex justify-between relative">
          {title && <span className="text-medium">{title}</span>}
          {!stallState && (
            <div
              className={`transition-all duration-300 ${
                !withTemplate
                  ? "p-8 center-child rounded-full bg-white absolute -top-10 left-1/2"
                  : ""
              } opacity-100 `}
            >
              <X
                className={`text-(--color-text-link)  cursor-pointer `}
                size={20}
                onClick={toggleModal}
              />
            </div>
          )}
        </div>
        <div>{children}</div>
      </div>

      <div
        onClick={() => {
          if (!stallState && state) toggleModal();
        }}
        className={`absolute inset-0 z-40`}
      >
        <Overlay active={state} />
      </div>
    </div>
  );
}

export function Overlay({ active = true }: { active?: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-40 min-w-screen min-h-screen bg-gray-600 transition-opacity duration-400  ${
        active ? "opacity-70" : "opacity-0 pointer-events-none"
      }`}
    />
  );
}

export function useModalTemplate(stall = false) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModalMain = useCallback(() => {
    setIsModalOpen((prev) => {
      // If modal is open and stall is true, don't close it
      if (prev && stall) return prev;
      return !prev;
    });
  }, [stall]);

  // const Modal = useMemo(
  //   () =>

  const ModalTemplate = useCallback(
    ({ children, title }: { children: React.ReactNode; title?: string }) => (
      <Modal
        title={title}
        withTemplate={true}
        stall={stall}
        toggleModal={toggleModalMain}
        state={isModalOpen}
      >
        {children}
      </Modal>
    ),
    [isModalOpen, stall, toggleModalMain],
  );

  return {
    ModalTemplate,
    isModalOpen,
    setIsModalOpen,
    toggleModal: toggleModalMain,
  };
}
