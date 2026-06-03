"use client";

import React, { useRef, useState, useCallback } from "react";
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
import { AdvisorCourse, CourseData } from "@/app/types/advisor";
import { ArrowUpDown, Edit3, Trash2, X } from "lucide-react";
import { TableControls } from "./common";
import { TableTemplate } from "./table";
import { useModalTemplate } from "../modals/overlay";
import EditCourse from "../forms/advisorEditCourse";
import {
  useRemoveCourseOffering,
  useUpdateCourseOffering,
} from "@/lib/hooks/useAdvisorCourses";
import { errorToastHandler } from "@/helpers/errorHandler";
import toast from "react-hot-toast";
import ConfirmationModal from "../secondary/confirmationModal";
import { CoverLoader } from "../secondary/loaders/coverLoader";
import ConfirmInput from "../secondary/confirmInput";

export function AdvisorCoursesTable({
  sessionFilters,
  setSessionFilters,
  advisorOfferings,
  activeSession,
}: {
  sessionFilters: ColumnFilter[];
  setSessionFilters: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  advisorOfferings: AdvisorCourse[];
  activeSession: string;
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [courseToBeDeleted, setCourseToBeDeleted] =
    useState<AdvisorCourse | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Dlete  mutation hander here
  const { mutate: deleteMutation } = useRemoveCourseOffering();
  // Update Mutation handler
  const { mutate } = useUpdateCourseOffering();

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

  const { ModalTemplate, toggleModal: toggleEditModal } = useModalTemplate();

  // Table session options derived from advisor offerings
  const sessionOptions = advisorOfferings.map((offering) => ({
    id: offering.session,
    session: offering.session,
  }));

  // ID change test
  const idRef = useRef<AdvisorCourse>({
    id: "",
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
          setCourseToBeDeleted(row.original);
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

  console.log(isMutating, "isMutsting");

  //Ceating table instance
  const table: Table<AdvisorCourse> = useReactTable<AdvisorCourse>({
    data: advisorOfferings as AdvisorCourse[],
    columns,
    state: {
      pagination,
      sorting,
      globalFilter,
      columnFilters: sessionFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setSessionFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const resetFilters = () => {
    setGlobalFilter("");
    setSessionFilters([
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
              return (
                index === arr.findIndex((o) => o.session === option.session) &&
                option.session !== activeSession
              );
            })
            .map((option) => ({
              value: option.session,
              title: option.session,
            })),
        ]
      : [],
    // options: [],
  };

  // FUnction for updating course
  const updateCourseHandler = useCallback(async (data: CourseData) => {
    setIsMutating(true);
    console.log(data, "course to be edited");

    const mutationData = {
      offeringId: idRef.current.id,
      input: {
        unit: Number(data.unit),
        term_id: data.term,
      },
    };

    mutate(mutationData, {
      onSuccess: () => {
        setIsMutating(false);
        toast.success("Course offering updated successfully");
        toggleEditModal();
        // methods.reset();
      },
      onError: (error: Error) => {
        toast.error(`Failed to update course offering: ${error.message}`);
        setIsMutating(false);
      },
    });
  }, []);

  // Delete handler
  const handleRemoveCourseOffering = useCallback(
    (offeringId: string) => {
      if (!confirmDelete) {
        toast.error("Course code doesnt match");
        return;
      } else {
        // Call delete mutation here with offeringId
        setIsMutating(true);
        deleteMutation(offeringId, {
          onSuccess: () => {
            setIsMutating(false);
            toast.success("Course offering deleted successfully");
            setCourseToBeDeleted(null);
          },
          onError: (error) => {
            errorToastHandler(error);
            setIsMutating(false);
            setCourseToBeDeleted(null);
          },
        });
        console.log("Deleting course offering with ID:", offeringId);
        // Example: removeCourseOfferingMutation.mutate(offeringId);
      }
    },
    [confirmDelete, courseToBeDeleted],
  );

  return (
    <div className="relative">
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

      {/* Confirmation modal */}
      <ConfirmationModal
      isMutating={isMutating}
        message="Delete course offering?"
        open={!!courseToBeDeleted}
        variant="danger"
        confirmLabel="Delete"
        onCancel={() => setCourseToBeDeleted(null)}
        onConfirm={() =>
          handleRemoveCourseOffering(courseToBeDeleted?.id || "")
        }
        setConfirmAction={setConfirmDelete}
        actionConfirmValue={courseToBeDeleted?.courseCode}
      />

      {/* Table ,utatio odaing state
       */}
      {isMutating && <CoverLoader />}
      {/* Modal */}
      <ModalTemplate title="Edit Course">
        <EditCourse
          isMutating={isMutating}
          updateCourse={updateCourseHandler}
          course={idRef.current}
          toggleModal={toggleEditModal}
        />
      </ModalTemplate>
    </div>
  );
}
