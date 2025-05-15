
import { KpiDaily, Site } from '../types';

// Mock sites data updated to represent ENGIE production sites
export const mockSites: Site[] = [
  { id: '1', name: 'Centrale CCGT DK6 - Dunkerque', country: 'FR', type: 'CCGT' },
  { id: '2', name: 'Centrale biomasse - Commentry', country: 'FR', type: 'Biomass' },
  { id: '3', name: 'Centrale thermique - Le Havre', country: 'FR', type: 'Thermal' },
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
const generateKpiValue = (baseValue: number, day: number, variance: number, trendFactor: number = 1): number => {
  // Create a slight upward trend as days progress
  const trend = 1 + ((day / 100) * trendFactor);
  // Add random variance
  const randomFactor = 1 + ((Math.random() * variance * 2) - variance);
  
  return parseFloat((baseValue * trend * randomFactor).toFixed(2));
};

// Calculate efficiency based on inputs and outputs
const calculateEfficiency = (fuelInput: number, electricityOutput: number, heatOutput: number): number => {
  const totalOutput = electricityOutput + heatOutput;
  // Real-world efficiency typically between 40-95% depending on plant type
  const efficiency = (totalOutput / fuelInput) * 100;
  // Ensure realistic bounds and round to one decimal
  return parseFloat(Math.min(95, Math.max(40, efficiency)).toFixed(1));
};

// Generate mock KPI data with production metrics
export const generateMockKpiData = (): KpiDaily[] => {
  const dates = generateDateArray(30);
  const mockData: KpiDaily[] = [];
  
  // Base values for each site based on power plant type
  const siteBaseValues = {
    '1': { // CCGT - High electricity efficiency
      fuel_consumption_mwh: 1600, 
      co2: 320, 
      cost_eur: 200,
      electricity_production_mwh: 960, // ~60% electrical efficiency
      heat_production_mwh: 320, // ~20% heat recovery
      availability_percent: 95
    },
    '2': { // Biomass - Medium efficiency, low CO2
      fuel_consumption_mwh: 1200, 
      co2: 120, // Lower CO2 as biomass is considered renewable
      cost_eur: 170,
      electricity_production_mwh: 480, // ~40% electrical efficiency
      heat_production_mwh: 420, // ~35% heat production
      availability_percent: 88
    },
    '3': { // Thermal - Higher emissions, variable efficiency
      fuel_consumption_mwh: 1800, 
      co2: 650, // Higher CO2 emissions
      cost_eur: 250,
      electricity_production_mwh: 750, // ~42% electrical efficiency
      heat_production_mwh: 300, // ~17% heat production
      availability_percent: 92
    },
  };
  
  // Generate data for each site and date
  mockSites.forEach(site => {
    dates.forEach((date, index) => {
      // Get base values for this site
      const baseValues = siteBaseValues[site.id as keyof typeof siteBaseValues];
      
      // Generate values with some variance and trend factors
      const fuelConsumption = generateKpiValue(baseValues.fuel_consumption_mwh, index, 0.15, 1.0);
      const electricityProduction = generateKpiValue(baseValues.electricity_production_mwh, index, 0.12, 1.1);
      const heatProduction = generateKpiValue(baseValues.heat_production_mwh, index, 0.14, 0.95);
      
      // Calculate efficiency from actual fuel and production values
      const efficiency = calculateEfficiency(fuelConsumption, electricityProduction, heatProduction);
      
      // Generate availability with less variance
      const availability = generateKpiValue(baseValues.availability_percent, index, 0.05, 0.2);
      
      // Add the data point with all metrics
      mockData.push({
        id: `kpi-${site.id}-${date}`,
        site_id: site.id,
        day: date,
        fuel_consumption_mwh: fuelConsumption,
        co2: generateKpiValue(baseValues.co2, index, 0.12, 1.0),
        cost_eur: generateKpiValue(baseValues.cost_eur, index, 0.18, 1.05),
        electricity_production_mwh: electricityProduction,
        heat_production_mwh: heatProduction,
        efficiency_percent: efficiency,
        availability_percent: parseFloat(Math.min(100, Math.max(60, availability)).toFixed(1)),
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
