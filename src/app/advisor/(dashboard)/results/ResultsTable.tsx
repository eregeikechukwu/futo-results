"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
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
import { ResultsTableProps, ResultEntry } from "@/app/types/advisor";
import { errorToastHandler } from "@/helpers/errorHandler";
import { resultsEditTableColumns } from "@/components/tables/tableColumns/resultsEditTableColumns";
import { TableTemplate } from "@/components/tables/table";
import { useWarnBeforeUnload } from "@/app/hooks/useWarnBeforeUnload";

const BATCH_PAGE_SIZE = 20;

export default function ResultsTable({
  results,
  batches,
  offeringId,
}: ResultsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [remarkFilter, setRemarkFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  // Warn before leaving page

  // Warn before leaving page
  useWarnBeforeUnload(editingRowId !== null);

  const editValuesRef = useRef<{
    test_score: string;
    lab_score: string;
    exam_score: string;
  }>({ test_score: "", lab_score: "", exam_score: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmRegNo, setDeleteConfirmRegNo] = useState("");
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
        !statusFilter ||
        result.result_batches.status === statusFilter.toLowerCase();

      // Remark filter
      const matchesRemark = !remarkFilter || result.remark === remarkFilter;

      return matchesSearch && matchesGrade && matchesRemark && matchesStatus;
    });
  }, [results, globalFilter, gradeFilter, remarkFilter, statusFilter]);

  // Begin editing a single result row and populate the edit buffer
  const handleEditStart = (row: ResultEntry) => {
    setEditingRowId(row.id);
    editValuesRef.current = (() => {
      const getValue = (value) => (value !== null ? value.toString() : "");
      return {
        test_score: getValue(row.test_score),
        lab_score: getValue(row.lab_score),
        exam_score: getValue(row.exam_score),
      };
    })();
  };

  // Validate and save edited score values for a result entry
  const handleSave = async (row: ResultEntry) => {
    // console.log(editValuesRef.current,"  Edit values ref current");
    const getValue = (value: string) =>
      value.trim() === "" ? null : parseFloat(value);
    const test = getValue(editValuesRef.current.test_score);
    const lab = getValue(editValuesRef.current.lab_score);
    const exam = getValue(editValuesRef.current.exam_score);

    const checkValue = (value: number | null) => value !== null && isNaN(value);

    if (checkValue(test) && checkValue(lab) && checkValue(exam)) {
      toast.error("Please enter valid numbers for the scores");
      return;
    }

    if (test !== null && (test < 0 || test > 40)) {
      toast.error("Test score must be between 0 and 40");
      return;
    }

    if (lab !== null && (lab < 0 || lab > 100)) {
      toast.error("Lab score must be between 0 and 100");
      return;
    }

    if (exam !== null && (exam < 0 || exam > 100)) {
      toast.error("Exam score must be between 0 and 100");
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
          editValuesRef.current = {
            test_score: "",
            lab_score: "",
            exam_score: "",
          };
          toast.success("Score updated successfully");
        },
        onError: (error) => {
          toast.error(`Failed to update scores: ${error.message}`);
        },
      },
    );
  };

  // Confirm and execute deletion of a single result entry
  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          setDeleteConfirmId(null);
          setDeleteConfirmRegNo("");
          toast.success("Resuly entry deleted successfully!");
        },
        onError: (error) => {
          toast.error(`Failed to delete entry: ${error.message}`);
        },
      });
    }
  };

  // Create columns with all dependencies
  // Columns define how result entry fields render and support inline editing
  const columns = useMemo(
    () =>
      resultsEditTableColumns({
        editingRowId,
        editValuesRef,
        handleSave,
        handleEditStart,
        setDeleteConfirmId,
        setDeleteConfirmRegNo,
        setEditingRowId,
      }),
    [editingRowId, editValuesRef, handleSave],
  );

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
      const batchId = row.original.result_batches.id;
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

  console.log(batchGroups, "batchGroups");

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
      onError: (error) => {
        errorToastHandler(
          error,
          "Failed to publish batches. Please try again.",
        );
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
        batchGroups.map(({ batch, rows: batchRows }) => {
          const pageCount = Math.max(
            1,
            Math.ceil(batchRows.length / BATCH_PAGE_SIZE),
          );
          const currentPage = Math.min(
            batchPages[batch.id] ?? 0,
            pageCount - 1,
          );
          const pageRows = batchRows.slice(
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
                      {batchRows.length} entr
                      {batchRows.length === 1 ? "y" : "ies"}
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

              {/* Table */}
              <TableTemplate table={table}>
                <tbody className={styles.tbody}>
                  {batchRows.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className={`${styles.tr} ${
                        editingRowId === row.original.id
                          ? styles.editingRow
                          : ""
                      }`}
                    >
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
              </TableTemplate>
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
          }}
          onConfirm={handleDelete}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          actionConfirmValue={deleteConfirmRegNo}
          value={"result"}
          isMutating={deleteMutation.isPending}
        />
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
