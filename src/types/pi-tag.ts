
import { MeterType } from './index';

export interface PiTag {
  id: string;
  name: string;
  description: string;
  unit: string;
  status: 'active' | 'inactive' | 'OK' | 'KO' | null;
}

export interface PiService {
  getTags: () => Promise<PiTag[]>;
  getSites: () => Promise<{ id: string; name: string }[]>;
  getTagsBySite: (siteId: string) => Promise<PiTag[]>;
  testTag: (tagName: string) => Promise<boolean>;
}

export interface AnomalyService {
  getAll: () => Promise<Anomaly[]>;
  getSites: () => Promise<{ id: string; name: string }[]>;
  getAnomalies: (filters: AnomalyFilter) => Promise<Anomaly[]>;
  getByReadingId: (readingId: string) => Promise<Anomaly>;
  update: (anomaly: Partial<Anomaly>) => Promise<Anomaly>;
  updateComment: (id: string, comment: string) => Promise<Anomaly>;
  correctAnomaly: (data: { readingId: string; value: number; comment: string }) => Promise<void>;
  getAnomalyDetails: () => Promise<AnomaliesTotalCount>;
}

export interface AnomalyFilter {
  siteId?: string;
  startDate: string;
  endDate: string;
}

export interface Anomaly {
  id: string;
  readingId: string;  // Frontend property name
  reading_id?: string; // Database property name for compatibility
  meterId: string;
  meterName: string;
  siteName: string;
  date: string;
  value: number | null;
  type: 'MISSING' | 'SPIKE' | 'FLAT';
  delta?: number | null;
  comment?: string;
  site: string;
  meter: string;
}

export interface AnomaliesTotalCount {
  missing: number;
  spike: number;
  flat: number;
  total: number;
}

export interface JournalService {
  getImportLogs: (filters: JournalFilter) => Promise<ImportLog[]>;
  exportCsv: (filters: JournalFilter) => Promise<void>;
}

export interface JournalFilter {
  startDate: string;
  endDate: string;
}

export interface ImportLog {
  id: string;
  ts: string;
  user_email: string;
  rows_ok: number;
  rows_err: number;
  file_name: string;
}
