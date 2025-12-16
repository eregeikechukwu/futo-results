"use client";
import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  ColumnFilter,
  SortingState,
} from "@tanstack/react-table";
import { AdvisorStudent } from "@/app/types/advisor";
import { advisorStudents } from "@/mock/advisorStudents";
import { ArrowUpDown, Flag, FlagOff, Trash2 } from "lucide-react";
import { colorMap } from "@/utils/colorMaps";
import { TableControls } from "./common";
import { TableTemplate } from "./table";
import { Overlay } from "../modals/overlay";

export function AdvisorStudentsTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "studentInfo",
      desc: false,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);

  const columns: ColumnDef<AdvisorStudent>[] = [
    {
      accessorKey: "studentInfo",
      accessorFn: (row: AdvisorStudent) => row.name,
      header: ({ column }) => (
        <button
          className="flex items-center gap-8 active:text-[var(--color-text-link)]"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          STUDENT INFO <ArrowUpDown size={12} />
        </button>
      ),
      cell: ({ row }: { row: { original: AdvisorStudent } }) => (
        <div className="flex flex-col ">
          <span className="font-medium ">{row.original.name}</span>
          <span className="text-[var(--color-text-passive)]">
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "regNumber",
      header: "REG NUMBER",
      cell: ({ row }: { row: { original: AdvisorStudent } }) => (
        <p className="font-mono">{row.original.regNumber}</p>
      ),
    },
    {
      header: "STATUS",
      accessorKey: "status",
      cell: ({ row }: { row: { original: AdvisorStudent } }) => {
        const scheme =
          colorMap[row.original.status as keyof typeof colorMap] ??
          colorMap["green"];
        return (
          <div
            className="rounded-full font-medium text-small w-fit py-4 px-8"
            style={{ color: scheme.text, backgroundColor: scheme.bg }}
          >
            {row.original.status}
          </div>
        );
      },
    },
    {
      header: "JOIN DATE",
      accessorKey: "joinDate",
      cell: ({ row }: { row: { original: AdvisorStudent } }) => (
        <p className="text-[var(--color-text-passive)]">
          {row.original.joinDate}
        </p>
      ),
    },
    {
      header: "actions",
      accessorKey: "actions",
      cell: ({ row }) => {
        const handleDelete = () => {
          console.log("Deleting student:", row.original.regNumber);
        };

        const handleFlag = () => {
          if (row.original.status === "flagged") {
            row.original.status = "verified";
          } else {
            row.original.status = "flagged";
          }
          console.log("Flagging student:", row.original.regNumber);
        };
        return (
          <div className="flex items-center text-medium gap-24 ">
            <button
              className="center-child rounded-[8px] transition-all p-8 hover:bg-[var(--color-brown-background)] text-[var(--color-brown)] cursor-pointer"
              onClick={handleFlag}
            >
              {row.original.status === "flagged" ? (
                <FlagOff fill="var(--color-brown)" size={18} />
              ) : (
                <Flag size={18} />
              )}
            </button>
            <button
              className=" center-child  rounded-[8px] transition-all  p-8 hover:bg-[var(--color-red-background)] text-[var(--color-red)] cursor-pointer"
              onClick={handleDelete}
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      },
    },
  ];

  //Creating table instance
  const table = useReactTable({
    data: advisorStudents,
    columns,
    state: {
      pagination,
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const resetFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
  };

  // Utils to be used in th control component
  const utils = {
    searchTitle: "Search Students",
    placeholder: "Name, reg number, or join date",
    optionTilte: "Status",
    options: [
      { value: "", title: "All Status" },
      { value: "flagged", title: "Flagged" },
      { value: "pending", title: "Pending" },
    ],
  };

  return (
    <div>
      {/* controls */}
      <TableControls
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        resetFilters={resetFilters}
        utils={utils}
      />

      {/* Table */}
      <TableTemplate table={table} />
    </div>
  );
}
