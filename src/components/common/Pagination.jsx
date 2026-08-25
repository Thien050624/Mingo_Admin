import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 0}
        aria-label="Trang trước"
        className="w-11 h-11 flex items-center justify-center rounded-lg border border-zm-border text-zm-muted hover:text-zm-blue-light hover:bg-zm-hover transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-zm-muted"
      >
        <FaChevronLeft size={12} aria-hidden="true" />
      </button>
      <span className="text-sm text-zm-muted">
        Trang <span className="font-semibold text-zm-text">{page + 1}</span> / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Trang sau"
        className="w-11 h-11 flex items-center justify-center rounded-lg border border-zm-border text-zm-muted hover:text-zm-blue-light hover:bg-zm-hover transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-zm-muted"
      >
        <FaChevronRight size={12} aria-hidden="true" />
      </button>
    </div>
  );
}
