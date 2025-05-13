
import { useState, useEffect } from 'react';
import { kpiService, siteService } from '../services/api';
import { KpiDaily, Site } from '../types';
import { dateUtils } from '../utils/validation';

export const useDashboardData = (periodType: 'week' | 'month' = 'week', selectedSiteId: string = 'all') => {
  const [sites, setSites] = useState<Site[]>([]);
  const [kpiData, setKpiData] = useState<KpiDaily[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load sites
        const sitesData = await siteService.getAll();
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
        
        const kpiResult = await kpiService.getByDateRange(
          dateUtils.format(startDate),
          dateUtils.format(endDate)
        );
        
        setKpiData(kpiResult);
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
    : kpiData.filter(kpi => kpi.site_id === selectedSiteId);
  
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
    
    // Calculate percentage change
    return {
      kwhChange: firstAvg.kwh === 0 ? 0 : ((secondAvg.kwh - firstAvg.kwh) / firstAvg.kwh) * 100,
      co2Change: firstAvg.co2 === 0 ? 0 : ((secondAvg.co2 - firstAvg.co2) / firstAvg.co2) * 100,
      costChange: firstAvg.cost === 0 ? 0 : ((secondAvg.cost - firstAvg.cost) / firstAvg.cost) * 100,
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
