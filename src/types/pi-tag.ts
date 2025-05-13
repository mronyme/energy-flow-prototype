
export interface PiTag {
  id: string;
  name: string;
  description: string;
  site_id?: string;
  status: boolean | string; // Can be boolean (false/true) or string ('KO'/'OK')
  value?: number;
  unit?: string;
  timestamp?: string;
}
