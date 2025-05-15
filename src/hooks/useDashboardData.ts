
import { useState, useEffect } from 'react';
import { kpiService, siteService } from '../services/api';
import { mockKpiService, mockSiteService } from '../services/mockData';
import { KpiDaily, Site } from '../types';
import { dateUtils } from '../utils/validation';

// Flag to determine whether to use mock data
const USE_MOCK_DATA = true;

export const useDashboardData = (periodType: 'week' | 'month' = 'week', selectedSiteId: string = 'all') => {
  const [sites, setSites] = useState<Site[]>([]);
  const [kpiData, setKpiData] = useState<KpiDaily[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load sites - use mock or real data
        const sitesData = USE_MOCK_DATA 
          ? await mockSiteService.getSites() 
          : await siteService.getSites();
        
        setSites(sitesData);
        
        // Load KPI data
        const endDate = new Date();
        const startDate = new Date();
        
        // Set date range based on period
        if (periodType === 'week') {
          startDate.setDate(startDate.getDate() - 7);
        } else {
          startDate.setDate(startDate.getDate() - 30);
        }
        
        // Use mock or real KPI service
        const kpiResult = USE_MOCK_DATA
          ? await mockKpiService.getAllSitesKpi(
              dateUtils.format(startDate),
              dateUtils.format(endDate)
            )
          : await kpiService.getAllSitesKpi(
              dateUtils.format(startDate),
              dateUtils.format(endDate)
            );
        
        setKpiData(kpiResult);
        console.log('KPI Data loaded:', kpiResult.length, 'records');
        
        // Log site IDs to help debug site filtering
        if (kpiResult.length > 0) {
          const uniqueSiteIds = [...new Set(kpiResult.map(item => item.site_id))];
          console.log('Available site IDs in KPI data:', uniqueSiteIds);
          console.log('Selected site ID:', selectedSiteId);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [periodType]);
  
  // Filter KPI data based on selected site
  const filteredKpiData = selectedSiteId === 'all'
    ? kpiData
    : kpiData.filter(kpi => String(kpi.site_id) === String(selectedSiteId));
  
  // Log the filtered data count to help with debugging
  console.log(`Filtered KPI data for site ${selectedSiteId}: ${filteredKpiData.length} records`);
  
  // Calculate totals for all metrics
  const calculateTotals = () => {
    if (filteredKpiData.length === 0) {
      return {
        totalFuelConsumption: 0, 
        totalCo2: 0, 
        totalCost: 0,
        totalElectricityProduction: 0,
        totalHeatProduction: 0,
        avgEfficiency: 0,
        avgAvailability: 0
      };
    }
    
    const totals = filteredKpiData.reduce(
      (acc, kpi) => {
        return {
          totalFuelConsumption: acc.totalFuelConsumption + kpi.fuel_consumption_mwh,
          totalCo2: acc.totalCo2 + kpi.co2,
          totalCost: acc.totalCost + kpi.cost_eur,
          totalElectricityProduction: acc.totalElectricityProduction + kpi.electricity_production_mwh,
          totalHeatProduction: acc.totalHeatProduction + kpi.heat_production_mwh,
          // For averages, we'll sum now and divide later
          sumEfficiency: acc.sumEfficiency + kpi.efficiency_percent,
          sumAvailability: acc.sumAvailability + kpi.availability_percent,
        };
      },
      { 
        totalFuelConsumption: 0, 
        totalCo2: 0, 
        totalCost: 0,
        totalElectricityProduction: 0,
        totalHeatProduction: 0,
        sumEfficiency: 0,
        sumAvailability: 0
      }
    );
    
    // Calculate averages from sums
    const count = filteredKpiData.length;
    return {
      ...totals,
      avgEfficiency: parseFloat((totals.sumEfficiency / count).toFixed(1)),
      avgAvailability: parseFloat((totals.sumAvailability / count).toFixed(1)),
    };
  };
  
  // Calculate percentage change for KPIs
  const calculateChange = () => {
    if (filteredKpiData.length < 2) {
      return { 
        fuelChange: 0, 
        co2Change: 0, 
        costChange: 0,
        electricityChange: 0,
        heatChange: 0,
        efficiencyChange: 0,
        availabilityChange: 0
      };
    }
    
    // Sort data by date
    const sortedData = [...filteredKpiData].sort((a, b) => 
      new Date(a.day).getTime() - new Date(b.day).getTime()
    );
    
    // Split into two equal periods
    const midpoint = Math.floor(sortedData.length / 2);
    const firstPeriod = sortedData.slice(0, midpoint);
    const secondPeriod = sortedData.slice(midpoint);
    
    // Calculate averages for both periods
    const firstAvg = {
      fuel: firstPeriod.reduce((sum, kpi) => sum + kpi.fuel_consumption_mwh, 0) / firstPeriod.length,
      co2: firstPeriod.reduce((sum, kpi) => sum + kpi.co2, 0) / firstPeriod.length,
      cost: firstPeriod.reduce((sum, kpi) => sum + kpi.cost_eur, 0) / firstPeriod.length,
      electricity: firstPeriod.reduce((sum, kpi) => sum + kpi.electricity_production_mwh, 0) / firstPeriod.length,
      heat: firstPeriod.reduce((sum, kpi) => sum + kpi.heat_production_mwh, 0) / firstPeriod.length,
      efficiency: firstPeriod.reduce((sum, kpi) => sum + kpi.efficiency_percent, 0) / firstPeriod.length,
      availability: firstPeriod.reduce((sum, kpi) => sum + kpi.availability_percent, 0) / firstPeriod.length,
    };
    
    const secondAvg = {
      fuel: secondPeriod.reduce((sum, kpi) => sum + kpi.fuel_consumption_mwh, 0) / secondPeriod.length,
      co2: secondPeriod.reduce((sum, kpi) => sum + kpi.co2, 0) / secondPeriod.length,
      cost: secondPeriod.reduce((sum, kpi) => sum + kpi.cost_eur, 0) / secondPeriod.length,
      electricity: secondPeriod.reduce((sum, kpi) => sum + kpi.electricity_production_mwh, 0) / secondPeriod.length,
      heat: secondPeriod.reduce((sum, kpi) => sum + kpi.heat_production_mwh, 0) / secondPeriod.length,
      efficiency: secondPeriod.reduce((sum, kpi) => sum + kpi.efficiency_percent, 0) / secondPeriod.length,
      availability: secondPeriod.reduce((sum, kpi) => sum + kpi.availability_percent, 0) / secondPeriod.length,
    };
    
    // Calculate percentage change and round to 1 decimal place
    const calculatePercentChange = (first: number, second: number) => {
      return first === 0 ? 0 : parseFloat((((second - first) / first) * 100).toFixed(1));
    };
    
    return {
      fuelChange: calculatePercentChange(firstAvg.fuel, secondAvg.fuel),
      co2Change: calculatePercentChange(firstAvg.co2, secondAvg.co2),
      costChange: calculatePercentChange(firstAvg.cost, secondAvg.cost),
      electricityChange: calculatePercentChange(firstAvg.electricity, secondAvg.electricity),
      heatChange: calculatePercentChange(firstAvg.heat, secondAvg.heat),
      efficiencyChange: calculatePercentChange(firstAvg.efficiency, secondAvg.efficiency),
      availabilityChange: calculatePercentChange(firstAvg.availability, secondAvg.availability),
    };
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    if (filteredKpiData.length === 0) return [];
    
    // Sort data by date
    return [...filteredKpiData]
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
      .map(kpi => ({
        ...kpi,
        // Format the date as needed for the chart
        day: kpi.day,
      }));
  };
  
  const { 
    totalFuelConsumption, 
    totalCo2, 
    totalCost,
    totalElectricityProduction,
    totalHeatProduction,
    avgEfficiency,
    avgAvailability
  } = calculateTotals();
  
  const { 
    fuelChange, 
    co2Change, 
    costChange,
    electricityChange,
    heatChange,
    efficiencyChange,
    availabilityChange
  } = calculateChange();
  
  const chartData = prepareChartData();
  
  return {
    sites,
    kpiData: filteredKpiData,
    chartData,
    loading,
    // Fuel consumption
    totalFuelConsumption,
    fuelChange,
    // Environmental
    totalCo2,
    co2Change,
    // Financial
    totalCost,
    costChange,
    // Production
    totalElectricityProduction,
    electricityChange,
    totalHeatProduction,
    heatChange,
    // Performance
    avgEfficiency,
    efficiencyChange,
    avgAvailability,
    availabilityChange
  };
};
