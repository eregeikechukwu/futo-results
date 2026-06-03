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
import { ArrowUpDown, Flag, FlagOff, Trash2 } from "lucide-react";
import { colorMap } from "@/utils/colorMaps";
import { TableControls } from "./common";
import { TableTemplate } from "./table";
import {
  useDeleteStudentRecord,
  useUpdateStudentStatus,
} from "@/lib/hooks/useAdvisorStudents";
import toast from "react-hot-toast";
import { errorToastHandler } from "@/helpers/errorHandler";
import ConfirmModal from "../secondary/confirmationModal";
import { StudentStatus } from "@/utils/systemUtils";
import { CoverLoader } from "../secondary/loaders/coverLoader";

export function AdvisorStudentsTable({
  advisorStudents,
}: {
  advisorStudents: AdvisorStudent[];
}) {
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
  const [isMutating, setIsMutating] = useState(false);
  const [idToBeDeleted, setIdToBeDeleted] = useState<{
    id: string;
    status: StudentStatus;
    regNumber: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Mutation for deletimg student
  const { mutate: deleteStudentMutation } = useDeleteStudentRecord();

  // Mutation for updating student
  const { mutate: updateStudentMutation } = useUpdateStudentStatus();

  const handleDeleteStudent = (studentId, status) => {
    console.log("Deleting student:", studentId, status);
    if (!confirmDelete) {
      toast.error("Reg Number doesn't match");
    } else {
      setIsMutating(true);
      deleteStudentMutation(
        { studentId, status },
        {
          onSuccess: () => {
            toast.success("Student deleted successfully");
            setIsMutating(false);
            setIsModalOpen(false);
            setIdToBeDeleted(null);
          },
          onError: (error) => {
            setIsModalOpen(false);
            errorToastHandler(error);
            setIsMutating(false);
          },
        },
      );
    }
  };

  const updateStatus = (studentId, status) => {
    setIsMutating(true);
    updateStudentMutation(
      { studentId: studentId, status: status },
      {
        onSuccess: () => {
          setIsMutating(false);
          toast.success("Status updated successfully");
        },
        onError: (error) => {
          errorToastHandler(error);
          setIsMutating(false);
        },
      },
    );
  };

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
          setIsModalOpen(true);
          setIdToBeDeleted({
            id: row.original.id,
            status: row.original.status,
            regNumber: row.original.regNumber,
          });
        };

        const handleFlag = () => {
          if (row.original.status === "flagged") {
            updateStatus(row.original.id, "verified");
          } else {
            updateStatus(row.original.id, "flagged");
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

  console.log(isMutating, " Sometign si muaiaekdjo");

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
      <TableTemplate table={table} />

      {/* Delete confirmatin modal */}
      <ConfirmModal
        open={isModalOpen}
        onConfirm={() =>
          handleDeleteStudent(idToBeDeleted?.id, idToBeDeleted?.status)
        }
        variant="danger"
        confirmLabel="Delete"
        message="delete this student from your records"
        onCancel={() => {
          setIdToBeDeleted(null);
          setIsModalOpen(false);
        }}
        setConfirmAction={setConfirmDelete}
        actionConfirmValue={idToBeDeleted?.regNumber}
        value={"student"}
        isMutating={isMutating}
      />
      {/* Loader for general mutating state */}
      {isMutating && <CoverLoader />}
    </div>
  );
}
