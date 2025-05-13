import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Site, Meter, Reading, KpiDaily, ImportLog, Anomaly, PiTag, User, Role } from "../types";

// Site service
export const siteService = {
  getAll: async (): Promise<Site[]> => {
    try {
      const { data, error } = await supabase
        .from('site')
        .select('*');
      
      if (error) throw error;
      return data as Site[];
    } catch (error) {
      console.error('Error fetching sites:', error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<Site | null> => {
    try {
      const { data, error } = await supabase
        .from('site')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Site;
    } catch (error) {
      console.error('Error fetching site by ID:', error);
      return null;
    }
  }
};

// Meter service
export const meterService = {
  getSites: async () => {
    try {
      const { data, error } = await supabase
        .from('site')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }
  },
  
  getMetersBySite: async (siteId: string) => {
    try {
      // Mock implementation for the prototype
      // In a real implementation, this would call the API
      await delay(500);
      return mockMeters.filter(meter => meter.site_id === siteId);
    } catch (error) {
      console.error('Error fetching meters:', error);
      throw error;
    }
  },
  
  saveReading: async (data: { meter_id: string; value: number; ts: string }) => {
    try {
      // Mock implementation for the prototype
      await delay(800);
      // This would be replaced with a real API call in production
      console.log('Saving reading:', data);
      return { success: true };
    } catch (error) {
      console.error('Error saving reading:', error);
      throw error;
    }
  }
};

// Reading service
export const readingService = {
  getByMeterAndDate: async (meterId: string, date: string): Promise<Reading | null> => {
    try {
      // Convert date string to date object
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('reading')
        .select('*')
        .eq('meter_id', meterId)
        .gte('ts', startDate.toISOString())
        .lte('ts', endDate.toISOString())
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] as Reading : null;
    } catch (error) {
      console.error('Error fetching reading:', error);
      return null;
    }
  },
  
  getAll: async (): Promise<Reading[]> => {
    try {
      const { data, error } = await supabase
        .from('reading')
        .select('*');
      
      if (error) throw error;
      return data as Reading[];
    } catch (error) {
      console.error('Error fetching readings:', error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<Reading | null> => {
    try {
      const { data, error } = await supabase
        .from('reading')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Reading;
    } catch (error) {
      console.error('Error fetching reading by ID:', error);
      return null;
    }
  },
  
  create: async (reading: Partial<Reading>): Promise<Reading | null> => {
    try {
      const { data, error } = await supabase
        .from('reading')
        .insert({
          meter_id: reading.meter_id,
          ts: reading.ts,
          value: reading.value
        })
        .select();
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] as Reading : null;
    } catch (error) {
      console.error('Error creating reading:', error);
      toast.error('Failed to save reading');
      return null;
    }
  },
  
  update: async (reading: Partial<Reading>): Promise<Reading | null> => {
    try {
      const { data, error } = await supabase
        .from('reading')
        .update({
          value: reading.value
        })
        .eq('id', reading.id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] as Reading : null;
    } catch (error) {
      console.error('Error updating reading:', error);
      toast.error('Failed to save reading');
      return null;
    }
  },
  
  save: async (reading: Partial<Reading>): Promise<Reading | null> => {
    // Add backwards compatibility for old code
    if (reading.id) {
      return readingService.update(reading);
    } else {
      return readingService.create(reading);
    }
  },
  
  bulkCreate: async (readings: Partial<Reading>[]): Promise<{rowsOk: number, rowsErr: number}> => {
    try {
      const { data, error } = await supabase
        .from('reading')
        .insert(readings.map(r => ({
          meter_id: r.meter_id,
          ts: r.ts,
          value: r.value
        })));
      
      if (error) throw error;
      
      return {
        rowsOk: readings.length,
        rowsErr: 0
      };
    } catch (error) {
      console.error('Error bulk creating readings:', error);
      return {
        rowsOk: 0,
        rowsErr: readings.length
      };
    }
  },
  
  // Alias for bulkCreate for backwards compatibility
  bulkImport: async (readings: Partial<Reading>[]): Promise<{rowsOk: number, rowsErr: number}> => {
    return readingService.bulkCreate(readings);
  }
};

// KPI service
export const kpiService = {
  getByDateRange: async (fromDate: string, toDate: string): Promise<KpiDaily[]> => {
    try {
      const { data, error } = await supabase
        .from('kpi_daily')
        .select('*')
        .gte('day', fromDate)
        .lte('day', toDate);
      
      if (error) throw error;
      return data as KpiDaily[];
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      return [];
    }
  }
};

// Import log service
export const importLogService = {
  getAll: async (): Promise<ImportLog[]> => {
    try {
      const { data, error } = await supabase
        .from('import_log')
        .select('*')
        .order('ts', { ascending: false });
      
      if (error) throw error;
      return data as ImportLog[];
    } catch (error) {
      console.error('Error fetching import logs:', error);
      return [];
    }
  },
  
  getByDateRange: async (fromDate: string, toDate: string): Promise<ImportLog[]> => {
    try {
      const startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('import_log')
        .select('*')
        .gte('ts', startDate.toISOString())
        .lte('ts', endDate.toISOString())
        .order('ts', { ascending: false });
      
      if (error) throw error;
      return data as ImportLog[];
    } catch (error) {
      console.error('Error fetching import logs by date range:', error);
      return [];
    }
  },
  
  create: async (importLog: Partial<ImportLog>): Promise<ImportLog | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email || importLog.user_email || 'unknown';
      
      const { data, error } = await supabase
        .from('import_log')
        .insert({
          user_email: userEmail,
          rows_ok: importLog.rows_ok || 0,
          rows_err: importLog.rows_err || 0,
          file_name: importLog.file_name || 'unknown'
        })
        .select();
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] as ImportLog : null;
    } catch (error) {
      console.error('Error creating import log:', error);
      return null;
    }
  }
};

// Anomaly service
export const anomalyService = {
  getAll: async (): Promise<Anomaly[]> => {
    try {
      // Mock implementation
      await delay(800);
      return mockAnomalies;
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      return [];
    }
  },
  
  getSites: async () => {
    try {
      // Mock implementation for the prototype
      await delay(500);
      return mockSites;
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }
  },
  
  getAnomalies: async ({ siteId, startDate, endDate }: { siteId?: string; startDate: string; endDate: string }) => {
    try {
      // Mock implementation
      await delay(800);
      
      let filteredAnomalies = [...mockAnomalies];
      
      // Filter by site if specified
      if (siteId && siteId !== 'all') {
        filteredAnomalies = filteredAnomalies.filter(
          anomaly => anomaly.site === siteId
        );
      }
      
      // In a real app, we would filter by date range here
      
      return filteredAnomalies;
    } catch (error) {
      console.error('Error fetching filtered anomalies:', error);
      throw error;
    }
  },
  
  getByReadingId: async (readingId: string) => {
    try {
      // Mock implementation
      await delay(500);
      const anomaly = mockAnomalies.find(a => a.readingId === readingId);
      if (!anomaly) throw new Error('Anomaly not found');
      return anomaly;
    } catch (error) {
      console.error('Error fetching anomaly details:', error);
      throw error;
    }
  },
  
  update: async (anomaly: Partial<Anomaly>) => {
    try {
      // Mock implementation
      await delay(800);
      // This would update the anomaly in a real app
      console.log('Updating anomaly:', anomaly);
      return { ...mockAnomalies[0], ...anomaly };
    } catch (error) {
      console.error('Error updating anomaly:', error);
      throw error;
    }
  },
  
  updateComment: async (id: string, comment: string) => {
    try {
      // Mock implementation
      await delay(800);
      console.log('Updating anomaly comment:', { id, comment });
      // Return the mock anomaly with updated comment
      return { ...mockAnomalies.find(a => a.id === id) || mockAnomalies[0], comment };
    } catch (error) {
      console.error('Error updating anomaly comment:', error);
      throw error;
    }
  },
  
  correctAnomaly: async ({ readingId, value, comment }: { readingId: string; value: number; comment: string }) => {
    try {
      // Mock implementation
      await delay(1000);
      console.log('Correcting anomaly:', { readingId, value, comment });
    } catch (error) {
      console.error('Error correcting anomaly:', error);
      throw error;
    }
  },
  
  getAnomalyDetails: async () => {
    try {
      // Mock implementation
      await delay(500);
      return {
        missing: 12,
        spike: 8,
        flat: 5,
        total: 25
      };
    } catch (error) {
      console.error('Error fetching anomaly counts:', error);
      throw error;
    }
  }
};

// User service
export const userService = {
  createUser: async (email: string, role: Role): Promise<{ id: string }> => {
    try {
      // In a real app, this would connect to Supabase Auth
      // For the prototype, we'll simulate user creation
      const id = `user-${Math.random().toString(36).substring(2, 11)}`;
      
      toast.success(`User ${email} would be created with role ${role}`);
      return { id };
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
      throw new Error('Failed to create user');
    }
  }
};

// Emission factor service
export const factorService = {
  getEmissionFactors: async () => {
    // For the prototype, we'll return mock emission factors
    return [
      { id: '1', name: 'Electricity France', value: 0.052, unit: 'kgCO2/kWh' },
      { id: '2', name: 'Natural Gas', value: 0.184, unit: 'kgCO2/kWh' },
      { id: '3', name: 'Water Processing', value: 0.344, unit: 'kgCO2/m³' }
    ];
  },
  
  updateFactor: async (id: string, value: number) => {
    // For the prototype, we'll simulate updating a factor
    toast.success(`Emission factor ${id} updated to ${value}`);
    return { id, value };
  }
};

// PI Service 
export const piService = {
  getTags: async () => {
    try {
      // Mock implementation
      await delay(800);
      return mockPiTags;
    } catch (error) {
      console.error('Error fetching PI tags:', error);
      throw error;
    }
  },
  
  getSites: async () => {
    try {
      // Mock implementation for the prototype
      await delay(500);
      return mockSites;
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }
  },
  
  getTagsBySite: async (siteId: string) => {
    try {
      // Mock implementation
      await delay(800);
      // Filter tags by site (for demo purposes)
      return mockPiTags.filter((_, index) => index % 3 === parseInt(siteId) % 3);
    } catch (error) {
      console.error('Error fetching PI tags by site:', error);
      throw error;
    }
  },
  
  testTag: async (tagName: string) => {
    try {
      // Mock implementation - simulates a tag test
      await delay(1000);
      // 80% success rate for demo
      return Math.random() > 0.2;
    } catch (error) {
      console.error('Error testing PI tag:', error);
      throw error;
    }
  }
};

// Alias piService.testTag as piTagService.testTag for backwards compatibility
export const piTagService = {
  testTag: piService.testTag
};

// Import service
export const importService = {
  importCsv: async ({ data, fileName, userEmail }: { data: any[], fileName: string, userEmail: string }) => {
    try {
      // Process CSV data and save to readings
      let rowsOk = 0;
      let rowsErr = 0;
      
      // In a real app, this would be a batch operation
      // For this prototype, we'll simulate success/error counts
      rowsOk = Math.floor(data.length * 0.9); // 90% success
      rowsErr = data.length - rowsOk;
      
      // Log the import
      const { error } = await supabase
        .from('import_log')
        .insert({
          user_email: userEmail,
          rows_ok: rowsOk,
          rows_err: rowsErr,
          file_name: fileName
        });
        
      if (error) throw error;
      
      return { rowsOk, rowsErr };
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw error;
    }
  }
};

// Journal service
export const journalService = {
  getImportLogs: async ({ startDate, endDate }: { startDate: string, endDate: string }) => {
    try {
      // Mock implementation
      await delay(800);
      
      // In a real app, we would filter by date range
      return mockImportLogs;
    } catch (error) {
      console.error('Error fetching import logs:', error);
      throw error;
    }
  },
  
  exportCsv: async ({ startDate, endDate }: { startDate: string, endDate: string }) => {
    try {
      // Mock implementation
      await delay(1000);
      
      // In a real app, this would generate a CSV file and trigger a download
      // For the prototype, we'll simulate a download
      const csvContent = 'id,timestamp,user_email,rows_ok,rows_err,file_name\n' +
        mockImportLogs.map(log => 
          `${log.id},${log.ts},${log.user_email},${log.rows_ok},${log.rows_err},${log.file_name}`
        ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'import_logs.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }
};

// Admin services
export const adminService = {
  // User management
  getUsers: async () => {
    try {
      // Mock implementation
      await delay(800);
      return mockUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  createUser: async ({ email, password, role }: { email: string, password: string, role: Role }) => {
    try {
      // Mock implementation
      await delay(1500);
      
      // Generate a random ID for the new user
      const newUser = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        role,
      };
      
      console.log('Creating user:', newUser);
      
      return {
        success: true,
        user: newUser
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Emission factors
  getEmissionFactors: async () => {
    try {
      // In a real app, this would query an emission factors table
      // For the prototype, we'll return mock data
      return [
        { id: '1', name: 'Electricity - France', value: 0.0571, unit: 'kg CO2/kWh' },
        { id: '2', name: 'Electricity - Belgium', value: 0.1762, unit: 'kg CO2/kWh' },
        { id: '3', name: 'Natural Gas', value: 0.2043, unit: 'kg CO2/kWh' },
        { id: '4', name: 'Diesel', value: 2.6391, unit: 'kg CO2/l' }
      ];
    } catch (error) {
      console.error('Error fetching emission factors:', error);
      throw error;
    }
  },
  
  updateEmissionFactor: async ({ id, value }: { id: string, value: number }) => {
    try {
      // In a real app, this would update the emission factor in the database
      // For the prototype, we'll simulate a successful update
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, id, value };
    } catch (error) {
      console.error('Error updating emission factor:', error);
      throw error;
    }
  }
};

// Mock data
const mockSites = [
  { id: 'site1', name: 'Paris HQ' },
  { id: 'site2', name: 'Lyon Factory' },
  { id: 'site3', name: 'Marseille Warehouse' }
];

const mockMeters = [
  { id: 'meter1', name: 'Main Power', site_id: 'site1', type: 'ELEC' },
  { id: 'meter2', name: 'Heating', site_id: 'site1', type: 'GAS' },
  { id: 'meter3', name: 'Water Supply', site_id: 'site1', type: 'WATER' },
  { id: 'meter4', name: 'Production Line', site_id: 'site2', type: 'ELEC' },
  { id: 'meter5', name: 'Heating System', site_id: 'site2', type: 'GAS' },
  { id: 'meter6', name: 'Cooling System', site_id: 'site2', type: 'WATER' },
  { id: 'meter7', name: 'Lighting', site_id: 'site3', type: 'ELEC' },
  { id: 'meter8', name: 'Heating', site_id: 'site3', type: 'GAS' },
  { id: 'meter9', name: 'Sanitation', site_id: 'site3', type: 'WATER' }
];

const mockPiTags = [
  { id: 'tag1', name: 'TEMP_101', description: 'Temperature Sensor 1', unit: '°C', status: null },
  { id: 'tag2', name: 'PRESS_201', description: 'Pressure Sensor 1', unit: 'bar', status: null },
  { id: 'tag3', name: 'FLOW_301', description: 'Flow Meter 1', unit: 'm³/h', status: null },
  { id: 'tag4', name: 'LEVEL_401', description: 'Level Sensor 1', unit: '%', status: null },
  { id: 'tag5', name: 'MOTOR_501', description: 'Motor Speed', unit: 'rpm', status: null },
  { id: 'tag6', name: 'VALVE_601', description: 'Valve Position', unit: '%', status: null }
];

const mockAnomalies = [
  { 
    id: 'anom1', 
    readingId: 'read1', 
    meterId: 'meter1', 
    meterName: 'Main Power',
    siteName: 'Paris HQ',
    date: '2023-05-10',
    value: 1420.5,
    type: 'SPIKE',
    delta: 45.2,
    site: 'site1',
    meter: 'meter1'
  },
  { 
    id: 'anom2', 
    readingId: 'read2', 
    meterId: 'meter4', 
    meterName: 'Production Line',
    siteName: 'Lyon Factory',
    date: '2023-05-11',
    value: null,
    type: 'MISSING',
    delta: null,
    site: 'site2',
    meter: 'meter4'
  },
  { 
    id: 'anom3', 
    readingId: 'read3', 
    meterId: 'meter2', 
    meterName: 'Heating',
    siteName: 'Paris HQ',
    date: '2023-05-09',
    value: 350.0,
    type: 'FLAT',
    delta: 0,
    site: 'site1',
    meter: 'meter2'
  },
  { 
    id: 'anom4', 
    readingId: 'read4', 
    meterId: 'meter7', 
    meterName: 'Lighting',
    siteName: 'Marseille Warehouse',
    date: '2023-05-12',
    value: 890.75,
    type: 'SPIKE',
    delta: 62.8,
    site: 'site3',
    meter: 'meter7'
  }
];

const mockImportLogs = [
  {
    id: 'log1',
    ts: '2023-05-15T09:30:00Z',
    user_email: 'operator@engie.com',
    rows_ok: 120,
    rows_err: 5,
    file_name: 'may_readings.csv'
  },
  {
    id: 'log2',
    ts: '2023-05-10T14:45:00Z',
    user_email: 'manager@engie.com',
    rows_ok: 95,
    rows_err: 0,
    file_name: 'april_summary.csv'
  },
  {
    id: 'log3',
    ts: '2023-05-05T11:20:00Z',
    user_email: 'operator@engie.com',
    rows_ok: 210,
    rows_err: 15,
    file_name: 'quarterly_data.csv'
  },
  {
    id: 'log4',
    ts: '2023-04-28T16:10:00Z',
    user_email: 'data_manager@engie.com',
    rows_ok: 45,
    rows_err: 2,
    file_name: 'special_meters.csv'
  }
];

const mockUsers = [
  {
    id: 'user1',
    email: 'operator@engie.com',
    role: 'Operator' as Role
  },
  {
    id: 'user2',
    email: 'data_manager@engie.com',
    role: 'DataManager' as Role
  },
  {
    id: 'user3',
    email: 'manager@engie.com',
    role: 'Manager' as Role
  },
  {
    id: 'user4',
    email: 'admin@engie.com',
    role: 'Admin' as Role
  }
];

// Helper for mock delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
