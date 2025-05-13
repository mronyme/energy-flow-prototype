
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Site, Meter, Reading, KpiDaily, ImportLog, Anomaly, PiTag } from "../types";

// Mock data for PI tags (since we don't have a real PI connection)
import piSampleData from "../data/sample_pi.csv";

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
  
  save: async (reading: Partial<Reading>): Promise<Reading | null> => {
    try {
      // Check if reading exists for this meter and date
      if (reading.id) {
        // Update existing reading
        const { data, error } = await supabase
          .from('reading')
          .update({
            value: reading.value
          })
          .eq('id', reading.id)
          .select();
        
        if (error) throw error;
        return data && data.length > 0 ? data[0] as Reading : null;
      } else {
        // Create new reading
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
      }
    } catch (error) {
      console.error('Error saving reading:', error);
      toast.error('Failed to save reading');
      return null;
    }
  },
  
  bulkImport: async (readings: Partial<Reading>[]): Promise<{rowsOk: number, rowsErr: number}> => {
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
      console.error('Error bulk importing readings:', error);
      return {
        rowsOk: 0,
        rowsErr: readings.length
      };
    }
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
      const { user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('import_log')
        .insert({
          user_email: importLog.user_email || user?.email || 'unknown',
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
  }
};

// Mock PI Service (since we can't connect to a real PI system)
export const piService = {
  getTags: async (): Promise<PiTag[]> => {
    // This is just returning the sample data
    // In a real app, this would connect to the PI API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(piSampleData as unknown as PiTag[]);
      }, 500);
    });
  },
  
  testTagConnection: async (tagId: string): Promise<boolean> => {
    // Simulate a tag connection test with a 80% success rate
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuccessful = Math.random() > 0.2;
        resolve(isSuccessful);
      }, 800);
    });
  }
};
