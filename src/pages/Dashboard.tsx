
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { siteService, kpiService } from '../services/api';
import { KpiDaily, Site } from '../types';
import KpiCard from '../components/dashboard/KpiCard';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import { dateUtils } from '../utils/validation';
import { Bolt, BarChart3, Wallet } from 'lucide-react';

const Dashboard = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [periodType, setPeriodType] = useState<'week' | 'month'>('week');
  const [kpiData, setKpiData] = useState<KpiDaily[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailView, setDetailView] = useState<'kwh' | 'co2' | 'cost' | null>(null);
  
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
  const filteredKpiData = selectedSite === 'all'
    ? kpiData
    : kpiData.filter(kpi => kpi.site_id === selectedSite);
  
  // Calculate totals and averages
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
  
  const { totalKwh, totalCo2, totalCost } = calculateTotals();
  
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
  
  const { kwhChange, co2Change, costChange } = calculateChange();
  
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
  
  const chartData = prepareChartData();
  
  // Handle KPI card click for drill-down
  const handleKpiCardClick = (type: 'kwh' | 'co2' | 'cost') => {
    setDetailView(type);
  };
  
  // Get chart configuration based on detail view
  const getChartConfig = () => {
    if (detailView === 'kwh') {
      return {
        title: 'Energy Consumption (kWh)',
        dataKeys: [{ key: 'kwh', name: 'Energy (kWh)', color: '#00AAFF' }],
      };
    } else if (detailView === 'co2') {
      return {
        title: 'CO₂ Emissions (kg)',
        dataKeys: [{ key: 'co2', name: 'CO₂ (kg)', color: '#4CAF50' }],
      };
    } else if (detailView === 'cost') {
      return {
        title: 'Cost (EUR)',
        dataKeys: [{ key: 'cost_eur', name: 'Cost (€)', color: '#FF9800' }],
      };
    } else {
      return {
        title: 'Energy Monitoring Overview',
        dataKeys: [
          { key: 'kwh', name: 'Energy (kWh)', color: '#00AAFF' },
          { key: 'co2', name: 'CO₂ (kg)', color: '#4CAF50' },
          { key: 'cost_eur', name: 'Cost (€)', color: '#FF9800' },
        ],
      };
    }
  };
  
  const chartConfig = getChartConfig();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">Energy Dashboard</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites.map(site => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={periodType} onValueChange={(value) => setPeriodType(value as 'week' | 'month')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Energy Consumption"
          value={Math.round(totalKwh).toLocaleString()}
          unit="kWh"
          change={Math.round(kwhChange * 10) / 10}
          icon={<Bolt className="h-5 w-5 text-primary" />}
          onClick={() => handleKpiCardClick('kwh')}
        />
        
        <KpiCard
          title="CO₂ Emissions"
          value={Math.round(totalCo2).toLocaleString()}
          unit="kg"
          change={Math.round(co2Change * 10) / 10}
          icon={<BarChart3 className="h-5 w-5 text-green-600" />}
          onClick={() => handleKpiCardClick('co2')}
        />
        
        <KpiCard
          title="Cost"
          value={Math.round(totalCost).toLocaleString()}
          unit="€"
          change={Math.round(costChange * 10) / 10}
          icon={<Wallet className="h-5 w-5 text-amber-600" />}
          onClick={() => handleKpiCardClick('cost')}
        />
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <TrendLineChart
            data={chartData}
            dataKeys={chartConfig.dataKeys}
            title={chartConfig.title}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
