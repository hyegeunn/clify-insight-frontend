import { useTranslation } from "react-i18next";
import type { BasePaginationProps } from "@/types";
import BaseIcon from "./BaseIcon";
import styles from "./BasePagination.module.scss";

const BasePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: BasePaginationProps) => {
  const { t } = useTranslation();
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    } else if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    return pages;
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        className={styles.arrowButton}
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        aria-label={t("pagination.prev")}
      >
        <BaseIcon name="chevronLeft" size={20} color="#9D9D9D" />
      </button>

      <div className={styles.pages}>
        {pageNumbers.map((page) => (
          <button
            type="button"
            key={page}
            className={`${styles.pageButton} ${
              page === currentPage ? styles.active : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={styles.arrowButton}
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        aria-label={t("pagination.next")}
      >
        <BaseIcon name="chevronRight" size={20} color="#9D9D9D" />
      </button>
    </div>
  );
};

export default BasePagination;
