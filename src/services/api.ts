import { Site, Anomaly } from '@/types';

// Mock API endpoint URLs
const API_BASE_URL = 'https://your-api.com'; // Replace with your actual API base URL
const SITES_ENDPOINT = `${API_BASE_URL}/sites`;
const ANOMALIES_ENDPOINT = `${API_BASE_URL}/anomalies`;
const CORRECT_ANOMALY_ENDPOINT = `${API_BASE_URL}/anomalies/correct`;

// Mock function to simulate fetching sites
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
