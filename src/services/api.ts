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
      const { data, error } = await supabase
        .from('meter')
        .select('id, site_id, type')
        .eq('site_id', siteId);
        
      if (error) throw error;
      
      // Transform data to include a name field
      return (data || []).map(meter => ({
        ...meter,
        name: `${meter.type}-${meter.id.substring(0, 8)}`
      }));
    } catch (error) {
      console.error('Error fetching meters:', error);
      throw error;
    }
  },
  
  saveReading: async ({ meter_id, value, ts }: { meter_id: string, value: number, ts: string }) => {
    try {
      // Check if reading already exists
      const { data: existingReadings, error: fetchError } = await supabase
        .from('reading')
        .select('id')
        .eq('meter_id', meter_id)
        .eq('ts', ts)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      if (existingReadings) {
        // Update existing reading
        const { error } = await supabase
          .from('reading')
          .update({ value })
          .eq('id', existingReadings.id);
          
        if (error) throw error;
        return { id: existingReadings.id, updated: true };
      } else {
        // Insert new reading
        const { data, error } = await supabase
          .from('reading')
          .insert({ meter_id, value, ts })
          .select('id')
          .single();
          
        if (error) throw error;
        return { id: data.id, updated: false };
      }
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
      const { data, error } = await supabase
        .from('anomaly')
        .select('*');
      
      if (error) throw error;
      return data as Anomaly[];
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      return [];
    }
  },
  
  getByReadingId: async (readingId: string): Promise<Anomaly | null> => {
    try {
      const { data, error } = await supabase
        .from('anomaly')
        .select('*')
        .eq('reading_id', readingId)
        .single();
      
      if (error) throw error;
      return data as Anomaly;
    } catch (error) {
      console.error('Error fetching anomaly by reading ID:', error);
      return null;
    }
  },
  
  update: async (anomaly: Partial<Anomaly>): Promise<Anomaly | null> => {
    try {
      const { data, error } = await supabase
        .from('anomaly')
        .update({ 
          comment: anomaly.comment,
          delta: anomaly.delta
        })
        .eq('id', anomaly.id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] as Anomaly : null;
    } catch (error) {
      console.error('Error updating anomaly:', error);
      return null;
    }
  },
  
  updateComment: async (id: string, comment: string): Promise<Anomaly | null> => {
    try {
      const { data, error } = await supabase
        .from('anomaly')
        .update({ comment })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] as Anomaly : null;
    } catch (error) {
      console.error('Error updating anomaly comment:', error);
      return null;
    }
  },
  
  getAnomalyDetails: async (): Promise<any[]> => {
    try {
      // This is a more complex query that joins anomaly with reading, meter, and site
      const { data, error } = await supabase
        .from('anomaly')
        .select(`
          id,
          reading_id,
          type,
          delta,
          comment,
          reading:reading_id (
            id,
            meter_id,
            ts,
            value
          ),
          meter:reading(meter:meter_id (
            id,
            type,
            site:site_id (
              id,
              name
            )
          ))
        `);
      
      if (error) throw error;
      
      // Transform data to match expected format
      const transformedData = data.map(anomaly => {
        const reading = anomaly.reading;
        const meter = anomaly.meter?.meter;
        const site = meter?.site;
        
        return {
          id: anomaly.id,
          readingId: reading?.id || '',
          meterId: meter?.id || '',
          siteId: site?.id || '',
          siteName: site?.name || '',
          meterType: meter?.type || '',
          timestamp: reading?.ts || '',
          value: reading?.value || 0,
          type: anomaly.type || '',
          delta: anomaly.delta,
          comment: anomaly.comment
        };
      });
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching anomaly details:', error);
      return [];
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
  getTags: async (): Promise<PiTag[]> => {
    // Return mock data since we can't connect to a real PI system
    // This simulates loading from a CSV file
    return [
      { id: '1', name: 'PI:TAG001', description: 'Power Meter', unit: 'kW', status: 'active' },
      { id: '2', name: 'PI:TAG002', description: 'Gas Flow Rate', unit: 'm³/h', status: 'active' },
      { id: '3', name: 'PI:TAG003', description: 'Water Flow Rate', unit: 'm³/h', status: 'active' },
      // More tags would be loaded from the actual CSV in a real app
    ] as PiTag[];
  },
  
  testTag: async (tagName: string): Promise<boolean> => {
    // Simulate a tag connection test with a 80% success rate
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuccessful = Math.random() > 0.2;
        resolve(isSuccessful);
      }, 800);
    });
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
      const { data, error } = await supabase
        .from('import_log')
        .select('*')
        .gte('ts', `${startDate}T00:00:00Z`)
        .lte('ts', `${endDate}T23:59:59Z`)
        .order('ts', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching import logs:', error);
      throw error;
    }
  },
  
  exportCsv: async ({ startDate, endDate }: { startDate: string, endDate: string }) => {
    try {
      // In a real app, this would generate and download a CSV file
      // For the prototype, we'll simulate a file download
      
      // Get the log data
      const { data, error } = await supabase
        .from('import_log')
        .select('*')
        .gte('ts', `${startDate}T00:00:00Z`)
        .lte('ts', `${endDate}T23:59:59Z`)
        .order('ts', { ascending: false });
        
      if (error) throw error;
      
      // Convert data to CSV format
      const headers = ['ID', 'Timestamp', 'User', 'Rows OK', 'Rows Error', 'File Name'];
      const rows = (data || []).map(log => [
        log.id,
        new Date(log.ts).toLocaleString(),
        log.user_email,
        log.rows_ok,
        log.rows_err,
        log.file_name
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create a Blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `import-logs-${startDate}-to-${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
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
      // In a real app, this would query the users table
      // For the prototype, we'll return mock data
      return [
        { id: '1', email: 'admin@engie.com', role: 'Admin' },
        { id: '2', email: 'manager@engie.com', role: 'Manager' },
        { id: '3', email: 'datamanager@engie.com', role: 'DataManager' },
        { id: '4', email: 'operator@engie.com', role: 'Operator' }
      ];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  createUser: async ({ email, password, role }: { email: string, password: string, role: string }) => {
    try {
      // In a real app, this would create a new user with Supabase Auth
      // For the prototype, we'll simulate a successful user creation
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { 
        success: true, 
        user: { 
          id: `new-${Date.now()}`, 
          email, 
          role 
        } 
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
