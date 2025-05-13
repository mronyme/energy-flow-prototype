
export interface PiTag {
  id: string;
  name: string;
  description: string;
  site_id?: string;
  // Standardize status handling - can be boolean (false/true) or string ('KO'/'OK')
  status: 'OK' | 'KO' | boolean;
  value?: number;
  unit?: string;
  timestamp?: string;
}
