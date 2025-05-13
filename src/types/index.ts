
export type Role = 'Operator' | 'DataManager' | 'Manager' | 'Admin';

export type MeterType = 'ELEC' | 'GAS' | 'WATER';

export type AnomalyType = 'MISSING' | 'SPIKE' | 'FLAT';

export interface Site {
  id: string;
  name: string;
  country: string;
}

export interface Meter {
  id: string;
  site_id: string;
  type: MeterType;
}

export interface Reading {
  id: string;
  meter_id: string;
  ts: string;
  value: number;
}

export interface KpiDaily {
  id: string;
  site_id: string;
  day: string;
  kwh: number;
  co2: number;
  cost_eur: number;
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
}

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface PiTag {
  id: string;
  name: string;
  description: string;
  unit: string;
  status: 'active' | 'inactive';
}
