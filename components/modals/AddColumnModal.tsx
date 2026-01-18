'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ColumnKind, labelToField } from '@/lib/dynamicSchema';

interface AddColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingFields: string[];
  onSubmit: (values: {
    headerName: string;
    field: string;
    type: ColumnKind;
    defaultValue: string;
  }) => void;
}

const columnTypes: Array<{ label: string; value: ColumnKind }> = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Badge', value: 'badge' },
  { label: 'Link', value: 'link' },
];

const sanitizeField = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');

const makeUniqueField = (field: string, existingFields: Set<string>) => {
  if (!field) return '';
  if (!existingFields.has(field)) return field;
  let counter = 2;
  let next = `${field}_${counter}`;
  while (existingFields.has(next)) {
    counter += 1;
    next = `${field}_${counter}`;
  }
  return next;
};

export function AddColumnModal({
  open,
  onOpenChange,
  existingFields,
  onSubmit,
}: AddColumnModalProps) {
  const [label, setLabel] = useState('');
  const [field, setField] = useState('');
  const [fieldTouched, setFieldTouched] = useState(false);
  const [type, setType] = useState<ColumnKind>('text');
  const [defaultValue, setDefaultValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const existingFieldSet = useMemo(
    () => new Set(existingFields.filter(Boolean)),
    [existingFields]
  );

  useEffect(() => {
    if (!open) return;
    setLabel('');
    setField('');
    setFieldTouched(false);
    setType('text');
    setDefaultValue('');
    setError(null);
  }, [open]);

  useEffect(() => {
    if (fieldTouched) return;
    const generated = labelToField(label);
    const unique = makeUniqueField(generated, existingFieldSet);
    setField(unique);
  }, [label, fieldTouched, existingFieldSet]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedLabel = label.trim();
    const sanitizedField = sanitizeField(field);

    if (!trimmedLabel) {
      setError('Column label is required.');
      return;
    }

    if (!sanitizedField) {
      setError('Column key is required.');
      return;
    }

    if (existingFieldSet.has(sanitizedField)) {
      setError('Column key must be unique.');
      return;
    }

    onSubmit({
      headerName: trimmedLabel,
      field: sanitizedField,
      type,
      defaultValue: defaultValue.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Add Column</DialogTitle>
          <DialogDescription>
            Add a new column to the current tab.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Column label
            </label>
            <input
              type="text"
              value={label}
              onChange={(event) => {
                setLabel(event.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Category"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Column key
            </label>
            <input
              type="text"
              value={field}
              onChange={(event) => {
                setFieldTouched(true);
                setField(sanitizeField(event.target.value));
                if (error) setError(null);
              }}
              placeholder="e.g. category"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as ColumnKind)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {columnTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Default value
            </label>
            <input
              type={type === 'number' ? 'number' : 'text'}
              value={defaultValue}
              onChange={(event) => setDefaultValue(event.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

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
              Add Column
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
