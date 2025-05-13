
export interface PiTag {
  id: string;
  name: string;
  description?: string;
  site_id?: string;
  status: boolean; // Changed from string to boolean to match expected type
  value?: number;
  unit?: string;
  timestamp?: string;
}
