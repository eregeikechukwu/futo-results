import { ResultEntry } from "@/app/types/advisor";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, Check, X } from "lucide-react";
import styles from "@/app/advisor/(dashboard)/results/ResultsTable.module.scss";

interface ColumnsConfig {
  editingRowId: string | null;
  editValuesRef: React.RefObject<{
    test_score: string;
    lab_score: string;
    exam_score: string;
  }>;

  handleSave: (row: ResultEntry) => void;
  handleEditStart: (row: ResultEntry) => void;
  setDeleteConfirmId: (id: string | null) => void;
  setDeleteConfirmRegNo: (regNo: string) => void;
  setEditingRowId: (id: string | null) => void;
}

export const resultsEditTableColumns = (config: ColumnsConfig) => {
  const {
    editingRowId,
    editValuesRef,
    handleSave,
    handleEditStart,
    setDeleteConfirmId,
    setDeleteConfirmRegNo,
    setEditingRowId,
  } = config;

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
      header: "Test    ",
      cell: ({ row }) => {
        if (editingRowId === row.original.id) {
          return (
            <input
              type="number"
              min="0"
              max="40"
              defaultValue={row.original.test_score ?? ""}
              onChange={(el) => {
                editValuesRef.current.test_score = el.target.value;
              }}
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
      header: "Lab    ",
      cell: ({ row }) => {
        if (editingRowId === row.original.id) {
          return (
            <input
              type="number"
              min="0"
              max="100"
              defaultValue={row.original.lab_score}
              onChange={(el) => {
                editValuesRef.current.lab_score = el.target.value;
              }}
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
      header: "Exam ",
      cell: ({ row }) => {
        if (editingRowId === row.original.id) {
          return (
            <input
              type="number"
              min="0"
              max="100"
              defaultValue={row.original.exam_score}
              onChange={(el) => {
                editValuesRef.current.exam_score = el.target.value;
              }}
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
          const test = parseFloat(editValuesRef.current.test_score) || 0;
          const lab = parseFloat(editValuesRef.current.lab_score) || 0;
          const exam = parseFloat(editValuesRef.current.exam_score) || 0;
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
                  editValuesRef.current = {
                    test_score: "",
                    lab_score: "",
                    exam_score: "",
                  };
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

  return columns;
};
