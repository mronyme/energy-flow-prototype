
import seedData from '../data/seed.json';
import { Anomaly, ImportLog, KpiDaily, Meter, Reading, Site } from '../types';
import { dateUtils } from '../utils/validation';

// Parse and type our seed data
const sites = seedData.sites as Site[];
const meters = seedData.meters as Meter[];
const readings = seedData.readings as Reading[];
const kpiDaily = seedData.kpi_daily as KpiDaily[];
const anomalies = seedData.anomalies as Anomaly[];
const importLogs = seedData.import_logs as ImportLog[];

// Store for local state since we're not connected to a real backend
let localReadings = [...readings];
let localAnomalies = [...anomalies];
let localImportLogs = [...importLogs];

export const siteService = {
  getAll: async (): Promise<Site[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return sites;
  },
  
  getById: async (id: string): Promise<Site | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return sites.find(site => site.id === id);
  }
};

export const meterService = {
  getAll: async (): Promise<Meter[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return meters;
  },
  
  getBySiteId: async (siteId: string): Promise<Meter[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return meters.filter(meter => meter.site_id === siteId);
  },
  
  getById: async (id: string): Promise<Meter | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return meters.find(meter => meter.id === id);
  }
};

export const readingService = {
  getAll: async (): Promise<Reading[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return localReadings;
  },
  
  getByMeterId: async (meterId: string): Promise<Reading[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return localReadings.filter(reading => reading.meter_id === meterId);
  },
  
  getById: async (id: string): Promise<Reading | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return localReadings.find(reading => reading.id === id);
  },
  
  create: async (reading: Omit<Reading, 'id'>): Promise<Reading> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate a UUID
    const newId = crypto.randomUUID();
    
    const newReading: Reading = {
      id: newId,
      ...reading
    };
    
    localReadings.push(newReading);
    return newReading;
  },
  
  update: async (reading: Reading): Promise<Reading> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = localReadings.findIndex(r => r.id === reading.id);
    if (index === -1) {
      throw new Error('Reading not found');
    }
    
    localReadings[index] = reading;
    return reading;
  },
  
  // For CSV import
  bulkCreate: async (newReadings: Omit<Reading, 'id'>[]): Promise<{ rowsOk: number; rowsErr: number; }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const successfulReadings: Reading[] = [];
    let errors = 0;
    
    for (const reading of newReadings) {
      // Some simple validation
      if (reading.value < 0) {
        errors++;
        continue;
      }
      
      // Generate a UUID
      const newId = crypto.randomUUID();
      
      successfulReadings.push({
        id: newId,
        ...reading
      });
    }
    
    // Add successful readings to our local store
    localReadings = [...localReadings, ...successfulReadings];
    
    return {
      rowsOk: successfulReadings.length,
      rowsErr: errors
    };
  }
};

export const kpiService = {
  getAll: async (): Promise<KpiDaily[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return kpiDaily;
  },
  
  getBySiteId: async (siteId: string): Promise<KpiDaily[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return kpiDaily.filter(kpi => kpi.site_id === siteId);
  },
  
  // Get data for a date range
  getByDateRange: async (startDate: string, endDate: string): Promise<KpiDaily[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return kpiDaily.filter(kpi => {
      const kpiDate = new Date(kpi.day);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return kpiDate >= start && kpiDate <= end;
    });
  }
};

export const anomalyService = {
  getAll: async (): Promise<Anomaly[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return localAnomalies;
  },
  
  getByReadingId: async (readingId: string): Promise<Anomaly | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return localAnomalies.find(anomaly => anomaly.reading_id === readingId);
  },
  
  // Get full anomaly details including the reading and meter information
  getAnomalyDetails: async (): Promise<{
    id: string;
    readingId: string;
    meterId: string;
    siteId: string;
    siteName: string;
    meterType: string;
    timestamp: string;
    value: number;
    type: string;
    delta: number | null;
    comment: string | null;
  }[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const details = [];
    
    for (const anomaly of localAnomalies) {
      const reading = localReadings.find(r => r.id === anomaly.reading_id);
      if (reading) {
        const meter = meters.find(m => m.id === reading.meter_id);
        if (meter) {
          const site = sites.find(s => s.id === meter.site_id);
          if (site) {
            details.push({
              id: anomaly.id,
              readingId: anomaly.reading_id,
              meterId: meter.id,
              siteId: site.id,
              siteName: site.name,
              meterType: meter.type,
              timestamp: reading.ts,
              value: reading.value,
              type: anomaly.type,
              delta: anomaly.delta,
              comment: anomaly.comment
            });
          }
        }
      }
    }
    
    return details;
  },
  
  update: async (anomaly: Anomaly): Promise<Anomaly> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = localAnomalies.findIndex(a => a.id === anomaly.id);
    if (index === -1) {
      throw new Error('Anomaly not found');
    }
    
    localAnomalies[index] = anomaly;
    return anomaly;
  }
};

export const importLogService = {
  getAll: async (): Promise<ImportLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return localImportLogs;
  },
  
  create: async (log: Omit<ImportLog, 'id' | 'ts'>): Promise<ImportLog> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate a UUID
    const newId = crypto.randomUUID();
    
    const newLog: ImportLog = {
      id: newId,
      ts: new Date().toISOString(),
      ...log
    };
    
    localImportLogs.push(newLog);
    return newLog;
  },
  
  getByDateRange: async (startDate: string, endDate: string): Promise<ImportLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return localImportLogs.filter(log => {
      const logDate = new Date(log.ts);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return logDate >= start && logDate <= end;
    });
  }
};

// Mock PI tag service
export const piTagService = {
  testTag: async (tagName: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Simulate some tags failing (10% chance)
    return Math.random() < 0.9;
  }
};

// Mock user service
export const userService = {
  createUser: async (email: string, role: string): Promise<{ id: string; email: string; role: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate a UUID
    const newId = crypto.randomUUID();
    
    return {
      id: newId,
      email,
      role
    };
  }
};

// Mock emission factors service
export const factorService = {
  getEmissionFactors: async (): Promise<{ id: string; name: string; value: number; unit: string }[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { id: '1', name: 'Electricity - France', value: 0.0571, unit: 'kgCO2e/kWh' },
      { id: '2', name: 'Natural Gas', value: 0.2428, unit: 'kgCO2e/kWh' },
      { id: '3', name: 'Heating Oil', value: 0.3248, unit: 'kgCO2e/kWh' },
      { id: '4', name: 'District Heating', value: 0.1294, unit: 'kgCO2e/kWh' },
      { id: '5', name: 'Coal', value: 0.396, unit: 'kgCO2e/kWh' }
    ];
  },
  
  updateFactor: async (id: string, value: number): Promise<{ id: string; value: number }> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      id,
      value
    };
  }
};
