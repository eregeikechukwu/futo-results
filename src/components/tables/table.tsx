import { AdvisorCourse, AdvisorStudent } from "@/app/types/advisor";
import { flexRender, Table } from "@tanstack/react-table";

export function TableTemplate<T extends AdvisorStudent | AdvisorCourse>({
  table,
  title,
}: {
  table: Table<T>;
  title?: string;
}) {
  return (
    <div className="border-light rounded-[24px]">
      {title && (
        <div className="px-24 py-16 rounded-t-[inherit] border-b-[inherit] border-b-1 bg-[var(--color-white)] text-medium">
          {title}
        </div>
      )}
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.column.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-16 px-24 ">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="w-full p-20">
        <div className="flex justify-between gap-8 ">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className=" cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
