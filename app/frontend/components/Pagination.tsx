import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount?: number;
  perPage?: number;
}

function buildPageWindows(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  if (windowStart > 2) pages.push('...');

  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  if (windowEnd < totalPages - 1) pages.push('...');

  pages.push(totalPages);
  return pages;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  perPage,
}) => {
  const showingFrom = totalCount != null && perPage != null
    ? (currentPage - 1) * perPage + 1
    : null;
  const showingTo = totalCount != null && perPage != null
    ? Math.min(currentPage * perPage, totalCount)
    : null;

  const hasMultiplePages = totalPages > 1;

  if (!hasMultiplePages && showingFrom == null) return null;

  const pages = hasMultiplePages ? buildPageWindows(currentPage, totalPages) : [];

  return (
    <div className="flex items-center justify-between mt-4">
      {showingFrom != null && showingTo != null && totalCount != null ? (
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{showingFrom}</span>–<span className="font-medium text-gray-700">{showingTo}</span> of{' '}
          <span className="font-medium text-gray-700">{totalCount}</span> results
        </p>
      ) : (
        <div />
      )}

      {hasMultiplePages && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages.map((page, idx) =>
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-sm text-gray-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-8 h-8 px-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  page === currentPage
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
};

export default Pagination;
