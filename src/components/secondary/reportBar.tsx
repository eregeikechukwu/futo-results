"use client";

import { colorMap } from "@/utils/colorMaps";
import { Edit } from "lucide-react";
import Image from "next/image";
import { useModalTemplate } from "../modals/overlay";
import { ImageModal } from "../modals/ImageModal";

const div1Styles =
  "bg-[var(--color-background-secondary)] p-16 justify-between-center rounded-[0.75rem] lh-24 ";
const div1_2Styles = "flex items-center gap-12";
const div1_3Styles =
  "block h-12 w-12 rounded-full secondary-heading font-semibold mb-2";
const div2Styles = "py-4 px-8 center-child rounded-full text-small font-medium";
const h3Styles = "block secondary-heading font-semibold mb-2";

export default function ReportBar({
  title,
  color,
  coursecode,
  date,
  status,
}: {
  title: string;
  color: "green" | "red" | "brown";
  coursecode: string;
  date: string;
  status: string;
}) {
  const colors = colorMap[color] || colorMap["green"];

  return (
    <div className={`${div1Styles}`}>
      <div className={`${div1_2Styles}`}>
        <div
          className={`${div1_3Styles}`}
          style={{ backgroundColor: colors.colour }}
        />

        <div>
          <h3 className={`${h3Styles}`}>{title}</h3>
          <p className="text-small-passive">
            {coursecode} &bull; {date}
          </p>
        </div>
      </div>

      <div
        className={`${div2Styles}`}
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {status}
      </div>
    </div>
  );
}

export function RecentResultReportBar({
  title,
  color,
  coursecode,
  date,
  img,
  onClick,
}: {
  title: string;
  color?: "green" | "red" | "brown";
  coursecode: string;
  date: string;
  img: string;
  onClick?: () => void;
}) {
  const colors = colorMap[color || "green"];

  const { isModalOpen, toggleModal, ModalTemplate } = useModalTemplate(false);

  return (
    <>
      <div>
        <div className={`${div1Styles}`}>
          <div className={`${div1_2Styles}`}>
            <div
              className={`${div1_3Styles}`}
              style={{ backgroundColor: colors.colour }}
            />

            <div>
              <h3 className={`${h3Styles}`}>{title}</h3>
              <p className="text-small-passive">
                {coursecode} &bull; {date}
              </p>
            </div>
          </div>

          <div className={`${div2Styles} flex items-center gap-18`}>
            <button
              onClick={onClick}
              className="relative group h-30 w- 30 center-child hover:bg-[var(--color-background-secondary)] rounded-full transition-colors cursor-pointer"
            >
              <Edit
                className="group-active:text-black/60 transition"
                size={16}
              />
              <div className="absolute bottom-full right-full p-20 opacity-50 text-nowrap bg-black/0 group-hover:bg-black/70 text-white duration-[300ms]">
                Edit Result
              </div>
            </button>
            <div
              className="h-50 group relative w-50 rounded-[5px] overflow-hidden hover:bg-blend-darken cursor-pointer after:"
              onClick={toggleModal}
            >
              <Image
                alt="result sheet"
                height={50}
                width={50}
                className="object-contain w-auto h-auto"
                src={img}
              />

              {/* hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50  transition-opacity duration-300 center-child">
                <span className="text-white -translate-x-10 group-hover:translate-0 transition ease-out">
                  View
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IMage viewer modal */}
      <ModalTemplate title={title}>
        <ImageModal imageUrl={img} onClose={toggleModal} />
      </ModalTemplate>
    </>
  );
}
