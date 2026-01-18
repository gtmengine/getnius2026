export function toCSV(rows: any[], columns?: string[]): string {
  const resolvedColumns = columns && columns.length > 0
    ? columns
    : rows.length > 0
      ? Object.keys(rows[0])
      : [];

  if (resolvedColumns.length === 0) {
    return '';
  }

  const escapeValue = (value: any) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const header = resolvedColumns.map(escapeValue).join(',');
  const body = rows.map((row) =>
    resolvedColumns.map((column) => escapeValue(row?.[column])).join(',')
  );

  return [header, ...body].join('\n');
}

export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
