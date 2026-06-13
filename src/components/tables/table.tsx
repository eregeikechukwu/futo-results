import {
  AdvisorCourse,
  AdvisorStudent,
  ResultEntry,
} from "@/app/types/advisor";
import { flexRender, Table } from "@tanstack/react-table";
import styles from "./styles.module.scss";

export function TableTemplate<
  T extends AdvisorStudent | AdvisorCourse | ResultEntry,
>({
  table,
  title,
  BATCH_PAGE_SIZE = 20,
  children,
}: {
  table: Table<T>;
  title?: string;
  BATCH_PAGE_SIZE?: number;
  children?: React.ReactNode;
}) {
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  return (
    <div>
      <div className={styles.tableContainer}>
        {title && <div className={styles.tableTitle}>{title}</div>}
        <table className={styles.table}>
          <thead className={styles.thead}>
            {table.getHeaderGroups().map((headerGroup, i) => (
              <tr key={`${headerGroup.id}`}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={styles.th}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {children ? (
            children
          ) : (
            <tbody className={styles.tbody}>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <tr key={row.id} className={`${styles.tr}`}>
                  {row.getVisibleCells().map((cell, i) => (
                    <td key={cell.id} className={styles.td}>
                      {cell.column.id === "rowNumber"
                        ? currentPage * BATCH_PAGE_SIZE + rowIndex + 1
                        : flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <div className={styles.batchPagination}>
        <div className={styles.batchPaginationInfo}>
          Page {currentPage} of {pageCount}
        </div>
        <div className={styles.paginationButtons}>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={styles.paginationBtn}
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={styles.paginationBtn}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/*
export function TableTemplate<T extends AdvisorStudent | AdvisorCourse | ResultEntry>({
  table,
  title,
}: {
  table: Table<T>;
  title?: string;
}) {
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

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
                    header.getContext(),
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
                <td key={cell.id} className="py-16 px-24 max-w-60 truncate">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      // {/* Pagination 
      <div className="w-full p-20 flex items-center justify-between">
        <div>
          Page {currentPage} of {pageCount}
        </div>

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
 */
