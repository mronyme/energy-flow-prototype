export type Role = 'Operator' | 'DataManager' | 'Manager' | 'Admin';

export type MeterType = 'ELEC' | 'GAS' | 'WATER';

export type AnomalyType = 'MISSING' | 'SPIKE' | 'FLAT';

export interface Site {
  id: string;
  name: string;
  country: string;
  type?: 'CCGT' | 'Biomass' | 'Thermal'; // Added site type
}

export interface Meter {
  id: string;
  site_id: string;
  type: MeterType;
  site_name?: string;
  site_country?: string; // Add this for compatibility
}

export interface Reading {
  id?: string; // Make id optional for creation
  meter_id: string;
  ts: string;
  value: number;
}

export interface KpiDaily {
  id: string;
  site_id: string;
  day: string;
  // Renamed and extended metrics
  fuel_consumption_mwh: number;  // Renamed from kwh
  co2: number;
  cost_eur: number;
  // New energy production metrics
  electricity_production_mwh: number;
  heat_production_mwh: number;
  efficiency_percent: number;
  availability_percent: number;
}

export interface ImportLog {
  id: string;
  ts: string;
  user_email: string;
  rows_ok: number;
  rows_err: number;
  file_name: string;
}

export interface Anomaly {
  id: string;
  reading_id: string;
  type: AnomalyType;
  delta: number | null;
  comment: string | null;
  reading?: any; // Add this for compatibility
}

export interface User {
  id: string;
  email: string;
  role: Role;
}

// Updated PiTag interface to make it more flexible
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

// Updated interfaces for the components
export interface SkipLinkProps {
  href?: string;
  target?: string;
  label: string;
}

export interface WizardStepProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  steps: { id: string; label: string; isActive: boolean; isComplete: boolean; }[]; // Make steps required
}

export interface FileUploadProps {
  onFileSelected: (parsedData: any[], file: File) => void;
  accept?: string;
  maxSize?: number;
}

export interface LogTableProps {
  entries?: ImportLog[];
  logs?: ImportLog[];
  isLoading?: boolean;
  loading?: boolean; // Add this for compatibility
}

export interface UserListProps {
  users: User[];
  onDeleteUser?: (id: string) => void;
  isLoading?: boolean;
}

export interface UserFormProps {
  onSubmit: (formData: { email: string; password: string; role: Role; }) => Promise<void>;
  isSubmitting?: boolean;
}

export interface DataGridEditableProps {
  data: any[];
  columns: { field: string; headerName: string; type: 'text' | 'number' }[];
  onRowUpdate: (id: string, field: string, value: any) => Promise<void>;
  isLoading?: boolean;
}

export interface ThresholdBadgeProps {
  value?: number;
  delta?: number;
  className?: string;
}

export interface AlertCardProps {
  id?: string;
  title?: string;
  description?: string;
  anomaly?: any;
  onClick?: () => void;
  key?: string;
}

export interface AuditLog {
  id: string;
  ts: string;
  user_email: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_value?: string;
  new_value?: string;
  description?: string;
}
