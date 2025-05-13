
export interface PiTag {
  id: string;
  name: string;
  description: string;
  site_id?: string;
  status: boolean | string; // Allow both boolean and string for status
  value?: number;
  unit?: string;
  timestamp?: string;
}
