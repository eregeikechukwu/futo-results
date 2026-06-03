"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Lock, Edit2, Trash2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  useUpdateResultEntry,
  useDeleteResultEntry,
  usePublishBatch,
} from "@/lib/hooks/useResults";
import styles from "./ResultsTable.module.scss";
import ConfirmModal from "@/components/secondary/confirmationModal";
import { CoverLoader } from "@/components/secondary/loaders/coverLoader";
import { ConfirmInput } from "@/components/secondary/confirmInput";

// Type for result entry with nested data
interface ResultEntry {
  id: string;
  test_score: number;
  lab_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  remark: string;
  batch_id: string;
  students: {
    id: string;
    reg_number: string;
    profiles: {
      id: string;
      full_name: string;
      email: string;
    };
  };
  result_batches: {
    id: string;
    status: "draft" | "reviewed" | "published" | "archived";
    source_type: string;
    created_at: string;
    published_at: string | null;
    offering_id: string;
  };
}

interface BatchInfo {
  id: string;
  status: "draft" | "reviewed" | "published" | "archived";
  source_type: string;
  created_at: string;
  published_at: string | null;
  uploaded_by: string;
}

interface SelectedOffering {
  id: string;
  courses: {
    id: string;
    course_code: string;
    course_title: string;
  };
  academic_terms: {
    id: string;
    session: string;
    semester: string;
  };
}

interface ResultsTableProps {
  results: ResultEntry[];
  batchInfo: BatchInfo | null;
  offeringId: string;
  selectedOffering: SelectedOffering | undefined;
}

export default function ResultsTable({
  results,
  batchInfo,
  offeringId,
  selectedOffering,
}: ResultsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [remarkFilter, setRemarkFilter] = useState("");
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    test_score: string;
    lab_score: string;
    exam_score: string;
  }>({ test_score: "", lab_score: "", exam_score: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmRegNo, setDeleteConfirmRegNo] = useState("");
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "regNumber", desc: false },
  ]);

  // Mutations
  const updateMutation = useUpdateResultEntry(offeringId);
  const deleteMutation = useDeleteResultEntry(offeringId);
  const publishMutation = usePublishBatch(offeringId);

  // Check if batch is editable (draft or reviewed)
  const isEditable = (row) => {
    if (!row) return false;
    return (
      row.result_batches?.status === "draft" ||
      row?.result_batches?.status === "reviewed"
    );
  };

  // Filter results client-side
  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      // Search filter: reg number or full name
      const searchLower = globalFilter.toLowerCase();
      const matchesSearch =
        !globalFilter ||
        result.students.reg_number.toLowerCase().includes(searchLower) ||
        result.students.profiles.full_name.toLowerCase().includes(searchLower);

      // Grade filter
      const matchesGrade = !gradeFilter || result.grade === gradeFilter;

      // Remark filter
      const matchesRemark = !remarkFilter || result.remark === remarkFilter;

      return matchesSearch && matchesGrade && matchesRemark;
    });
  }, [results, globalFilter, gradeFilter, remarkFilter]);

  // Table columns definition
  const columns: ColumnDef<ResultEntry>[] = [
    {
      accessorKey: "rowNumber",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 40,
    },
    {
      accessorKey: "regNumber",
      header: "Reg Number",
      cell: ({ row }) => (
        <span className={styles.cellValue}>
          {row.original.students.reg_number}
        </span>
      ),
    },
    {
      accessorKey: "fullName",
      header: "Full Name",
      cell: ({ row }) => (
        <span className={styles.cellValue}>
          {row.original.students.profiles.full_name}
        </span>
      ),
    },
    {
      accessorKey: "testScore",
      header: "Test (30)",
      cell: ({ row }) => {
        if (editingRowId === row.original.id && isEditable(row.original)) {
          return (
            <input
              type="number"
              min="0"
              max="30"
              value={editValues.test_score}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  test_score: e.target.value,
                })
              }
              className={styles.editInput}
            />
          );
        }
        return (
          <span className={styles.scoreValue}>{row.original.test_score}</span>
        );
      },
    },
    {
      accessorKey: "labScore",
      header: "Lab (30)",
      cell: ({ row }) => {
        if (editingRowId === row.original.id && isEditable(row.original)) {
          return (
            <input
              type="number"
              min="0"
              max="30"
              value={editValues.lab_score}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  lab_score: e.target.value,
                })
              }
              className={styles.editInput}
            />
          );
        }
        return (
          <span className={styles.scoreValue}>{row.original.lab_score}</span>
        );
      },
    },
    {
      accessorKey: "examScore",
      header: "Exam (70)",
      cell: ({ row }) => {
        if (editingRowId === row.original.id && isEditable(row.original)) {
          return (
            <input
              type="number"
              min="0"
              max="70"
              value={editValues.exam_score}
              onChange={(e) =>
                setEditValues({
                  ...editValues,
                  exam_score: e.target.value,
                })
              }
              className={styles.editInput}
            />
          );
        }
        return (
          <span className={styles.scoreValue}>{row.original.exam_score}</span>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        // Calculate total if in edit mode, otherwise show stored value
        if (editingRowId === row.original.id && isEditable(row.original)) {
          const test = parseFloat(editValues.test_score) || 0;
          const lab = parseFloat(editValues.lab_score) || 0;
          const exam = parseFloat(editValues.exam_score) || 0;
          const total = test + lab + exam;
          return <span className={styles.totalValue}>{total.toFixed(2)}</span>;
        }
        return (
          <span className={styles.totalValue}>{row.original.total_score}</span>
        );
      },
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => (
        <span className={styles.gradeBadge}>{row.original.grade}</span>
      ),
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ row }) => (
        <span
          className={`${styles.remarkBadge} ${
            row.original.remark === "PASS"
              ? styles.remarkPass
              : styles.remarkFail
          }`}
        >
          {row.original.remark}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (editingRowId === row.original.id && isEditable(row.original)) {
          // Show save/cancel buttons
          return (
            <div className={styles.actionButtons}>
              <button
                onClick={() => handleSave(row.original)}
                className={styles.saveBtn}
                title="Save changes"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => {
                  setEditingRowId(null);
                  setEditValues({
                    test_score: "",
                    lab_score: "",
                    exam_score: "",
                  });
                }}
                className={styles.cancelBtn}
                title="Cancel edit"
              >
                <X size={16} />
              </button>
            </div>
          );
        }

        if (!isEditable(row.original)) {
          // Show lock icon for published/archived
          return (
            <div className={styles.lockedCell}>
              <Lock size={16} />
            </div>
          );
        }

        // Show edit/delete buttons
        return (
          <div className={styles.actionButtons}>
            <button
              onClick={() => handleEditStart(row.original)}
              className={styles.editBtn}
              title="Edit entry"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => {
                setDeleteConfirmId(row.original.id);
                setDeleteConfirmRegNo(row.original.students.reg_number);
                setDeleteConfirmInput("");
              }}
              className={styles.deleteBtn}
              title="Delete entry"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  // Table instance
  const table = useReactTable({
    data: filteredResults,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Handlers
  const handleEditStart = (row: ResultEntry) => {
    setEditingRowId(row.id);
    setEditValues({
      test_score: row.test_score.toString(),
      lab_score: row.lab_score.toString(),
      exam_score: row.exam_score.toString(),
    });
  };

  const handleSave = async (row: ResultEntry) => {
    setIsMutating(true);
    const test = parseFloat(editValues.test_score);
    const lab = parseFloat(editValues.lab_score);
    const exam = parseFloat(editValues.exam_score);

    // Validate scores
    if (isNaN(test) || isNaN(lab) || isNaN(exam)) {
      toast.error("Please enter valid numbers for all scores");
      return;
    }

    if (test < 0 || test > 30) {
      toast.error("Test score must be between 0 and 30");
      return;
    }

    if (lab < 0 || lab > 30) {
      toast.error("Lab score must be between 0 and 30");
      return;
    }

    if (exam < 0 || exam > 70) {
      toast.error("Exam score must be between 0 and 70");
      return;
    }

    // Call mutation with only the editable fields
    updateMutation.mutate(
      {
        entryId: row.id,
        payload: {
          test_score: test,
          lab_score: lab,
          exam_score: exam,
        },
      },
      {
        onSuccess: () => {
          setEditingRowId(null);
          setEditValues({
            test_score: "",
            lab_score: "",
            exam_score: "",
          });
          setIsMutating(false);
        },
        onError: (error) => {
          toast.error(`Failed to update scores: ${error.message}`);
          setIsMutating(false);
        },
      },
    );
  };

  const handleDelete = () => {
    setIsMutating(true);
    if (deleteConfirmInput !== deleteConfirmRegNo) {
      toast.error("Reg number doesn't match. Try again.");
      setIsMutating(false);
      return;
    }

    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          setDeleteConfirmId(null);
          setDeleteConfirmRegNo("");
          setDeleteConfirmInput("");
          setIsMutating(false);
        },
        onError: (error) => {
          toast.error(`Failed to delete entry: ${error.message}`);
          setIsMutating(false);
        },
      });
    }
  };

  const handlePublish = () => {
    setIsMutating(true);
    if (!batchInfo?.id) {
      toast.error("Batch information not available");
      setIsMutating(false);
      return;
    }

    publishMutation.mutate(batchInfo.id);
  };

  // Get batch status badge styling
  const getBatchStatusStyle = (status: string) => {
    switch (status) {
      case "draft":
        return styles.statusDraft;
      case "reviewed":
        return styles.statusReviewed;
      case "published":
        return styles.statusPublished;
      case "archived":
        return styles.statusArchived;
      default:
        return "";
    }
  };

  return (
    <div className="relative">
      {/* Batch Status and Filters Section */}
      <div className={styles.controlsSection}>
        {/* Batch Status Info */}
        <div className={styles.batchStatusInfo}>
          <span className={styles.label}>Batch Status:</span>
          <span
            className={`${styles.statusBadge} ${getBatchStatusStyle(batchInfo?.status || "draft")}`}
          >
            {batchInfo?.status.toUpperCase() || "DRAFT"}
          </span>

          {/* Publish button - only show if reviewed status */}
          {batchInfo?.status === "reviewed" && (
            <button
              onClick={handlePublish}
              className={styles.publishBtn}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? "Publishing..." : "Publish Batch"}
            </button>
          )}

          {/* Lock message for published */}
          {!isEditable && (
            <span className={styles.lockMessage}>
              📌 Results Published - Editing Disabled
            </span>
          )}
        </div>

        {/* Filters */}
        <div className={styles.filtersContainer}>
          {/* Search */}
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by reg number or name..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Grades</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
            <option value="E">Grade E</option>
            <option value="F">Grade F</option>
          </select>

          {/* Remark Filter */}
          <div className={styles.remarkToggle}>
            <button
              className={`${styles.toggleBtn} ${
                remarkFilter === "PASS" ? styles.toggleActive : ""
              }`}
              onClick={() =>
                setRemarkFilter(remarkFilter === "PASS" ? "" : "PASS")
              }
            >
              PASS
            </button>
            <button
              className={`${styles.toggleBtn} ${
                remarkFilter === "FAIL" ? styles.toggleActive : ""
              }`}
              onClick={() =>
                setRemarkFilter(remarkFilter === "FAIL" ? "" : "FAIL")
              }
            >
              FAIL
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={styles.th}>
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={styles.tbody}>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`${styles.tr} ${
                  editingRowId === row.original.id ? styles.editingRow : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.td}>
                    {cell.column.columnDef.cell
                      ? cell.column.columnDef.cell(cell.getContext())
                      : cell.getValue()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()} ({filteredResults.length} total)
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

      {/* LOader to cover the table during mutations */}
      {isMutating && <CoverLoader />}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <ConfirmModal
          title="Delete Result Entry"
          message="delete this result entry permanently"
          open={!!deleteConfirmId}
          onCancel={() => {
            setDeleteConfirmId(null);
            setDeleteConfirmRegNo("");
            setDeleteConfirmInput("");
          }}
          onConfirm={handleDelete}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        >
          <ConfirmInput
            value="result"
            deleteConfirmInput={deleteConfirmInput}
            deleteConfirmValue={deleteConfirmRegNo}
            setDeleteConfirmInput={setDeleteConfirmInput}
          />
        </ConfirmModal>
      )}
    </div>
  );
}
