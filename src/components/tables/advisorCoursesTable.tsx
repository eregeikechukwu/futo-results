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
import { ArrowUpDown, Edit3, Trash2, X } from "lucide-react";
import { TableControls } from "./common";
import { TableTemplate } from "./table";
import { useModalTemplate } from "../modals/overlay";
import { EditCourse } from "../forms/advisorEditCourse";
import { useAcademicTerms } from "@/lib/hooks/useAcademicTerms";
import { useRemoveCourseOffering } from "@/lib/hooks/useAdvisorCourses";
import { errorToastHandler } from "@/helpers/errorHandler";
import toast from "react-hot-toast";
import ConfirmationModal from "../secondary/confirmationModal";
import { CoverLoader } from "../secondary/loaders/coverLoader";

export function AdvisorCoursesTable({
  advisorOfferings,
  activeSession,
}: {
  advisorOfferings: AdvisorCourse[];
  activeSession: string;
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [idToBeDeleted, setIdToBeDeleted] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // Dlete  mutation hander here
  const { mutate: deleteMutation } = useRemoveCourseOffering();

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
      value: activeSession,
    },
  ]);
  const { ModalTemplate, toggleModal: toggleEditModal } = useModalTemplate();
  // Table session options
  const {
    data: sessionOptions,
    isPending: sessionOptionsPending,
    error: sessionOptionsError,
  } = useAcademicTerms();

  // ID change test
  const idRef = useRef<AdvisorCourse>({
    id: "",
    courseCode: "",
    courseTitle: "",
    unit: "0",
    semester: "Rain",
    session: "",
  });

  // Delete handler
  const handleRemoveCourseOffering = (offeringId: string) => {
    // Call delete mutation here with offeringId
    setIsMutating(true);
    deleteMutation(offeringId, {

      onSuccess: () => {
        setIsMutating(false);
        toast.success("Course offering deleted successfully");
        setIdToBeDeleted(null);
      },
      onError: (error) => {
        errorToastHandler(error);
        setIsMutating(false);
        setIdToBeDeleted(null);
      },
    });
    console.log("Deleting course offering with ID:", offeringId);
    // Example: removeCourseOfferingMutation.mutate(offeringId);
  };

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
          setIdToBeDeleted(row.original.id);
          console.log("Deleting course offering:", row);
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
    data: advisorOfferings as AdvisorCourse[],
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
        value: activeSession,
      },
    ]);
  };

  const utils = {
    searchTitle: "Search Courses",
    placeholder: "Title, code, or semester",
    optionTilte: "Session",
    options: sessionOptions
      ? [
          { value: activeSession, title: activeSession },
          ...sessionOptions
            .filter((option, index, arr) => {
              index === arr.findIndex((o) => o.session === option.session) &&
                option.session !== activeSession;
            })
            .map((option) => ({
              value: option.session,
              title: option.session,
            })),
        ]
      : [],
    // options: [],
  };

  console.log(sessionOptions, "session options it is");

  return (
    <div>
      {/* controls */}
      <TableControls
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        resetFilters={resetFilters}
        loading={sessionOptionsPending}
        error={
          sessionOptionsError?.message ? "Failed to load sessions" : undefined
        }
        utils={utils}
      />

      {/* Table */}
      <TableTemplate
        table={table}
        title={`${table.getColumn("session")?.getFilterValue()} Courses`}
      />

      {/* Confirmation modal */}
      <ConfirmationModal
        message="Delete course offering?"
        open={!!idToBeDeleted}
        variant="danger"
        confirmLabel="Delete"
        onCancel={() => setIdToBeDeleted(null)}
        onConfirm={() => handleRemoveCourseOffering(idToBeDeleted || '')}
      />

      {/* Table ,utatio odaing state
       */}
       {isMutating && <CoverLoader />
}
      {/* Modal */}
      <ModalTemplate title="Edit Course">
        <EditCourse toggleModal={toggleEditModal} course={idRef.current} />
      </ModalTemplate>
    </div>
  );
}
