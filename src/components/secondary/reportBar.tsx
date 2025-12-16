import { colorMap } from "@/utils/colorMaps";

export default function ReportBar({
  title,
  color,
  items,
  date,
  status,
}: {
  title: string;
  color: "green" | "red" | "brown";
  items: string;
  date: string;
  status: string;
}) {
  const colors = colorMap[color] || colorMap["green"];

  return (
    <div className="bg-[var(--color-background-secondary)] p-16 justify-between-center rounded-[0.75rem] lh-24 ">
      <div className="flex items-center gap-12">
        <div
          className="w-12 h-12 rounded-full"
          style={{ backgroundColor: colors.colour }}
        />
        <div>
          <h3 className="block secondary-heading font-semibold mb-2">
            {title}
          </h3>
          <p className="text-small-passive">
            {items} &bull; {date}
          </p>
        </div>
      </div>

      <div
        className="py-4 px-8 center-child rounded-full text-small font-medium"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {status}
      </div>
    </div>
  );
}
