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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

interface AddColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingFields: string[];
  existingColumns: Array<{ field: string; headerName: string }>;
  onSubmit: (values: {
    headerName: string;
    field: string;
    type: ColumnKind;
    prompt: string;
    formatInstructions: string;
    contextScope: { mode: 'all' | 'selected'; columns: string[] };
    restrictSources: boolean;
  }) => void;
}

const columnTypes: Array<{ label: string; value: ColumnKind }> = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'URL', value: 'url' },
  { label: 'Email', value: 'email' },
  { label: 'Select', value: 'select' },
  { label: 'Multi-Select', value: 'multi-select' },
];

const slugifyField = (value: string) => {
  const normalized = labelToField(value).replace(/_/g, '-');
  if (!normalized) return '';
  return normalized
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const makeUniqueField = (field: string, existingFields: Set<string>) => {
  if (!field) return '';
  if (!existingFields.has(field)) return field;
  let counter = 2;
  let next = `${field}-${counter}`;
  while (existingFields.has(next)) {
    counter += 1;
    next = `${field}-${counter}`;
  }
  return next;
};

export function AddColumnModal({
  open,
  onOpenChange,
  existingFields,
  existingColumns,
  onSubmit,
}: AddColumnModalProps) {
  const [columnName, setColumnName] = useState('');
  const [dataType, setDataType] = useState<ColumnKind>('text');
  const [prompt, setPrompt] = useState('');
  const [formatInstructions, setFormatInstructions] = useState('');
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [contextMode, setContextMode] = useState<'all' | 'selected'>('all');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [restrictSources, setRestrictSources] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingFieldSet = useMemo(
    () => new Set(existingFields.filter(Boolean)),
    [existingFields]
  );

  useEffect(() => {
    if (!open) return;
    setColumnName('');
    setDataType('text');
    setPrompt('');
    setFormatInstructions('');
    setIsFormatOpen(false);
    setContextMode('all');
    setSelectedColumns([]);
    setRestrictSources(false);
    setError(null);
  }, [open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedLabel = columnName.trim();
    const generatedField = makeUniqueField(slugifyField(trimmedLabel), existingFieldSet);

    if (!trimmedLabel) {
      setError('Column name is required.');
      return;
    }

    if (!generatedField) {
      setError('Column key could not be generated.');
      return;
    }

    onSubmit({
      headerName: trimmedLabel,
      field: generatedField,
      type: dataType,
      prompt: prompt.trim(),
      formatInstructions: formatInstructions.trim(),
      contextScope: {
        mode: contextMode,
        columns: contextMode === 'selected' ? selectedColumns : [],
      },
      restrictSources,
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
              Column name
            </label>
            <input
              type="text"
              value={columnName}
              onChange={(event) => {
                setColumnName(event.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Funding stage"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data Type</label>
            <select
              value={dataType}
              onChange={(event) => setDataType(event.target.value as ColumnKind)}
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
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Optional"
              className="min-h-[90px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <Collapsible open={isFormatOpen} onOpenChange={setIsFormatOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <span>Add format instructions</span>
                <span className="text-xs text-gray-500">
                  {isFormatOpen ? 'Hide' : 'Show'}
                </span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Format instructions
                </label>
                <textarea
                  value={formatInstructions}
                  onChange={(event) => setFormatInstructions(event.target.value)}
                  placeholder="Optional"
                  className="min-h-[90px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Context scope</div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="context-scope"
                  value="all"
                  checked={contextMode === 'all'}
                  onChange={() => setContextMode('all')}
                  className="h-4 w-4"
                />
                All
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="context-scope"
                  value="selected"
                  checked={contextMode === 'selected'}
                  onChange={() => setContextMode('selected')}
                  className="h-4 w-4"
                />
                Selected columns
              </label>
            </div>
            {contextMode === 'selected' && (
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                {existingColumns.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No columns available.
                  </div>
                ) : (
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {existingColumns.map((column) => {
                      const label = column.headerName || column.field;
                      const isChecked = selectedColumns.includes(column.field);
                      return (
                        <label
                          key={column.field}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const next = Boolean(checked);
                              setSelectedColumns((prev) =>
                                next
                                  ? [...prev, column.field]
                                  : prev.filter((item) => item !== column.field)
                              );
                            }}
                          />
                          <span>{label}</span>
                          <span className="text-xs text-gray-400">
                            {column.field}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-3">
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-gray-700">
                Restrict sources
              </div>
              <div className="text-xs text-gray-500">
                Limit enrichment to approved sources only.
              </div>
            </div>
            <Switch
              checked={restrictSources}
              onCheckedChange={setRestrictSources}
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
