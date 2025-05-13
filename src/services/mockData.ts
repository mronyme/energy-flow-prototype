
import { KpiDaily, Site } from '../types';

// Mock sites data
export const mockSites: Site[] = [
  { id: '1', name: 'Paris Factory', country: 'FR' },
  { id: '2', name: 'Lyon Distribution', country: 'FR' },
  { id: '3', name: 'Marseille Warehouse', country: 'FR' },
];

// Generate date array for the last 30 days
const generateDateArray = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

// Generate random KPI value with trend
const generateKpiValue = (baseValue: number, day: number, variance: number): number => {
  // Create a slight upward trend as days progress
  const trendFactor = 1 + (day / 100);
  // Add random variance
  const randomFactor = 1 + ((Math.random() * variance * 2) - variance);
  
  return parseFloat((baseValue * trendFactor * randomFactor).toFixed(2));
};

// Generate mock KPI data
export const generateMockKpiData = (): KpiDaily[] => {
  const dates = generateDateArray(30);
  const mockData: KpiDaily[] = [];
  
  // Base values for each site
  const siteBaseValues = {
    '1': { kwh: 1200, co2: 350, cost_eur: 180 },
    '2': { kwh: 950, co2: 280, cost_eur: 140 },
    '3': { kwh: 1500, co2: 420, cost_eur: 220 },
  };
  
  // Generate data for each site and date
  mockSites.forEach(site => {
    dates.forEach((date, index) => {
      // Get base values for this site
      const baseValues = siteBaseValues[site.id as keyof typeof siteBaseValues];
      
      // Generate values with some variance
      mockData.push({
        id: `kpi-${site.id}-${date}`,
        site_id: site.id,
        day: date,
        kwh: generateKpiValue(baseValues.kwh, index, 0.15),
        co2: generateKpiValue(baseValues.co2, index, 0.12),
        cost_eur: generateKpiValue(baseValues.cost_eur, index, 0.18),
      });
    });
  });
  
  return mockData;
};

// Generate daily mock data for the specified date range
export const mockKpiService = {
  getAllSitesKpi: (startDate: string, endDate: string) => {
    // In a real implementation, we would filter by date range
    // For mock purposes, we'll just log and return all data
    console.log(`Fetching mock KPI data from ${startDate} to ${endDate}`);
    const data = generateMockKpiData();
    console.log(`Generated ${data.length} mock KPI records`);
    return Promise.resolve(data);
  }
};

export const mockSiteService = {
  getSites: () => {
    console.log('Fetching mock sites data:', mockSites);
    return Promise.resolve(mockSites);
  }
};
