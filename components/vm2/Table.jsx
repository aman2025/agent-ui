'use client';

import * as React from 'react';
import {
  Table as TableBase,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';

/**
 * VM2 Table Component
 * Renders a table with columns and data
 * Requirements: 4.2
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of { key, label } column definitions
 * @param {Object} props.data - Data binding with path property
 * @param {Array} props.currentData - Current data array from state
 */
export function Table({ columns = [], data, currentData = [] }) {
  // Use currentData if provided, otherwise use empty array
  const tableData = Array.isArray(currentData) ? currentData : [];

  return (
    <TableBase>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={column.key || index}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
              No data available
            </TableCell>
          </TableRow>
        ) : (
          tableData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, colIndex) => (
                <TableCell key={column.key || colIndex}>
                  {row[column.key] ?? ''}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </TableBase>
  );
}

export default Table;
