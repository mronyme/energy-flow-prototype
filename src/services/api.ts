
import { Site, Anomaly } from '@/types';

// Mock API endpoint URLs
const API_BASE_URL = 'https://your-api.com'; // Replace with your actual API base URL
const SITES_ENDPOINT = `${API_BASE_URL}/sites`;
const ANOMALIES_ENDPOINT = `${API_BASE_URL}/anomalies`;
const CORRECT_ANOMALY_ENDPOINT = `${API_BASE_URL}/anomalies/correct`;

// ========== Site Service ==========
const getSites = async (): Promise<Site[]> => {
  // In a real application, this would call an API endpoint
  // For now, let's return some mock data
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  const mockSites = [
    { id: 'site1', name: 'Paris HQ', country: 'France' },
    { id: 'site2', name: 'Lyon Factory', country: 'France' },
    { id: 'site3', name: 'Marseille Port', country: 'France' }
  ];
  
  return mockSites;
};

// Export site service
export const siteService = {
  getAll: getSites,
  getSites,
};

// ========== Anomaly Service ==========
// Mock anomaly data
const mockAnomalies = [
  { 
    id: 'anom1', 
    readingId: 'read1',
    reading_id: 'read1', 
    meterId: 'meter1',
    meterName: 'Main Electric Meter', 
    siteName: 'Paris HQ', 
    date: '2023-04-15', 
    value: 345.5, 
    type: 'SPIKE',
    delta: 45.2,
    site: 'site1',
    meter: 'meter1',
    comment: '',
    meterType: 'ELEC'
  },
  { 
    id: 'anom2', 
    readingId: 'read2',
    reading_id: 'read2', 
    meterId: 'meter2',
    meterName: 'Emergency Generator', 
    siteName: 'Lyon Factory', 
    date: '2023-04-14', 
    value: null, 
    type: 'MISSING',
    delta: null,
    site: 'site2',
    meter: 'meter4',
    comment: '',
    meterType: 'ELEC'
  },
  { 
    id: 'anom3', 
    readingId: 'read3',
    reading_id: 'read3', 
    meterId: 'meter3',
    meterName: 'Boiler Room', 
    siteName: 'Paris HQ', 
    date: '2023-04-13', 
    value: 28.5, 
    type: 'FLAT',
    delta: 0,
    site: 'site1',
    meter: 'meter2',
    comment: '',
    meterType: 'GAS'
  },
  { 
    id: 'anom4', 
    readingId: 'read4',
    reading_id: 'read4', 
    meterId: 'meter4',
    meterName: 'Building A', 
    siteName: 'Marseille Port', 
    date: '2023-04-12', 
    value: 502.8, 
    type: 'SPIKE',
    delta: 62.8,
    site: 'site3',
    meter: 'meter7',
    comment: '',
    meterType: 'ELEC'
  }
];

// Mock function to simulate fetching anomalies
interface AnomalyFilterParams {
  siteId: string;
  startDate: string;
  endDate: string;
}

const getAnomalies = async (params: AnomalyFilterParams): Promise<any[]> => {
  // In a real application, this would call an API endpoint with filter parameters
  // For now, let's return some mock data
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  // Apply filters to mock data
  let filteredAnomalies = mockAnomalies;
  
  if (params.siteId !== 'all') {
    filteredAnomalies = filteredAnomalies.filter(anomaly => anomaly.site === params.siteId);
  }
  
  filteredAnomalies = filteredAnomalies.filter(anomaly => anomaly.date >= params.startDate && anomaly.date <= params.endDate);
  
  return filteredAnomalies;
};

// Mock function to simulate correcting an anomaly
interface CorrectAnomalyParams {
  readingId: string;
  value: number;
  comment: string;
}

const correctAnomaly = async (params: CorrectAnomalyParams): Promise<boolean> => {
  console.log(`Correcting anomaly ${params.readingId} with value ${params.value} and comment ${params.comment}`);
  
  // In a real app, this would call an API endpoint
  // Mock success for now
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};

// Add updateComment method
const updateComment = async (anomalyId: string, comment: string) => {
  console.log(`Updating anomaly ${anomalyId} comment to: ${comment}`);
  
  // In a real app, this would call an API endpoint
  // Mock success for now
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};

// Export anomaly service
export const anomalyService = {
  getAnomalies,
  getSites,
  correctAnomaly,
  updateComment // Add the new method
};

// ========== Reading Service ==========
// Mock readings data
const mockReadings = [
  { id: 'read1', name: 'Main Electric Meter', value: 1245.8, unit: 'kWh' },
  { id: 'read2', name: 'Solar Panel Output', value: 578.2, unit: 'kWh' },
  { id: 'read3', name: 'Gas Boiler', value: 102.5, unit: 'm³' }
];

const getReadings = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockReadings;
};

const getReadingByMeterAndDate = async (meterId: string, date: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // Mock finding an existing reading about 30% of the time
  if (Math.random() < 0.3) {
    return {
      id: `reading-${Date.now()}`,
      meter_id: meterId,
      ts: date,
      value: Math.floor(Math.random() * 1000)
    };
  }
  return null;
};

const saveReading = async (data: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Saving reading:", data);
  return { success: true, id: data.id || `reading-${Date.now()}` };
};

const updateReading = async (data: { id: string, value: number }) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  console.log("Updating reading:", data);
  return { success: true };
};

const bulkImportReadings = async (readings: any[]) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const rowsOk = readings.length - Math.floor(Math.random() * 3); // Simulate some errors
  const rowsErr = readings.length - rowsOk;
  console.log(`Bulk imported ${rowsOk} readings, ${rowsErr} errors`);
  return { success: true, rowsOk, rowsErr };
};

export const readingService = {
  getAll: getReadings,
  getByMeterAndDate: getReadingByMeterAndDate,
  save: saveReading,
  update: updateReading,
  bulkImport: bulkImportReadings
};

// ========== Meter Service ==========
// Mock meters data
const mockMeters = [
  { id: 'meter1', name: 'Main Electric Meter', type: 'ELEC', site_id: 'site1' },
  { id: 'meter2', name: 'Boiler Room', type: 'GAS', site_id: 'site1' },
  { id: 'meter3', name: 'Solar Panels', type: 'ELEC', site_id: 'site1' },
  { id: 'meter4', name: 'Emergency Generator', type: 'ELEC', site_id: 'site2' },
  { id: 'meter5', name: 'Factory Floor', type: 'GAS', site_id: 'site2' },
  { id: 'meter6', name: 'Office Building', type: 'ELEC', site_id: 'site2' },
  { id: 'meter7', name: 'Building A', type: 'ELEC', site_id: 'site3' },
  { id: 'meter8', name: 'Building B', type: 'GAS', site_id: 'site3' }
];

const getMetersBySite = async (siteId: string) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockMeters.filter(meter => meter.site_id === siteId);
};

export const meterService = {
  getMetersBySite,
  getSites // Reuse getSites from site service
};

// ========== Admin Service ==========
// Mock emission factors
const mockEmissionFactors = [
  { id: 'ef1', name: 'Electricity (FR)', value: 0.035, unit: 'kgCO2/kWh' },
  { id: 'ef2', name: 'Natural Gas', value: 0.185, unit: 'kgCO2/kWh' },
  { id: 'ef3', name: 'Heating Oil', value: 0.266, unit: 'kgCO2/kWh' }
];

const getEmissionFactors = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockEmissionFactors;
};

const updateEmissionFactor = async ({ id, value }: { id: string; value: number }) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  console.log(`Updating emission factor ${id} to ${value}`);
  return { success: true };
};

// Mock users
const mockUsers = [
  { id: 'user1', email: 'admin@example.com', role: 'Admin' },
  { id: 'user2', email: 'operator@example.com', role: 'Operator' },
  { id: 'user3', email: 'viewer@example.com', role: 'Viewer' }
];

const getUsers = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockUsers;
};

const createUser = async (userData: any) => {
  await new Promise(resolve => setTimeout(resolve, 700));
  console.log("Creating user:", userData);
  return { success: true, id: `user-${Date.now()}` };
};

export const adminService = {
  getEmissionFactors,
  updateEmissionFactor,
  getUsers,
  createUser
};

// ========== PI Service ==========
// Mock PI tags
const mockPiTags = [
  { id: 'tag1', name: 'SITE1:ELEC:MAIN', description: 'Main Electricity Meter', unit: 'kWh', site_id: 'site1' },
  { id: 'tag2', name: 'SITE1:GAS:BOILER', description: 'Boiler Gas Consumption', unit: 'm³', site_id: 'site1' },
  { id: 'tag3', name: 'SITE2:ELEC:BUILDING_A', description: 'Building A Electricity', unit: 'kWh', site_id: 'site2' },
  { id: 'tag4', name: 'SITE3:ELEC:PRODUCTION', description: 'Production Line Power', unit: 'kWh', site_id: 'site3' }
];

const getPiTags = async () => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockPiTags;
};

const getPiTagsBySite = async (siteId: string) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockPiTags.filter(tag => tag.site_id === siteId);
};

export const piService = {
  getTags: getPiTags,
  getTagsBySite: getPiTagsBySite,
  getSites
};

// ========== Import Log Service ==========
// Mock import logs
const mockImportLogs = [
  { id: 'log1', ts: '2023-04-15T14:30:00Z', user_email: 'operator@example.com', file_name: 'april_readings.csv', rows_ok: 145, rows_err: 3 },
  { id: 'log2', ts: '2023-04-10T09:15:00Z', user_email: 'admin@example.com', file_name: 'march_readings.csv', rows_ok: 132, rows_err: 0 },
  { id: 'log3', ts: '2023-03-28T11:45:00Z', user_email: 'operator@example.com', file_name: 'special_meters.csv', rows_ok: 24, rows_err: 2 }
];

const getImportLogs = async (filters: { startDate: string, endDate: string }) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return mockImportLogs.filter(log => {
    const logDate = log.ts.split('T')[0];
    return logDate >= filters.startDate && logDate <= filters.endDate;
  });
};

const createImportLog = async (logData: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Creating import log:", logData);
  return { success: true, id: `log-${Date.now()}` };
};

export const importLogService = {
  getImportLogs,
  create: createImportLog
};

// ========== Journal Service ==========
// Mock journal service (reusing import logs)
export const journalService = {
  getImportLogs,
  exportCsv: async (filters: { startDate: string, endDate: string }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`Exporting logs from ${filters.startDate} to ${filters.endDate}`);
    // In a real app, this would trigger a file download
    return { success: true };
  }
};

// ========== KPI Service ==========
// Mock KPI data
const mockKpiData = [
  { id: 'kpi1', site_id: 'site1', day: '2023-04-15', kwh: 1245.8, co2: 43.6, cost_eur: 187.5 },
  { id: 'kpi2', site_id: 'site1', day: '2023-04-14', kwh: 1198.2, co2: 41.9, cost_eur: 180.2 },
  { id: 'kpi3', site_id: 'site2', day: '2023-04-15', kwh: 2345.1, co2: 82.1, cost_eur: 352.3 },
  { id: 'kpi4', site_id: 'site2', day: '2023-04-14', kwh: 2456.3, co2: 86.0, cost_eur: 370.1 },
  { id: 'kpi5', site_id: 'site3', day: '2023-04-15', kwh: 987.3, co2: 34.6, cost_eur: 148.9 },
  { id: 'kpi6', site_id: 'site3', day: '2023-04-14', kwh: 1023.5, co2: 35.8, cost_eur: 154.1 }
];

const getKpiByDateRange = async (startDate: string, endDate: string) => {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return mockKpiData.filter(kpi => {
    return kpi.day >= startDate && kpi.day <= endDate;
  });
};

export const kpiService = {
  getByDateRange: getKpiByDateRange
};
