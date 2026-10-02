// components/SortableHeader.tsx
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { TableSortingInterface } from '@/api';

const SortableHeader: React.FC<TableSortingInterface> = React.memo(({
    children,
    sortKey,
    currentSortKey,
    currentDirection,
    onSort,
}) => {
    const isActive = currentSortKey === sortKey;

    return (
        <th
            onClick={() => onSort(sortKey)}
            className="cursor-pointer select-none hover:bg-muted/50 transition-colors px-4 py-3 text-left font-medium text-sm"
        >
            <div className="flex items-center gap-1">
                {children}
                {isActive
                    ? currentDirection === 'asc'
                        ? <ArrowUp className="h-4 w-4 text-blue-600" />
                        : <ArrowDown className="h-4 w-4 text-blue-600" />
                    : <ArrowUp className="h-4 w-4 opacity-30" />
                }
            </div>
        </th>
    );
});

SortableHeader.displayName = 'SortableHeader';
export default SortableHeader;