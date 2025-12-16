"use client";

import React, { useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  ColumnFilter,
  SortingState,
  Table,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { AdvisorCourse } from "@/app/types/advisor";
import { advisorCourses } from "@/mock/advisorCourses";
import { ArrowUpDown, Edit3, Flag, FlagOff, Trash2, X } from "lucide-react";
import { TableControls } from "./common";
import { TableTemplate } from "./table";
import { useModalTemplate } from "../modals/overlay";
import { EditCourse } from "../forms/advisorEditCourse";

export function AdvisorCoursesTable({
  activeSesson,
}: {
  activeSesson: string;
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "semester",
      desc: false,
    },
    { id: "courseCode", desc: false },
  ]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([
    {
      id: "session",
      value: activeSesson,
    },
  ]);
  const {
    ModalTemplate,
    toggleModal: toggleEditModal,
  } = useModalTemplate();

  // ID change test
  const idRef = useRef<AdvisorCourse>({
    courseCode: "",
    courseTitle: "",
    unit: "0",
    semester: "Rain",
    session: "",
  });

  const columns: ColumnDef<AdvisorCourse>[] = [
    {
      accessorKey: "courseCode",
      accessorFn: (row: AdvisorCourse) => row.courseCode,
      header: ({ column }) => (
        <button
          className="flex items-center gap-8 active:text-[var(--color-text-link)]"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          COURSE CODE <ArrowUpDown size={12} />
        </button>
      ),
      cell: ({ row }: { row: { original: AdvisorCourse } }) => (
        <p className="font-mono">{row.original.courseCode}</p>
      ),
    },

    {
      accessorKey: "courseTitle",
      header: "Course Title",
    },
    {
      accessorKey: "unit",
      header: "credit unit",
      cell: ({ row }: { row: { original: AdvisorCourse } }) => (
        <span>
          {row.original.unit} {Number(row.original.unit) > 1 ? "units" : "unit"}
        </span>
      ),
    },
    {
      accessorKey: "semester",
      accessorFn: (row: AdvisorCourse) => row.semester,
      header: ({ column }) => (
        <button
          className="flex items-center gap-8 active:text-[var(--color-text-link)]"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          SEMESTER <ArrowUpDown size={12} />
        </button>
      ),
    },
    {
      accessorKey: "session",
      header: ({ column }) => <div className="hidden"></div>,
      cell: ({ row }: { row: { original: AdvisorCourse } }) => (
        <p className="hidden">{row.original.session}</p>
      ),
    },
    {
      header: "actions",
      accessorKey: "actions",
      cell: ({ row }) => {
        const handleDelete = () => {
          console.log("Deleting student:", row.original.courseTitle);
        };
        const toggleModal = () => {
          idRef.current = row.original;
          toggleEditModal();
        };

        return (
          <div className="flex items-center text-medium gap-24 ">
            <button
              onClick={toggleModal}
              className="center-child rounded-[8px] transition-all p-8 hover:bg-[var(--color-blue-background)] text-[var(--color-primary)] cursor-pointer"
            >
              <Edit3 size={18} />
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

  //Ceating table instance
  const table: Table<AdvisorCourse> = useReactTable<AdvisorCourse>({
    data: advisorCourses as AdvisorCourse[],
    columns,
    state: {
      pagination,
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const resetFilters = () => {
    setGlobalFilter("");
    setColumnFilters([
      {
        id: "session",
        value: activeSesson,
      },
    ]);
  };

  const utils = {
    searchTitle: "Search Courses",
    placeholder: "Title, code, or semester",
    optionTilte: "Session",
    options: [
      { value: activeSesson, title: activeSesson },
      { value: "2023/2024", title: "2023/2024" },
      { value: "2022/2023", title: "2022/2023" },
      { value: "2021/2022", title: "2021/2022" },
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
      <TableTemplate
        table={table}
        title={`${table.getColumn("session")?.getFilterValue()} Courses`}
      />

      {/* Modal */}
      <ModalTemplate title="Edit Course">
        <EditCourse toggleModal={toggleEditModal} course={idRef.current} />
      </ModalTemplate>
    </div>
  );
}
