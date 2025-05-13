
import { AnomalyType } from '@/types';

export interface AnomalyData {
  id: string;
  readingId: string;
  timestamp: string;
  value: number | null;
  meterId: string;
  meterName: string;
  meterType: string;
  siteName: string;
  siteId: string; 
  type: AnomalyType;
  delta: number | null;
  comment: string | null;
}
