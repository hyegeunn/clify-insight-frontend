import { useState, useEffect, type ChangeEvent } from "react";
import type {
  BaseTableProps,
  HeaderConfig,
  RowData,
  CellData,
  SortDirection,
  TableCellScalar,
} from "@/types";
import styles from "./BaseTable.module.scss";
import BaseTableCell from "./BaseTableCell";
import BaseCheckbox from "../BaseCheckbox";
import BaseIcon from "../BaseIcon";
import BaseTooltip from "../BaseTooltip";

const isCellData = (value: unknown): value is CellData => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return "type" in value;
};

const isTableCellScalar = (value: unknown): value is TableCellScalar =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  value === null ||
  value === undefined;

const BaseTable = <T extends Record<string, unknown>>({
  headers,
  data,
  onSort,
  defaultSortKey,
  defaultSortDirection = "asc",
  className = "",
  enableRowHover = false,
  enableRowPointer = false,
  onRowClick,
  headerHeight = 34,
  rowHeight = 42,
  totalRowIndex,
  totalRowHeight,
  emptyMessage = "데이터가 없습니다.",
  emptyHeight,
  bodyFontSize = 14,
  bodyLineHeight = "150%",
  bodyTextColor = "#000000",
  enableCheckbox = false,
  selectedRows = [],
  onSelectRow,
  customRowClassName = "",
}: BaseTableProps<T>) => {
  const [sortKey, setSortKey] = useState<keyof T | null>(
    defaultSortKey ?? null
  );
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(defaultSortDirection);

  // props가 변경되면 내부 state 동기화
  useEffect(() => {
    if (defaultSortKey !== undefined) {
      setSortKey(defaultSortKey);
    }
  }, [defaultSortKey]);

  useEffect(() => {
    setSortDirection(defaultSortDirection);
  }, [defaultSortDirection]);

  const handleSort = (header: HeaderConfig<T>) => {
    if (!header.sortable) {
      return;
    }

    const newDirection: SortDirection =
      sortKey === header.key && sortDirection === "asc" ? "desc" : "asc";

    setSortKey(header.key);
    setSortDirection(newDirection);

    onSort?.(header.key, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows = checked ? data.map((_, index) => index) : [];
    onSelectRow?.(newSelectedRows);
  };

  const handleSelectAllChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSelectAll(event.target.checked);
  };

  const handleSelectRow = (rowIndex: number, checked: boolean) => {
    const newSelectedRows = checked
      ? [...selectedRows, rowIndex]
      : selectedRows.filter((index) => index !== rowIndex);
    onSelectRow?.(newSelectedRows);
  };

  const handleRowCheckboxChange =
    (rowIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      handleSelectRow(rowIndex, event.target.checked);
    };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  const getCellValue = (row: RowData<T>, key: keyof T): CellData => {
    const value = row[key];

    if (isCellData(value)) {
      return value;
    }

    if (isTableCellScalar(value)) {
      return {
        type: "text",
        value,
      };
    }

    return {
      type: "text",
      value: String(value),
    };
  };

  return (
    <div className={`${styles.baseTable} ${className}`}>
      <div className={styles.header} style={{ height: `${headerHeight}px` }}>
        {enableCheckbox && (
          <div
            className={`${styles.headerCell} ${styles.checkboxCell}`}
            style={{ width: "48px" }}
          >
            <BaseCheckbox
              checked={isAllSelected}
              onChange={handleSelectAllChange}
              size={16}
            />
          </div>
        )}
        {headers.map((header) => {
          const headerKey = String(header.key);
          const isReactElement =
            typeof header.label === "object" && header.label !== null;

          return (
            <div
              key={headerKey}
              className={`${styles.headerCell} ${
                header.sortable ? styles.sortable : ""
              } ${styles[`align-${header.align || "left"}`]}`}
              style={{ width: header.width || "auto" }}
              onClick={() => handleSort(header)}
            >
              {isReactElement ? (
                header.label
              ) : (
                <span className={styles.headerLabel}>{header.label}</span>
              )}
              {header.tooltip && (
                <span className={styles.headerTooltip}>
                  <BaseTooltip content={header.tooltip}>
                    <BaseIcon
                      name="tooltip"
                      size={header.tooltipIconSize || 16}
                      color="#A3A3A3"
                    />
                  </BaseTooltip>
                </span>
              )}
              {header.icon && (
                <span className={styles.headerIcon}>{header.icon}</span>
              )}
              {header.sortable && sortKey === header.key && (
                <span className={styles.sortIcon}>
                  {sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.body}>
        {data.length === 0 ? (
          <div
            className={styles.emptyState}
            style={emptyHeight ? { height: `${emptyHeight}px` } : undefined}
          >
            <p className={styles.emptyText}>{emptyMessage}</p>
          </div>
        ) : (
          data.map((row, rowIndex) => {
            const isTotalRow =
              totalRowIndex !== undefined && rowIndex === totalRowIndex;
            const currentRowHeight =
              isTotalRow && totalRowHeight !== undefined
                ? totalRowHeight
                : rowHeight;
            const isSelected = selectedRows.includes(rowIndex);

            return (
              <div
                key={rowIndex}
                className={`${styles.row} ${
                  enableRowHover ? styles.rowHover : ""
                } ${enableRowPointer ? styles.rowPointer : ""} ${
                  isTotalRow ? styles.totalRow : ""
                } ${customRowClassName}`}
                style={{ height: `${currentRowHeight}px` }}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {enableCheckbox && (
                  <div
                    className={`${styles.cell} ${styles.checkboxCell}`}
                    style={{ width: "48px" }}
                  >
                    <BaseCheckbox
                      checked={isSelected}
                      onChange={handleRowCheckboxChange(rowIndex)}
                      size={16}
                    />
                  </div>
                )}
                {headers.map((header) => {
                  const headerKey = String(header.key);
                  return (
                    <div
                      key={headerKey}
                      className={styles.cell}
                      style={{ width: header.width || "auto" }}
                    >
                      <BaseTableCell
                        cellData={getCellValue(row, header.key)}
                        align={header.align}
                        fontSize={bodyFontSize}
                        lineHeight={bodyLineHeight}
                        textColor={bodyTextColor}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BaseTable;
