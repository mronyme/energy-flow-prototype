import { supabase } from '@/integrations/supabase/client';
import { Site, Meter, MeterType, Reading, KpiDaily, ImportLog, Anomaly, AnomalyType, User, Role } from '@/types';

const siteService = {
  async getSites(): Promise<Site[]> {
    try {
      let { data, error } = await supabase
        .from('site')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Site[];
    } catch (error) {
      console.error('Error getting sites:', error);
      return [];
    }
  },

  async getSite(id: string): Promise<Site | null> {
    try {
      let { data, error } = await supabase
        .from('site')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Site;
    } catch (error) {
      console.error('Error getting site:', error);
      return null;
    }
  },

  async createSite(site: Site): Promise<Site | null> {
    try {
      const { data, error } = await supabase
        .from('site')
        .insert([site])
        .select('*')
        .single();

      if (error) throw error;
      return data as Site;
    } catch (error) {
      console.error('Error creating site:', error);
      return null;
    }
  },

  async updateSite(site: Site): Promise<Site | null> {
    try {
      const { data, error } = await supabase
        .from('site')
        .update(site)
        .eq('id', site.id)
        .select('*')
        .single();

      if (error) throw error;
      return data as Site;
    } catch (error) {
      console.error('Error updating site:', error);
      return null;
    }
  },

  async deleteSite(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting site:', error);
      return false;
    }
  }
};

const readingService = {
  async getReadings(): Promise<Reading[]> {
    try {
      let { data, error } = await supabase
        .from('reading')
        .select('*')
        .order('ts', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Reading[];
    } catch (error) {
      console.error('Error getting readings:', error);
      return [];
    }
  },

  async getReading(id: string): Promise<Reading | null> {
    try {
      let { data, error } = await supabase
        .from('reading')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Reading;
    } catch (error) {
      console.error('Error getting reading:', error);
      return null;
    }
  },

  async createReading(reading: Reading): Promise<Reading | null> {
    try {
      const { data, error } = await supabase
        .from('reading')
        .insert([reading])
        .select('*')
        .single();

      if (error) throw error;
      return data as Reading;
    } catch (error) {
      console.error('Error creating reading:', error);
      return null;
    }
  },

  async updateReading(reading: Partial<Reading>): Promise<Reading> {
    try {
      const { data, error } = await supabase
        .from('reading')
        .update(reading as { id: string; meter_id: string; ts: string; value: number })
        .eq('id', reading.id)
        .select('*')
        .single();
        
      if (error) throw error;
      return data as Reading;
    } catch (error) {
      console.error('Error updating reading:', error);
      throw error;
    }
  },
  
  async bulkSaveReadings(readings: Reading[]): Promise<{ success: boolean; inserted?: number; errors?: number }> {
    try {
      // Ensure all readings have required fields
      const validReadings = readings.filter(r => r.meter_id && r.ts && typeof r.value === 'number');
      
      const { data, error } = await supabase
        .from('reading')
        .insert(validReadings as { meter_id: string; ts: string; value: number }[])
        .select();
        
      if (error) throw error;
      return { success: true, inserted: validReadings.length };
    } catch (error) {
      console.error('Error saving readings:', error);
      return { success: false, errors: readings.length };
    }
  },

  async deleteReading(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reading')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting reading:', error);
      return false;
    }
  }
};

const meterService = {
  async getMeters(): Promise<Meter[]> {
    try {
      let { data, error } = await supabase
        .from('meter')
        .select('*, site:site_id(name)')
        
      if (error) throw error;
      
      // Add proper type casting
      const meters = data.map(meter => ({
        id: meter.id,
        site_id: meter.site_id,
        type: meter.type as MeterType,
        site_name: meter.site?.name
      }));
      
      return meters;
    } catch (error) {
      console.error('Error getting meters:', error);
      return [];
    }
  },

  async getMetersBySite(siteId: string): Promise<Meter[]> {
    try {
      let { data, error } = await supabase
        .from('meter')
        .select('*')
        .eq('site_id', siteId);
        
      if (error) throw error;
      
      // Add proper type casting
      const meters = data.map(meter => ({
        id: meter.id,
        site_id: meter.site_id,
        type: meter.type as MeterType
      }));
      
      return meters;
    } catch (error) {
      console.error('Error getting meters:', error);
      return [];
    }
  },

  async getMeter(id: string): Promise<Meter | null> {
    try {
      let { data, error } = await supabase
        .from('meter')
        .select('*, site:site_id(*)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (!data) return null;
      
      // Add proper type casting
      const meter: Meter = {
        id: data.id,
        site_id: data.site_id,
        type: data.type as MeterType,
        site_name: data.site?.name,
        site_country: data.site?.country
      };
      
      return meter;
    } catch (error) {
      console.error('Error getting meter:', error);
      return null;
    }
  },

  async createMeter(meter: Meter): Promise<Meter | null> {
    try {
      const { data, error } = await supabase
        .from('meter')
        .insert([meter])
        .select('*')
        .single();

      if (error) throw error;
      return data as Meter;
    } catch (error) {
      console.error('Error creating meter:', error);
      return null;
    }
  },

  async updateMeter(meter: Meter): Promise<Meter | null> {
    try {
      const { data, error } = await supabase
        .from('meter')
        .update(meter)
        .eq('id', meter.id)
        .select('*')
        .single();

      if (error) throw error;
      return data as Meter;
    } catch (error) {
      console.error('Error updating meter:', error);
      return null;
    }
  },

  async deleteMeter(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('meter')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting meter:', error);
      return false;
    }
  }
};

const kpiService = {
  async getKpiDaily(): Promise<KpiDaily[]> {
    try {
      let { data, error } = await supabase
        .from('kpi_daily')
        .select('*')
        .order('day', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as KpiDaily[];
    } catch (error) {
      console.error('Error getting KPI daily data:', error);
      return [];
    }
  },

  async getKpiDailyBySite(siteId: string): Promise<KpiDaily[]> {
    try {
      let { data, error } = await supabase
        .from('kpi_daily')
        .select('*')
        .eq('site_id', siteId)
        .order('day', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as KpiDaily[];
    } catch (error) {
      console.error('Error getting KPI daily data by site:', error);
      return [];
    }
  },

  async getKpiDailyByDateRange(startDate: string, endDate: string): Promise<KpiDaily[]> {
     try {
      let { data, error } = await supabase
        .from('kpi_daily')
        .select('*')
        .gte('day', startDate)
        .lte('day', endDate)
        .order('day', { ascending: false });

      if (error) throw error;
      return data as KpiDaily[];
    } catch (error) {
      console.error('Error getting KPI daily data by date range:', error);
      return [];
    }
  },

  async getKpiDailyBySiteAndDateRange(siteId: string, startDate: string, endDate: string): Promise<KpiDaily[]> {
    try {
      let { data, error } = await supabase
        .from('kpi_daily')
        .select('*')
        .eq('site_id', siteId)
        .gte('day', startDate)
        .lte('day', endDate)
        .order('day', { ascending: false });

      if (error) throw error;
      return data as KpiDaily[];
    } catch (error) {
      console.error('Error getting KPI daily data by site and date range:', error);
      return [];
    }
  },

  async getKpiDailyById(id: string): Promise<KpiDaily | null> {
    try {
      let { data, error } = await supabase
        .from('kpi_daily')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as KpiDaily;
    } catch (error) {
      console.error('Error getting KPI daily data by id:', error);
      return null;
    }
  },

  async createKpiDaily(kpiDaily: KpiDaily): Promise<KpiDaily | null> {
    try {
      const { data, error } = await supabase
        .from('kpi_daily')
        .insert([kpiDaily])
        .select('*')
        .single();

      if (error) throw error;
      return data as KpiDaily;
    } catch (error) {
      console.error('Error creating KPI daily data:', error);
      return null;
    }
  },

  async updateKpiDaily(kpiDaily: KpiDaily): Promise<KpiDaily | null> {
    try {
      const { data, error } = await supabase
        .from('kpi_daily')
        .update(kpiDaily)
        .eq('id', kpiDaily.id)
        .select('*')
        .single();

      if (error) throw error;
      return data as KpiDaily;
    } catch (error) {
      console.error('Error updating KPI daily data:', error);
      return null;
    }
  },

  async deleteKpiDaily(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('kpi_daily')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting KPI daily data:', error);
      return false;
    }
  }
};

const importLogService = {
  async getImportLogs(): Promise<ImportLog[]> {
    try {
      let { data, error } = await supabase
        .from('import_log')
        .select('*')
        .order('ts', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ImportLog[];
    } catch (error) {
      console.error('Error getting import logs:', error);
      return [];
    }
  },

  async getImportLog(id: string): Promise<ImportLog | null> {
    try {
      let { data, error } = await supabase
        .from('import_log')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ImportLog;
    } catch (error) {
      console.error('Error getting import log:', error);
      return null;
    }
  },

  async createImportLog(importLog: ImportLog): Promise<ImportLog | null> {
    try {
      const { data, error } = await supabase
        .from('import_log')
        .insert([importLog])
        .select('*')
        .single();

      if (error) throw error;
      return data as ImportLog;
    } catch (error) {
      console.error('Error creating import log:', error);
      return null;
    }
  },

  async updateImportLog(importLog: ImportLog): Promise<ImportLog | null> {
    try {
      const { data, error } = await supabase
        .from('import_log')
        .update(importLog)
        .eq('id', importLog.id)
        .select('*')
        .single();

      if (error) throw error;
      return data as ImportLog;
    } catch (error) {
      console.error('Error updating import log:', error);
      return null;
    }
  },

  async deleteImportLog(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('import_log')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting import log:', error);
      return false;
    }
  }
};

const anomalyService = {
  async getAnomalies(): Promise<Anomaly[]> {
    try {
      let { data, error } = await supabase
        .from('anomaly')
        .select('*')
        .order('id', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      
      // Add proper type casting
      const anomalies: Anomaly[] = data.map(a => ({
        id: a.id,
        reading_id: a.reading_id,
        type: a.type as AnomalyType,
        delta: a.delta,
        comment: a.comment
      }));
      
      return anomalies;
    } catch (error) {
      console.error('Error loading anomalies:', error);
      return [];
    }
  },

  async getAnomalyWithReading(id: string): Promise<Anomaly | null> {
    try {
      let { data, error } = await supabase
        .from('anomaly')
        .select('*, reading:reading_id(*)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (!data) return null;
      
      // Add proper type casting
      const anomaly: Anomaly = {
        id: data.id,
        reading_id: data.reading_id,
        type: data.type as AnomalyType,
        delta: data.delta,
        comment: data.comment,
        reading: data.reading
      };
      
      return anomaly;
    } catch (error) {
      console.error('Error loading anomaly:', error);
      return null;
    }
  },

  async createAnomaly(anomaly: Omit<Anomaly, 'id'>): Promise<Anomaly | null> {
    try {
      const { data, error } = await supabase
        .from('anomaly')
        .insert([anomaly])
        .select('*')
        .single();

      if (error) throw error;
      return data as Anomaly;
    } catch (error) {
      console.error('Error creating anomaly:', error);
      return null;
    }
  },

  async updateAnomaly(anomaly: Anomaly): Promise<Anomaly | null> {
    try {
      const { data, error } = await supabase
        .from('anomaly')
        .update(anomaly)
        .eq('id', anomaly.id)
        .select('*')
        .single();

      if (error) throw error;
      return data as Anomaly;
    } catch (error) {
      console.error('Error updating anomaly:', error);
      return null;
    }
  },

  async deleteAnomaly(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('anomaly')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting anomaly:', error);
      return false;
    }
  }
};

const adminService = {
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      // Cast the result to User[] to ensure type safety
      return data as unknown as User[];
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  },
  
  async createUser(user: { email: string; password: string; role: Role }): Promise<User | null> {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
      });
      
      if (authError) {
        console.error('Error creating user in Supabase Auth:', authError);
        throw authError;
      }
      
      if (!authData.user?.id) {
        throw new Error('User ID not found after signup');
      }
      
      // Create user in profiles table
      const { data: dbData, error: dbError } = await supabase
        .from('profiles')
        .insert([{ id: authData.user.id, email: user.email, role: user.role }])
        .select('*')
        .single();
      
      if (dbError) {
        console.error('Error creating user in database:', dbError);
        throw dbError;
      }
      
      return dbData as User;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  },
  
  async deleteUser(id: string): Promise<boolean> {
    try {
      // Delete user from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      
      if (authError) {
        console.error('Error deleting user from Supabase Auth:', authError);
        throw authError;
      }
      
      // Delete user from profiles table
      const { error: dbError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (dbError) {
        console.error('Error deleting user from database:', dbError);
        throw dbError;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    }
  },
  
  // Mock methods for emission factors
  async getFactors(): Promise<any[]> {
    // This is a mock implementation that returns dummy data
    console.log('Using mock getFactors method');
    return [
      { id: '1', factor: 'Electricity', value: 0.5, unit: 'kgCO2/kWh' },
      { id: '2', factor: 'Natural Gas', value: 0.2, unit: 'kgCO2/kWh' },
      { id: '3', factor: 'Diesel', value: 0.27, unit: 'kgCO2/kWh' }
    ];
  },
  
  async updateFactor(id: string, field: string, value: any): Promise<void> {
    // This is a mock implementation that logs the update
    console.log(`Mock updateFactor: Updating factor ${id}, field ${field} to ${value}`);
    // In a real implementation, this would update the database
  }
};

const piService = {
  async testTag(tagName: string): Promise<{ success: boolean; value?: number; timestamp?: string }> {
    // Placeholder implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    const success = Math.random() < 0.8;
    const value = success ? Math.random() * 100 : undefined;
    const timestamp = success ? new Date().toISOString() : undefined;
    
    return { success, value, timestamp };
  },
};

// Add the missing journalService
const journalService = {
  async getLogs(): Promise<ImportLog[]> {
    return importLogService.getImportLogs();
  }
};

export { 
  siteService, 
  meterService, 
  readingService, 
  kpiService, 
  importLogService, 
  anomalyService, 
  adminService, 
  piService,
  journalService // Add the journalService to exports
};
