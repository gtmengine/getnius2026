'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ColDef } from 'ag-grid-community';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ColumnKind } from '@/lib/dynamicSchema';

interface AddRowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ColDef[];
  rowData: any[];
  onSubmit: (values: Record<string, any>) => void;
}

const getFieldType = (
  colDef: ColDef,
  rowData: any[]
): ColumnKind | 'text' | 'number' => {
  const columnType = (colDef as { columnType?: ColumnKind }).columnType;
  if (columnType === 'number' || colDef.type === 'number') {
    return 'number';
  }
  if (
    columnType === 'badge' ||
    columnType === 'link' ||
    columnType === 'url' ||
    columnType === 'email' ||
    columnType === 'select' ||
    columnType === 'multi-select' ||
    columnType === 'checkbox'
  ) {
    return 'text';
  }

  const field = colDef.field;
  if (!field) return 'text';

  const sample = rowData.find((row) => row?.[field] !== undefined);
  if (sample && typeof sample[field] === 'number') {
    return 'number';
  }

  return 'text';
};

export function AddRowModal({
  open,
  onOpenChange,
  columns,
  rowData,
  onSubmit,
}: AddRowModalProps) {
  const dataColumns = useMemo(
    () => columns.filter((col) => col.field),
    [columns]
  );

  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const nextValues: Record<string, string> = {};
    dataColumns.forEach((col) => {
      if (col.field) {
        nextValues[col.field] = '';
      }
    });
    setValues(nextValues);
  }, [open, dataColumns]);

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const payload: Record<string, any> = {};

    dataColumns.forEach((col) => {
      if (!col.field) return;
      const rawValue = values[col.field] ?? '';
      const inputType = getFieldType(col, rowData);

      if (inputType === 'number') {
        payload[col.field] = rawValue === '' ? '' : Number(rawValue);
      } else {
        payload[col.field] = rawValue;
      }
    });

    onSubmit(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Add Row</DialogTitle>
          <DialogDescription>
            Fill in the values for the new row.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {dataColumns.map((col) => {
              if (!col.field) return null;
              const inputType = getFieldType(col, rowData);
              const label = col.headerName || col.field;

              return (
                <div key={col.field} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <input
                    type={inputType === 'number' ? 'number' : 'text'}
                    value={values[col.field] ?? ''}
                    onChange={(event) => handleChange(col.field as string, event.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Add Row
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
