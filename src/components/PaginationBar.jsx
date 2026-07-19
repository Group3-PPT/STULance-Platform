import { Pagination } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationBar = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      for (let i = 1; i < Math.max(2, currentPage - delta); i++) {
        rangeWithDots.push(i);
      }
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      for (let i = Math.min(totalPages - 1, currentPage + delta) + 1; i <= totalPages; i++) {
        rangeWithDots.push(i);
      }
    }

    return rangeWithDots;
  };

  return (
    <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
      </button>

      {getVisiblePages().map((page, idx) =>
        page === '...' ? (
          <span key={`dots-${idx}`} className="pagination-dots">...</span>
        ) : (
          <button
            key={page}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}

      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default PaginationBar;
