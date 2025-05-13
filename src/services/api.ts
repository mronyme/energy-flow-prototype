
import { Site, Anomaly, Role, Meter, Reading, ImportLog, KpiDaily, MeterType, AnomalyType } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Reading service
export const readingService = {
  // Get readings for a specific meter
  getMeterReadings: async (meterId: string): Promise<Reading[]> => {
    try {
      const { data, error } = await supabase
        .from('reading')
        .select('*')
        .eq('meter_id', meterId)
        .order('ts', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching meter readings:', error);
      return [];
    }
  },
  
  // Get readings for a specific date range
  getReadingsByDateRange: async (startDate: string, endDate: string): Promise<Reading[]> => {
    try {
      const { data, error } = await supabase
        .from('reading')
        .select('*')
        .gte('ts', startDate)
        .lte('ts', endDate)
        .order('ts', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching readings by date range:', error);
      return [];
    }
  },
  
  // Save a new reading
  saveReading: async (reading: Partial<Reading>): Promise<Reading | null> => {
    try {
      // Ensure required fields are present when inserting
      if (!reading.id && (!reading.meter_id || !reading.ts)) {
        throw new Error("Meter ID and timestamp are required when creating a new reading");
      }
      
      // Check if reading already exists for this meter and timestamp
      if (reading.meter_id && reading.ts) {
        const { data: existingData, error: existingError } = await supabase
          .from('reading')
          .select('id')
          .eq('meter_id', reading.meter_id)
          .eq('ts', reading.ts)
          .single();
          
        if (existingError && existingError.code !== 'PGRST116') {
          throw existingError;
        }
        
        let result;
        
        if (existingData) {
          // Update existing reading
          const { data, error } = await supabase
            .from('reading')
            .update({ value: reading.value })
            .eq('id', existingData.id)
            .select()
            .single();
            
          if (error) throw error;
          result = data;
        } else if (reading.value !== undefined) {
          // Insert new reading (only if we have all required fields)
          const { data, error } = await supabase
            .from('reading')
            .insert({
              meter_id: reading.meter_id,
              ts: reading.ts,
              value: reading.value
            })
            .select()
            .single();
            
          if (error) throw error;
          result = data;
        }
        
        return result || null;
      } else if (reading.id && reading.value !== undefined) {
        // Update by ID
        const { data, error } = await supabase
          .from('reading')
          .update({ value: reading.value })
          .eq('id', reading.id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error saving reading:', error);
      return null;
    }
  },
  
  // Bulk save readings
  bulkSaveReadings: async (readings: { meter_id: string; ts: string; value: number }[]): Promise<{ success: boolean; inserted: number; errors: number }> => {
    try {
      const { data, error } = await supabase
        .from('reading')
        .insert(readings);
        
      if (error) throw error;
      
      return { 
        success: true, 
        inserted: readings.length, 
        errors: 0 
      };
    } catch (error) {
      console.error('Error bulk saving readings:', error);
      return { 
        success: false, 
        inserted: 0, 
        errors: readings.length 
      };
    }
  }
};

// Meter service
export const meterService = {
  // Get all meters
  getMeters: async (): Promise<Meter[]> => {
    try {
      const { data, error } = await supabase
        .from('meter')
        .select('*, site:site_id(name)');
        
      if (error) throw error;
      
      // Transform the data to match the Meter interface
      return (data || []).map(meter => ({
        id: meter.id,
        type: meter.type as MeterType,
        site_id: meter.site_id,
        site_name: meter.site?.name || 'Unknown'
      }));
    } catch (error) {
      console.error('Error fetching meters:', error);
      return [];
    }
  },
  
  // Get meters for a specific site
  getSiteMeters: async (siteId: string): Promise<Meter[]> => {
    try {
      const { data, error } = await supabase
        .from('meter')
        .select('*')
        .eq('site_id', siteId);
        
      if (error) throw error;
      
      // Transform the data to match the Meter interface
      return (data || []).map(meter => ({
        id: meter.id,
        type: meter.type as MeterType,
        site_id: meter.site_id,
        site_name: 'Unknown' // We don't have site name in this query
      }));
    } catch (error) {
      console.error('Error fetching site meters:', error);
      return [];
    }
  },
  
  // Get meter by ID
  getMeterById: async (meterId: string): Promise<Meter | null> => {
    try {
      const { data, error } = await supabase
        .from('meter')
        .select('*, site:site_id(name, country)')
        .eq('id', meterId)
        .single();
        
      if (error) throw error;
      
      // Transform the data to match the Meter interface
      return data ? {
        id: data.id,
        type: data.type as MeterType,
        site_id: data.site_id,
        site_name: data.site?.name || 'Unknown',
        site_country: data.site?.country
      } : null;
    } catch (error) {
      console.error('Error fetching meter by ID:', error);
      return null;
    }
  }
};

// Site service
export const siteService = {
  // Get all sites
  getSites: async (): Promise<Site[]> => {
    try {
      const { data, error } = await supabase
        .from('site')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sites:', error);
      return [];
    }
  },
  
  // Get site by ID
  getSiteById: async (siteId: string): Promise<Site | null> => {
    try {
      const { data, error } = await supabase
        .from('site')
        .select('*')
        .eq('id', siteId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching site by ID:', error);
      return null;
    }
  }
};

// KPI service
export const kpiService = {
  // Get KPI data for all sites
  getAllSitesKpi: async (startDate: string, endDate: string): Promise<KpiDaily[]> => {
    try {
      const { data, error } = await supabase
        .from('kpi_daily')
        .select('*, site:site_id(name)')
        .gte('day', startDate)
        .lte('day', endDate)
        .order('day', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching KPI data for all sites:', error);
      return [];
    }
  },
  
  // Get KPI data for a specific site
  getSiteKpi: async (siteId: string, startDate: string, endDate: string): Promise<KpiDaily[]> => {
    try {
      const { data, error } = await supabase
        .from('kpi_daily')
        .select('*')
        .eq('site_id', siteId)
        .gte('day', startDate)
        .lte('day', endDate)
        .order('day', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching KPI data for site:', error);
      return [];
    }
  }
};

// Import log service
export const importLogService = {
  // Get all import logs
  getImportLogs: async (limit = 100): Promise<ImportLog[]> => {
    try {
      const { data, error } = await supabase
        .from('import_log')
        .select('*')
        .order('ts', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching import logs:', error);
      return [];
    }
  },
  
  // Get import logs for a date range
  getImportLogsByDateRange: async (startDate: string, endDate: string): Promise<ImportLog[]> => {
    try {
      const { data, error } = await supabase
        .from('import_log')
        .select('*')
        .gte('ts', startDate)
        .lte('ts', endDate)
        .order('ts', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching import logs by date range:', error);
      return [];
    }
  },
  
  // Create a new import log
  createImportLog: async (log: Omit<ImportLog, 'id' | 'ts'>): Promise<ImportLog | null> => {
    try {
      const { data, error } = await supabase
        .from('import_log')
        .insert(log)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating import log:', error);
      return null;
    }
  }
};

// Anomaly service
export const anomalyService = {
  // Get all anomalies
  getAnomalies: async (limit = 100): Promise<Anomaly[]> => {
    try {
      const { data, error } = await supabase
        .from('anomaly')
        .select(`
          *,
          reading:reading_id (
            id,
            ts,
            value,
            meter:meter_id (
              id,
              type,
              site:site_id (
                id,
                name
              )
            )
          )
        `)
        .order('reading(ts)', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        reading_id: item.reading_id,
        type: item.type as AnomalyType,
        delta: item.delta,
        comment: item.comment
      }));
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      return [];
    }
  },
  
  // Get anomalies by type
  getAnomaliesByType: async (type: AnomalyType): Promise<Anomaly[]> => {
    try {
      const { data, error } = await supabase
        .from('anomaly')
        .select(`
          *,
          reading:reading_id (
            id,
            ts,
            value,
            meter:meter_id (
              id,
              type,
              site:site_id (
                id,
                name
              )
            )
          )
        `)
        .eq('type', type)
        .order('reading(ts)', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        reading_id: item.reading_id,
        type: item.type as AnomalyType,
        delta: item.delta,
        comment: item.comment
      }));
    } catch (error) {
      console.error('Error fetching anomalies by type:', error);
      return [];
    }
  },
  
  // Create a new anomaly
  createAnomaly: async (anomaly: Partial<Anomaly>): Promise<Anomaly | null> => {
    try {
      const { data, error } = await supabase
        .from('anomaly')
        .insert(anomaly)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating anomaly:', error);
      return null;
    }
  },
  
  // Update an anomaly
  updateAnomaly: async (id: string, updates: Partial<Anomaly>): Promise<Anomaly | null> => {
    try {
      const { data, error } = await supabase
        .from('anomaly')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating anomaly:', error);
      return null;
    }
  }
};

// Journal service (combines import logs and provides export functionality)
export const journalService = {
  // Get journal entries (import logs with more details)
  getJournalEntries: async (limit = 100): Promise<ImportLog[]> => {
    return importLogService.getImportLogs(limit);
  },
  
  // Get journal entries for a date range
  getJournalEntriesByDateRange: async (startDate: string, endDate: string): Promise<ImportLog[]> => {
    return importLogService.getImportLogsByDateRange(startDate, endDate);
  }
};

// Admin service
export const adminService = {
  // Get all users
  getUsers: async (): Promise<{ id: string; email: string; role: Role }[]> => {
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        throw error;
      }
      
      // Get roles from profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, role');
      
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile.role);
        });
      }
      
      return users.map(user => ({
        id: user.id,
        email: user.email || '',
        role: (profileMap.get(user.id) || 'Operator') as Role
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Return mock data for development purposes
      return [
        { id: 'user1', email: 'admin@engie.com', role: 'Admin' as Role },
        { id: 'user2', email: 'operator@engie.com', role: 'Operator' as Role },
        { id: 'user3', email: 'manager@engie.com', role: 'Manager' as Role },
        { id: 'user4', email: 'datamanager@engie.com', role: 'DataManager' as Role }
      ];
    }
  },
  
  // Create a new user
  createUser: async ({ email, password, role }: { email: string; password: string; role: Role }): Promise<{ id: string; email: string; role: Role } | null> => {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Update the user's role in the profiles table
        await supabase
          .from('profiles')
          .update({ role })
          .eq('id', data.user.id);
        
        return {
          id: data.user.id,
          email: data.user.email || '',
          role
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },
  
  // Update emission factors (mock implementation)
  updateFactor: async (id: string, value: number): Promise<{ success: boolean }> => {
    // In a real implementation, this would update a factors table
    console.log(`Updating factor ${id} to ${value}`);
    return { success: true };
  },
  
  // Get emission factors (mock implementation)
  getFactors: async (): Promise<{ id: string; name: string; value: number; unit: string; updatedAt: string }[]> => {
    // Mock data for emission factors
    return [
      { id: 'factor1', name: 'CO2 - Electricity', value: 0.085, unit: 'kg/kWh', updatedAt: '2025-05-01' },
      { id: 'factor2', name: 'CO2 - Natural Gas', value: 0.204, unit: 'kg/kWh', updatedAt: '2025-04-15' },
      { id: 'factor3', name: 'CO2 - District Heating', value: 0.147, unit: 'kg/kWh', updatedAt: '2025-03-22' }
    ];
  }
};

// PI service (mock implementation)
export const piService = {
  // Test a PI tag
  testTag: async (tag: string): Promise<{ success: boolean; value: number | null; timestamp: string | null }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock response - in a real implementation, this would query the PI system
    const success = Math.random() > 0.2; // 80% success rate
    
    if (success) {
      return {
        success: true,
        value: Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        value: null,
        timestamp: null
      };
    }
  },
  
  // Get PI tag history
  getTagHistory: async (tag: string, startDate: string, endDate: string): Promise<{ value: number; timestamp: string }[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Mock response - in a real implementation, this would query the PI system
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const baseValue = Math.floor(Math.random() * 800) + 200;
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      return {
        value: baseValue + Math.floor(Math.random() * 40) - 20,
        timestamp: date.toISOString()
      };
    });
  }
};
