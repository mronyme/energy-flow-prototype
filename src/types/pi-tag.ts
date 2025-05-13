
export interface PiTag {
  id: string;
  name: string;
  description: string;
  site_id?: string;
  // Use a union type with specific string literals for status
  status: 'OK' | 'KO' | 'active' | 'inactive';
  value?: number;
  unit?: string;
  timestamp?: string;
}
