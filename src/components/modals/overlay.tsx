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
  const [stallState, setStallState] = useState(true);

  useEffect(() => {
    setStallState(stall);
  }, [stall]);

  return (
    <div className={`modal ${!state ? "!hidden" : ""}`}>
      <div
        className={`modal-content ${
          withTemplate ? "modal-content-styled" : ""
        }`}
      >
        <div className="flex justify-between relative">
          <span className="text-medium">{title}</span>
          <div
            className={`transition-all duration-1000 ${
              !withTemplate
                ? "p-8 center-child rounded-full bg-white absolute -top-10 left-1/2"
                : ""
            } ${stallState ? "opacity-0" : "opacity-100"} `}
          >
            <X
              className={`text-[var(--color-text-link)]  cursor-pointer `}
              size={20}
              onClick={toggleModal}
            />
          </div>
        </div>
        <div>{children}</div>
      </div>
      <div onClick={toggleModal}>
        <Overlay />
      </div>
    </div>
  );
}

export function Overlay() {
  return (
    <div className="fixed inset-0 z-50 min-w-screen min-h-screen bg-gray-600 opacity-50 " />
  );
}

export function useModalTemplate(stall = false, withTemplate = true) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModalMain = useCallback(() => {
    setIsModalOpen((prev) => {
      // If stall is true and modal is open, don't close it
      // Otherwise toggle normally
      return !prev;
    });
  }, [stall]); // stall in dependency array

  // const Modal = useMemo(
  //   () =>
  function ModalTemplate({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) {
    return (
      <div>
        <Modal
          title={title}
          withTemplate={withTemplate}
          stall={stall}
          toggleModal={toggleModalMain}
          state={isModalOpen}
        >
          {children}
        </Modal>
      </div>
    );
  }

  //   [isModalOpen, toggleModal] // toggleModal is now properly updated when stall changes
  // );
  return {
    ModalTemplate,
    isModalOpen,
    setIsModalOpen,
    toggleModal: toggleModalMain,
  };
}
