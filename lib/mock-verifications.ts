import type { TabId } from '@/lib/grid-columns';
import type { EvidenceType, VerificationStatus } from '@/lib/verifications';
import { getVerificationsForRow, saveVerification } from '@/lib/verifications';

const TOOL_SEQUENCE = ['claude-3.5-sonnet', 'claude-sonnet-4', 'claude-3.5-sonnet'];

const FIELD_TEMPLATES: Record<
  string,
  { methods: string[]; sources: string[]; status?: VerificationStatus }
> = {
  location: {
    methods: [
      'Company website verification',
      'Business registration check',
      'Press release analysis',
    ],
    sources: [
      'Company website',
      'Business registry',
      'Official press releases',
    ],
  },
  founded: {
    methods: [
      'Company registration lookup',
      'News archive search',
      'LinkedIn company page',
    ],
    sources: [
      'Business registry',
      'TechCrunch archive',
      'LinkedIn profile data',
    ],
  },
  employees: {
    methods: [
      'LinkedIn analysis',
      'Job posting aggregation',
      'Company filing review',
    ],
    sources: [
      'LinkedIn company page',
      'Job boards aggregation',
      'Annual report',
    ],
  },
  status: {
    methods: [
      'Business registry check',
      'Website activity monitoring',
      'Recent transaction verification',
    ],
    sources: [
      'Company registry',
      'Uptime monitoring',
      'Recent press coverage',
    ],
  },
  revenue: {
    methods: [
      'Financial report analysis',
      'Revenue estimation',
      'News article aggregation',
    ],
    sources: [
      'Annual report',
      'Industry estimates',
      'Business news',
    ],
  },
  people: {
    methods: [
      'LinkedIn key people count',
      'Company website scraping',
      'Press release mentions',
    ],
    sources: [
      'LinkedIn executives',
      'Leadership page',
      'Press releases',
    ],
  },
  news: {
    methods: [
      'News database query',
      'Media monitoring scan',
      'Press release count',
    ],
    sources: [
      'Google News',
      'Media monitoring',
      'PR database',
    ],
  },
  matchStatus: {
    methods: [
      'Criteria evaluation',
      'Funding round verification',
      'Founder education check',
    ],
    sources: [
      'Internal criteria',
      'Funding database',
      'LinkedIn founder profiles',
    ],
  },
};

const DEFAULT_TEMPLATE = {
  methods: ['Public source scan', 'Cross-source validation'],
  sources: ['Company website', 'Public registry'],
};

const isBrowser = () => typeof window !== 'undefined';

const isEmptyValue = (value: any) => value === null || value === undefined || value === '';

const toStringValue = (value: any) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return String(value);
};

const formatMatchValue = (value: any) => {
  if (typeof value !== 'string') return value;
  if (value === 'not_match' || value === 'not-match') return 'Not Match';
  if (value === 'match') return 'Match';
  return value;
};

const normalizeSource = (source: string, row: any) => {
  if (source === 'Company website') {
    return row?.website || row?.url || source;
  }
  return source;
};

const toUrl = (source: string): string | null => {
  if (!source) return null;
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  if (source.includes('.') && !source.includes(' ')) {
    return `https://${source}`;
  }
  return null;
};

const buildFieldValues = (tabId: TabId, row: any): Record<string, any> => {
  if (tabId === 'companies') {
    return {
      location: row.location,
      founded: row.year || row.founded,
      employees: row.employees,
      status: row.status,
      revenue: row.revenue,
      people: row.people,
      news: row.news,
      matchStatus: formatMatchValue(row.matchStatus),
    };
  }
  if (tabId === 'people') {
    return {
      company: row.company,
      role: row.role,
      location: row.location,
      email: row.email,
      intents: row.intents,
      matchStatus: formatMatchValue(row.matchStatus),
    };
  }
  if (tabId === 'news') {
    return {
      source: row.source,
      date: row.date,
      company: row.company,
      matchStatus: formatMatchValue(row.matchStatus),
      significance_score: row.significance_score,
      relevance_score: row.relevance_score,
    };
  }
  if (tabId === 'signals') {
    return {
      signalType: row.signalType,
      person: row.person,
      company: row.company,
      date: row.date,
      confidence: row.confidence,
      source: row.source,
    };
  }
  if (tabId === 'market') {
    return {
      publisher: row.publisher,
      date: row.date,
      region: row.region,
      category: row.category,
      pages: row.pages,
    };
  }
  if (tabId === 'patents') {
    return {
      type: row.type,
      inventor: row.inventor,
      company: row.company,
      dateFiled: row.dateFiled,
      status: row.status,
      patentNumber: row.patentNumber,
    };
  }
  if (tabId === 'research-papers') {
    return {
      authors: row.authors,
      journal: row.journal,
      publicationDate: row.publicationDate,
      citations: row.citations,
      field: row.field,
    };
  }
  return {};
};

export const seedMockVerificationsForRow = (tabId: TabId, rowId: string, row: any) => {
  if (!isBrowser()) return false;
  if (!row || !rowId) return false;
  if (!row.__mock) return false;
  if (getVerificationsForRow(tabId, rowId).length > 0) return false;

  const fieldValues = buildFieldValues(tabId, row);
  const entries = Object.entries(fieldValues)
    .filter(([, value]) => !isEmptyValue(value))
    .flatMap(([fieldId, value]) => {
      const template = FIELD_TEMPLATES[fieldId] ?? DEFAULT_TEMPLATE;
      const count = Math.min(template.methods.length, template.sources.length, 3);
      const valueText = toStringValue(value);
      return Array.from({ length: count }).map((_, idx) => {
        const tool = TOOL_SEQUENCE[idx % TOOL_SEQUENCE.length];
        const method = template.methods[idx % template.methods.length];
        const rawSource = template.sources[idx % template.sources.length];
        const source = normalizeSource(rawSource, row);
        const url = toUrl(source);
        const evidenceType: EvidenceType = url ? 'url' : 'text';

        return {
          fieldId,
          value: valueText,
          tool,
          method,
          source,
          status: template.status ?? 'verified',
          evidenceType,
          url,
          quote: null,
          fileRef: null,
          notes: null,
        };
      });
    });

  entries.forEach((entry) => {
    saveVerification({
      tabId,
      rowId,
      fieldId: entry.fieldId,
      value: entry.value,
      tool: entry.tool,
      method: entry.method,
      source: entry.source,
      status: entry.status,
      evidenceType: entry.evidenceType,
      url: entry.url,
      quote: entry.quote,
      fileRef: entry.fileRef,
      notes: entry.notes,
    });
  });

  return entries.length > 0;
};
