
import { AnomalyType } from './index';

export interface AnomalyData {
  id: string;
  readingId: string;
  timestamp: string;
  value: number | null;
  meterId: string;
  meterName: string;
  meterType: string;
  siteId: string;
  siteName: string;
  type: AnomalyType;
  delta: number | null;
  comment: string | null;
}
