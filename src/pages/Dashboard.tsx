
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KpiDaily } from '../types';
import KpiCard from '../components/dashboard/KpiCard';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import { Bolt, BarChart3, Wallet } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useSearchParams } from 'react-router-dom';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const detailView = searchParams.get('view') as 'kwh' | 'co2' | 'cost' | null;
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [periodType, setPeriodType] = useState<'week' | 'month'>('week');
  
  // Use the custom hook to fetch and manage dashboard data
  const {
    sites,
    chartData,
    loading,
    totalKwh,
    totalCo2,
    totalCost,
    kwhChange,
    co2Change,
    costChange
  } = useDashboardData(periodType, selectedSite);
  
  // Handle KPI card click for drill-down
  const handleKpiCardClick = (type: 'kwh' | 'co2' | 'cost') => {
    // IF-07: Set detail view parameter for drill-down chart
    if (detailView === type) {
      // If clicking the same card, clear the detail view
      setSearchParams({});
    } else {
      setSearchParams({ view: type });
    }
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
          isActive={detailView === 'kwh'}
        />
        
        <KpiCard
          title="CO₂ Emissions"
          value={Math.round(totalCo2).toLocaleString()}
          unit="kg"
          change={Math.round(co2Change * 10) / 10}
          icon={<BarChart3 className="h-5 w-5 text-green-600" />}
          onClick={() => handleKpiCardClick('co2')}
          isActive={detailView === 'co2'}
        />
        
        <KpiCard
          title="Cost"
          value={Math.round(totalCost).toLocaleString()}
          unit="€"
          change={Math.round(costChange * 10) / 10}
          icon={<Wallet className="h-5 w-5 text-amber-600" />}
          onClick={() => handleKpiCardClick('cost')}
          isActive={detailView === 'cost'}
        />
      </div>
      
      <Card className="shadow-sm ring-1 ring-dark/10">
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
