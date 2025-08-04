/**
 * Pagination component for navigating through paginated data
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = (): void => {
    if (canGoPrevious && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (): void => {
    if (canGoNext && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number): void => {
    if (!disabled && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = (): number[] => {
    const delta = 2; // Number of pages to show on each side of current page
    const pages: number[] = [];

    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={cn('flex items-center justify-center space-x-1', className)}
      aria-label="Pagination Navigation"
    >
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious || disabled}
        className={cn(
          'px-3 py-2 text-sm font-medium rounded-md transition-colors',
          canGoPrevious && !disabled
            ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
            : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
        )}
        aria-label="Previous page"
      >
        Previous
      </button>

      {/* First page if not in range */}
      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => handlePageClick(1)}
            disabled={disabled}
            className={cn(
              'px-3 py-2 text-sm font-medium rounded-md transition-colors',
              disabled
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span className="px-2 py-2 text-gray-400">...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {pageNumbers.map(page => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          disabled={disabled}
          className={cn(
            'px-3 py-2 text-sm font-medium rounded-md transition-colors',
            page === currentPage
              ? 'text-white bg-primary-600 border border-primary-600'
              : disabled
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
          )}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {/* Last page if not in range */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="px-2 py-2 text-gray-400">...</span>
          )}
          <button
            onClick={() => handlePageClick(totalPages)}
            disabled={disabled}
            className={cn(
              'px-3 py-2 text-sm font-medium rounded-md transition-colors',
              disabled
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!canGoNext || disabled}
        className={cn(
          'px-3 py-2 text-sm font-medium rounded-md transition-colors',
          canGoNext && !disabled
            ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
            : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
        )}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
};
