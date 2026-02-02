import type { TabId } from '@/lib/grid-columns';

export type RowDetailsLink = { href: string; label?: string };

export type RowDetailsField = {
  label: string;
  value: string | number | null | undefined;
  fieldId?: string;
};

export type RowDetailsModel = {
  title: string;
  link?: RowDetailsLink;
  fields: RowDetailsField[];
  summary?: string;
};

const toLink = (href?: string, label?: string): RowDetailsLink | undefined => {
  if (!href) return undefined;
  return { href, label };
};

const formatMatchStatus = (status: unknown) => {
  if (!status) return undefined;
  if (typeof status === 'string') {
    if (status.toLowerCase() === 'match') return 'Match';
    if (status.toLowerCase() === 'not-match') return 'Not Match';
    if (status.toLowerCase() === 'neutral') return 'Neutral';
  }
  return String(status);
};

const formatScore = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toFixed(1);
  }
  return value as string | number | null | undefined;
};

export function mapRowToSidebarModel(tabKey: TabId | string, row: any): RowDetailsModel {
  if (!row) {
    return { title: 'Details', fields: [] };
  }

  const tab = tabKey as TabId;

  if (tab === 'news') {
    return {
      title: row.title || 'News',
      link: toLink(row.url, row.source || 'Open article'),
      fields: [
        { label: 'Source', value: row.source, fieldId: 'source' },
        { label: 'Date', value: row.date, fieldId: 'date' },
        { label: 'Company', value: row.company, fieldId: 'company' },
        { label: 'Match', value: formatMatchStatus(row.matchStatus), fieldId: 'matchStatus' },
        { label: 'Significance', value: formatScore(row.significance_score), fieldId: 'significance_score' },
        { label: 'Relevance', value: formatScore(row.relevance_score), fieldId: 'relevance_score' },
      ],
      summary: row.summary || row.snippet,
    };
  }

  if (tab === 'companies') {
    return {
      title: row.name || row.company || 'Company',
      link: toLink(row.website || row.url, row.website ? 'Website' : 'Open site'),
      fields: [
        { label: 'Location', value: row.location, fieldId: 'location' },
        { label: 'Founded', value: row.year || row.founded, fieldId: 'founded' },
        { label: 'Employees', value: row.employees, fieldId: 'employees' },
        { label: 'Status', value: row.status, fieldId: 'status' },
        { label: 'Revenue', value: row.revenue, fieldId: 'revenue' },
        { label: 'People', value: row.people, fieldId: 'people' },
        { label: 'News', value: row.news, fieldId: 'news' },
        { label: 'Match', value: formatMatchStatus(row.matchStatus), fieldId: 'matchStatus' },
      ],
      summary: row.description || row.summary || row.snippet,
    };
  }

  if (tab === 'people') {
    return {
      title: row.name || 'Person',
      link: toLink(row.linkedin || row.url, row.linkedin ? 'LinkedIn' : 'Profile'),
      fields: [
        { label: 'Company', value: row.company, fieldId: 'company' },
        { label: 'Role', value: row.role, fieldId: 'role' },
        { label: 'Location', value: row.location, fieldId: 'location' },
        { label: 'Email', value: row.email, fieldId: 'email' },
        { label: 'Intents', value: row.intents, fieldId: 'intents' },
        { label: 'Match', value: formatMatchStatus(row.matchStatus), fieldId: 'matchStatus' },
      ],
      summary: row.summary || row.snippet,
    };
  }

  if (tab === 'signals') {
    return {
      title: row.title || row.signalType || 'Signal',
      link: toLink(row.url || row.source, row.url ? 'Open source' : 'Source'),
      fields: [
        { label: 'Signal Type', value: row.signalType, fieldId: 'signalType' },
        { label: 'Person', value: row.person, fieldId: 'person' },
        { label: 'Company', value: row.company, fieldId: 'company' },
        { label: 'Date', value: row.date, fieldId: 'date' },
        { label: 'Confidence', value: row.confidence, fieldId: 'confidence' },
        { label: 'Source', value: row.source, fieldId: 'source' },
      ],
      summary: row.description || row.summary || row.snippet,
    };
  }

  if (tab === 'market') {
    return {
      title: row.title || 'Market Report',
      link: toLink(row.url, 'Open report'),
      fields: [
        { label: 'Publisher', value: row.publisher, fieldId: 'publisher' },
        { label: 'Date', value: row.date, fieldId: 'date' },
        { label: 'Region', value: row.region, fieldId: 'region' },
        { label: 'Category', value: row.category, fieldId: 'category' },
        { label: 'Pages', value: row.pages, fieldId: 'pages' },
      ],
      summary: row.summary || row.snippet,
    };
  }

  if (tab === 'patents') {
    return {
      title: row.title || 'Patent',
      link: toLink(row.url, 'Open patent'),
      fields: [
        { label: 'Type', value: row.type, fieldId: 'type' },
        { label: 'Inventor/Author', value: row.inventor, fieldId: 'inventor' },
        { label: 'Company', value: row.company, fieldId: 'company' },
        { label: 'Date Filed', value: row.dateFiled, fieldId: 'dateFiled' },
        { label: 'Status', value: row.status, fieldId: 'status' },
        { label: 'Patent Number', value: row.patentNumber, fieldId: 'patentNumber' },
      ],
      summary: row.summary || row.snippet,
    };
  }

  if (tab === 'research-papers') {
    return {
      title: row.title || 'Research Paper',
      link: toLink(row.url, 'Open paper'),
      fields: [
        { label: 'Authors', value: row.authors, fieldId: 'authors' },
        { label: 'Journal/Conference', value: row.journal, fieldId: 'journal' },
        { label: 'Publication Date', value: row.publicationDate, fieldId: 'publicationDate' },
        { label: 'Citations', value: row.citations, fieldId: 'citations' },
        { label: 'Field', value: row.field, fieldId: 'field' },
      ],
      summary: row.summary || row.snippet,
    };
  }

  return {
    title: row.title || row.name || row.company || 'Details',
    link: toLink(row.url),
    fields: [],
    summary: row.summary || row.snippet,
  };
}
