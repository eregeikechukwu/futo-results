"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Edit2, Trash2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  useUpdateResultEntry,
  useDeleteResultEntry,
  usePublishBatch,
  usePublishAllDraftBatches,
} from "@/lib/hooks/useResults";
import styles from "./ResultsTable.module.scss";
import ConfirmModal from "@/components/secondary/confirmationModal";
import { CoverLoader } from "@/components/secondary/loaders/coverLoader";
import ConfirmInput from "@/components/secondary/confirmInput";
import { ResultsTableProps, ResultEntry } from "@/app/types/advisor";

const BATCH_PAGE_SIZE = 20;

export default function ResultsTable({
  results,
  batches,
  offeringId,
  selectedOffering,
}: ResultsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [remarkFilter, setRemarkFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    test_score: string;
    lab_score: string;
    exam_score: string;
  }>({ test_score: "", lab_score: "", exam_score: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmRegNo, setDeleteConfirmRegNo] = useState("");
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [showPublishAllModal, setShowPublishAllModal] = useState(false);
  const [batchPages, setBatchPages] = useState<Record<string, number>>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "regNumber", desc: false },
  ]);

  // Mutation hooks for result entry updates, deletes, and batch publishing
  const updateMutation = useUpdateResultEntry(offeringId);
  const deleteMutation = useDeleteResultEntry(offeringId);
  const publishMutation = usePublishBatch(offeringId);

  // Apply client-side search and filters before grouping by batch
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

      // status filter
      const matchesStatus =
        !statusFilter || result.result_batches.status === statusFilter;

      // Remark filter
      const matchesRemark = !remarkFilter || result.remark === remarkFilter;

      return matchesSearch && matchesGrade && matchesRemark;
    });
  }, [results, globalFilter, gradeFilter, remarkFilter]);

  // Columns define how result entry fields render and support inline editing
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
        if (editingRowId === row.original.id) {
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
        if (editingRowId === row.original.id) {
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
          <span className={styles.scoreValue}>
            {row.original.lab_score ?? "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "examScore",
      header: "Exam (70)",
      cell: ({ row }) => {
        if (editingRowId === row.original.id) {
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
        if (editingRowId === row.original.id) {
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
        if (editingRowId === row.original.id) {
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

  // Create the table instance for sorting and row model access
  const table = useReactTable({
    data: filteredResults,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rowModel = table.getRowModel();

  // Group filtered entries by their batch ID for sectioned batch rendering
  const batchGroups = useMemo(() => {
    const groups: Record<
      string,
      { batch: ResultEntry["result_batches"]; rows: typeof rowModel.rows }
    > = {};

    rowModel.rows.forEach((row) => {
      const batchId = row.original.batch_id;
      if (!groups[batchId]) {
        groups[batchId] = {
          batch: row.original.result_batches,
          rows: [],
        };
      }
      groups[batchId].rows.push(row);
    });

    return Object.values(groups).sort(
      (a, b) =>
        a.batch.created_at.localeCompare(b.batch.created_at) ||
        a.batch.id.localeCompare(b.batch.id),
    );
  }, [rowModel.rows]);

  // Determine how many draft batches can be published in bulk
  const draftBatchCount = batches.filter(
    (batch) => batch.status === "draft",
  ).length;

  const publishAllMutation = usePublishAllDraftBatches(offeringId);

  const isAnyMutating =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    publishMutation.isPending ||
    publishAllMutation.isPending;

  const formatBatchDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const shortenBatchId = (batchId: string) => batchId.slice(0, 8);

  // Begin editing a single result row and populate the edit buffer
  const handleEditStart = (row: ResultEntry) => {
    setEditingRowId(row.id);
    setEditValues({
      test_score: row.test_score.toString(),
      lab_score: row.lab_score !== null ? row.lab_score.toString() : "",
      exam_score: row.exam_score.toString(),
    });
  };

  // Validate and save edited score values for a result entry
  const handleSave = async (row: ResultEntry) => {
    const test = parseFloat(editValues.test_score);
    const lab =
      editValues.lab_score.trim() === ""
        ? null
        : parseFloat(editValues.lab_score);
    const exam = parseFloat(editValues.exam_score);

    if (isNaN(test) || isNaN(exam) || (lab !== null && isNaN(lab))) {
      toast.error("Please enter valid numbers for all scores");
      return;
    }

    if (test < 0 || test > 30) {
      toast.error("Test score must be between 0 and 30");
      return;
    }

    if (lab !== null && (lab < 0 || lab > 30)) {
      toast.error("Lab score must be between 0 and 30");
      return;
    }

    if (exam < 0 || exam > 70) {
      toast.error("Exam score must be between 0 and 70");
      return;
    }

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
          setEditValues({ test_score: "", lab_score: "", exam_score: "" });
          toast.success("Scores updated successfully");
        },
        onError: (error) => {
          toast.error(`Failed to update scores: ${error.message}`);
        },
      },
    );
  };

  // Confirm and execute deletion of a single result entry
  const handleDelete = () => {
    if (deleteConfirmInput !== deleteConfirmRegNo) {
      toast.error("Reg number doesn't match. Try again.");
      return;
    }

    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          setDeleteConfirmId(null);
          setDeleteConfirmRegNo("");
          setDeleteConfirmInput("");
          toast.success("Entry deleted successfully");
        },
        onError: (error) => {
          toast.error(`Failed to delete entry: ${error.message}`);
        },
      });
    }
  };

  // Publish a single batch by ID
  const handlePublish = (batchId: string) => {
    publishMutation.mutate(batchId);
  };

  // Publish all draft batches for the current offering
  const handlePublishAll = () => {
    publishAllMutation.mutate(undefined, {
      onSuccess: () => {
        setShowPublishAllModal(false);
      },
    });
  };

  // Map batch status values to CSS badge styles
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
      <div className={styles.controlsSection}>
        <div className={styles.publishAllRow}>
          <div>
            <span className={styles.label}>Batch actions</span>
            <p className={styles.publishAllSummary}>
              {draftBatchCount > 0
                ? `${draftBatchCount} draft batch${
                    draftBatchCount > 1 ? "es" : ""
                  } ready to publish.`
                : "No draft batches available."}
            </p>
          </div>
          <button
            onClick={() => setShowPublishAllModal(true)}
            disabled={draftBatchCount === 0 || publishAllMutation.isPending}
            className={styles.publishAllBtn}
          >
            {publishAllMutation.isPending
              ? "Publishing..."
              : "Publish All Drafts"}
          </button>
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by reg number or name..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className={styles.searchInput}
            />
          </div>

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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All entries</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

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

      {batchGroups.length > 0 ? (
        batchGroups.map(({ batch, rows }) => {
          const pageCount = Math.max(
            1,
            Math.ceil(rows.length / BATCH_PAGE_SIZE),
          );
          const currentPage = Math.min(
            batchPages[batch.id] ?? 0,
            pageCount - 1,
          );
          const pageRows = rows.slice(
            currentPage * BATCH_PAGE_SIZE,
            currentPage * BATCH_PAGE_SIZE + BATCH_PAGE_SIZE,
          );

          return (
            <section className={styles.batchSection} key={batch.id}>
              <div className={styles.batchHeader}>
                <div className={styles.batchMeta}>
                  <div className={styles.batchTitle}>
                    Batch {shortenBatchId(batch.id)}
                  </div>
                  <div className={styles.batchDetails}>
                    <span className={styles.batchDetailItem}>
                      Uploaded {formatBatchDate(batch.created_at)}
                    </span>
                    <span className={styles.batchDetailItem}>
                      {rows.length} entr{rows.length === 1 ? "y" : "ies"}
                    </span>
                  </div>
                </div>

                <div className={styles.batchActions}>
                  {batch.status === "draft" ? (
                    <button
                      onClick={() => handlePublish(batch.id)}
                      disabled={publishMutation.isPending}
                      className={styles.publishBtn}
                    >
                      {publishMutation.isPending
                        ? "Publishing..."
                        : "Publish Batch"}
                    </button>
                  ) : (
                    <span
                      className={`${styles.statusBadge} ${getBatchStatusStyle(
                        batch.status,
                      )}`}
                    >
                      {batch.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead className={styles.thead}>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
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
                  <tbody className={styles.tbody}>
                    {pageRows.map((row, rowIndex) => (
                      <tr
                        key={row.id}
                        className={`${styles.tr} ${
                          editingRowId === row.original.id
                            ? styles.editingRow
                            : ""
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
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
                </table>
              </div>

              <div className={styles.batchPagination}>
                <div className={styles.batchPaginationInfo}>
                  Page {currentPage + 1} of {pageCount}
                </div>
                <div className={styles.batchPaginationButtons}>
                  <button
                    onClick={() =>
                      setBatchPages((prev) => ({
                        ...prev,
                        [batch.id]: Math.max(currentPage - 1, 0),
                      }))
                    }
                    disabled={currentPage === 0}
                    className={styles.paginationBtn}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setBatchPages((prev) => ({
                        ...prev,
                        [batch.id]: Math.min(currentPage + 1, pageCount - 1),
                      }))
                    }
                    disabled={currentPage >= pageCount - 1}
                    className={styles.paginationBtn}
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          );
        })
      ) : (
        <div className={styles.emptyState}>
          <p>No result entries match the current filters.</p>
        </div>
      )}

      {isAnyMutating && <CoverLoader />}

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

      {showPublishAllModal && (
        <ConfirmModal
          title="Publish All Draft Batches"
          message="publish all draft batches for this offering"
          open={showPublishAllModal}
          onCancel={() => setShowPublishAllModal(false)}
          onConfirm={handlePublishAll}
          confirmLabel="Publish"
          cancelLabel="Cancel"
          variant="warning"
          isMutating={publishAllMutation.isPending}
        />
      )}
    </div>
  );
}
