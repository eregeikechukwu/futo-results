import { AdvisorCourse, AdvisorStudent } from "@/app/types/advisor";
import { Table } from "@tanstack/react-table";
import { RefreshCcw, Search } from "lucide-react";
import React from "react";

type ControlProps = {
  table: Table<AdvisorStudent> | Table<AdvisorCourse>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  resetFilters: () => void;
  loading?: boolean;
  error?: string;
  utils: {
    searchTitle: string;
    placeholder: string;
    optionTilte: string;
    options: {
      value: string;
      title: string;
    }[];
  };
};

export function TableControls({
  table,
  globalFilter,
  setGlobalFilter,
  resetFilters,
  loading = false,
  error,
  utils,
}: ControlProps) {
  //style consistency varibles
  const controlheightDesktop = "h-46";

  //Paginatin final page
  const isLastPage =
    table.getPageCount() === table.getState().pagination.pageIndex + 1;

  /*
  const utils =
    type === "students"
      ? {
          searchTitle: "Search Students",
          placeholder: "Name, reg number, or join date",
          optionTilte: "Status",
          options: [
            { value: "", title: "All Status" },
            { value: "flagged", title: "Flagged" },
            { value: "pending", title: "Pending" },
          ],
        }
      : {
          searchTitle: "Search Courses",
          placeholder: "Course code or tilte",
          optionTilte: "Session",
          options: [
            { value: "", title: "All Status" },
            { value: "flagged", title: "Flagged" },
            { value: "pending", title: "Pending" },
          ],
        };
*/

  return (
    <div className="dashboard-container mb-32 grid grid-cols-3 gap-16 items-center">
      {/* Search */}
      <div>
        <label
          htmlFor="search"
          className="secondary-heading text-[var(--color-text-dark)]"
        >
          {utils.searchTitle}
        </label>
        <div className={`relative h-46  mt-8 input-height`}>
          <div className="center-child h-full bottom-0 left-0 top-0  absolute text-[#9ca3af] p-12">
            <Search size={18} />
          </div>
          <input
            id="search"
            type="text"
            placeholder={`${utils.placeholder}`}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full py-12 pl-40 pr-12 rounded-small border-light secondary-heading input"
          />
        </div>
      </div>

      {/* Filter */}
      <div>
        <label
          htmlFor={`${utils.optionTilte.toLowerCase()}`}
          className="secondary-heading text-[var(--color-text-dark)]"
        >
          {utils.optionTilte}
        </label>
        <div className="input-height">
          <select
            id={`${utils.optionTilte.toLowerCase()}`}
            onChange={(e) => {
              console.log(e.target.value);
              return table
                .getColumn(utils.optionTilte.toLowerCase())
                ?.setFilterValue(e.target.value);
            }}
            value={
              table
                .getColumn(utils.optionTilte.toLowerCase())
                ?.getFilterValue()
                ?.toString() ?? ""
            }
            className="w-full mt-8 py-12 pl-12 pr-12 border-light secondary-heading input"
          >
            {loading ? (
              <option>Loading...</option>
            ) : error ? (
              <option>Error loading options</option>
            ) : (
              utils.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.title}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={resetFilters}
        className={`input-height group h-46 !mt-auto flex rounded-small gap-8 center-child text-[var(--color-text-dark)] font-medium bg-[var(--color-background-mild)] hover:bg-gray-300 transition`}
      >
        <RefreshCcw
          size={17}
          className="group-hover:rotate-[30deg] transition"
        />{" "}
        Reset Filters
      </button>
    </div>
  );
}
