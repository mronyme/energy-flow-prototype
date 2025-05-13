
export interface PiTag {
  id: string;
  name: string;
  description: string;
  site_id?: string;
  // Standardize status handling - make it a union type with specific values
  status: 'OK' | 'KO' | 'active' | 'inactive';
  value?: number;
  unit?: string;
  timestamp?: string;
}
