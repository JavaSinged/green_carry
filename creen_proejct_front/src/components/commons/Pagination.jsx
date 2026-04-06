import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import styles from "./Pagination.module.css";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages === 0) return null;

  return (
    <div className={styles.pagination}>
      <button
        className={styles.page_btn_nav}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeftIcon fontSize="small" /> 이전
      </button>

      <div className={styles.page_numbers}>
        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              className={`${styles.page_num} ${
                currentPage === pageNum ? styles.active : ""
              }`}
              onClick={() => onPageChange(pageNum)}
            >
              {String(pageNum).padStart(2, "0")}
            </button>
          );
        })}
      </div>

      <button
        className={styles.page_btn_nav}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        다음 <ChevronRightIcon fontSize="small" />
      </button>
    </div>
  );
}
