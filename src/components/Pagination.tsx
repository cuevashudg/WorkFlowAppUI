import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>
      <span className="text-gray-700">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
};
