
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
  
  // Calculate totals
  const calculateTotals = () => {
    if (filteredKpiData.length === 0) return { totalKwh: 0, totalCo2: 0, totalCost: 0 };
    
    return filteredKpiData.reduce(
      (acc, kpi) => {
        return {
          totalKwh: acc.totalKwh + kpi.kwh,
          totalCo2: acc.totalCo2 + kpi.co2,
          totalCost: acc.totalCost + kpi.cost_eur,
        };
      },
      { totalKwh: 0, totalCo2: 0, totalCost: 0 }
    );
  };
  
  // Calculate percentage change for KPIs
  const calculateChange = () => {
    if (filteredKpiData.length < 2) return { kwhChange: 0, co2Change: 0, costChange: 0 };
    
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
      kwh: firstPeriod.reduce((sum, kpi) => sum + kpi.kwh, 0) / firstPeriod.length,
      co2: firstPeriod.reduce((sum, kpi) => sum + kpi.co2, 0) / firstPeriod.length,
      cost: firstPeriod.reduce((sum, kpi) => sum + kpi.cost_eur, 0) / firstPeriod.length,
    };
    
    const secondAvg = {
      kwh: secondPeriod.reduce((sum, kpi) => sum + kpi.kwh, 0) / secondPeriod.length,
      co2: secondPeriod.reduce((sum, kpi) => sum + kpi.co2, 0) / secondPeriod.length,
      cost: secondPeriod.reduce((sum, kpi) => sum + kpi.cost_eur, 0) / secondPeriod.length,
    };
    
    // Calculate percentage change and round to 1 decimal place
    return {
      kwhChange: firstAvg.kwh === 0 ? 0 : parseFloat((((secondAvg.kwh - firstAvg.kwh) / firstAvg.kwh) * 100).toFixed(1)),
      co2Change: firstAvg.co2 === 0 ? 0 : parseFloat((((secondAvg.co2 - firstAvg.co2) / firstAvg.co2) * 100).toFixed(1)),
      costChange: firstAvg.cost === 0 ? 0 : parseFloat((((secondAvg.cost - firstAvg.cost) / firstAvg.cost) * 100).toFixed(1)),
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
  
  const { totalKwh, totalCo2, totalCost } = calculateTotals();
  const { kwhChange, co2Change, costChange } = calculateChange();
  const chartData = prepareChartData();
  
  return {
    sites,
    kpiData: filteredKpiData,
    chartData,
    loading,
    totalKwh,
    totalCo2,
    totalCost,
    kwhChange,
    co2Change,
    costChange
  };
};
