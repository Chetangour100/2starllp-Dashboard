// components/PaginationControls.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { PaginationControlInterface } from '@/api';

const PaginationControls = React.memo(
  ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    pageSizeOptions,
    startItem,
    endItem,
    visiblePages,
    onPageChange,
    onPageSizeChange,
  }: PaginationControlInterface) => {
    return (
      <>
        <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

            {/* Rows per page */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="whitespace-nowrap">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Page info */}
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              Showing <span className="font-medium text-foreground">{startItem}</span> to{' '}
              <span className="font-medium text-foreground">{endItem}</span> of{' '}
              <span className="font-medium text-foreground">{totalItems}</span> results
            </div>

            {/* Pagination buttons */}
            <nav className="flex items-center justify-center sm:justify-end gap-1.5" aria-label="Pagination">
              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {visiblePages.map((page, index) =>
                page === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    onClick={() => onPageChange(page as number)}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-9
              ${currentPage === page
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'border border-input text-foreground bg-background hover:bg-accent hover:text-accent-foreground'
                      }`}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center rounded-md text-sm text-foreground font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </>
    );
  }
);

PaginationControls.displayName = 'PaginationControls';

export default PaginationControls;