
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
  getBySiteId: async (siteId: string): Promise<Meter[]> => {
    try {
      const { data, error } = await supabase
        .from('meter')
        .select('*')
        .eq('site_id', siteId);
      
      if (error) throw error;
      return data as Meter[];
    } catch (error) {
      console.error('Error fetching meters:', error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<Meter | null> => {
    try {
      const { data, error } = await supabase
        .from('meter')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Meter;
    } catch (error) {
      console.error('Error fetching meter by ID:', error);
      return null;
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
