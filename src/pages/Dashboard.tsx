
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import KpiCard from '@/components/dashboard/KpiCard';
import TrendLineChart from '@/components/dashboard/TrendLineChart';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { dateUtils } from '@/utils/validation';
import { Site } from '@/types';
import ExportPanel from '@/components/dashboard/ExportPanel';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const detailView = searchParams.get('view');
  const siteParam = searchParams.get('site') || 'all';
  const periodParam = searchParams.get('period') || 'week';
  
  const [selectedSite, setSelectedSite] = useState<string>(siteParam);
  const [periodType, setPeriodType] = useState<'week' | 'month'>(periodParam as 'week' | 'month');
  const [currentDetailView, setCurrentDetailView] = useState<string | null>(detailView);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get dashboard data using our custom hook
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
  
  console.info('Dashboard renders with chart data:', chartData.length, 'items');
  console.info('Current detail view:', currentDetailView);
  
  // Effect to handle URL parameter changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view');
    const siteParam = params.get('site');
    const periodParam = params.get('period');
    
    setCurrentDetailView(viewParam);
    
    if (siteParam) {
      setSelectedSite(siteParam);
    }
    
    if (periodParam === 'week' || periodParam === 'month') {
      setPeriodType(periodParam);
    }
  }, [location.search]);
  
  // Handle site change
  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
    
    // Update URL without losing other parameters
    const params = new URLSearchParams(location.search);
    params.set('site', value);
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  };
  
  // Handle period type change
  const handlePeriodChange = (value: 'week' | 'month') => {
    setPeriodType(value);
    
    // Update URL without losing other parameters
    const params = new URLSearchParams(location.search);
    params.set('period', value);
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  };
  
  // Handle KPI card click for drill-down
  const handleKpiCardClick = (kpiType: string) => {
    // Update URL with the selected KPI type
    const params = new URLSearchParams(location.search);
    params.set('view', kpiType);
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  };
  
  // Handle back button click to clear detail view
  const handleBackClick = () => {
    const params = new URLSearchParams(location.search);
    params.delete('view');
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    });
  };
  
  // Get current site name
  const getCurrentSiteName = () => {
    if (selectedSite === 'all') return 'All Sites';
    const site = sites.find(s => s.id === selectedSite);
    return site ? site.name : 'Unknown Site';
  };
  
  // Get date range for the current period
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (periodType === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }
    
    return { startDate, endDate };
  };
  
  // Prepare chart title based on current view
  const getChartTitle = () => {
    const siteName = getCurrentSiteName();
    let kpiTitle = 'Energy Consumption';
    
    if (currentDetailView === 'co2') {
      kpiTitle = 'CO₂ Emissions';
    } else if (currentDetailView === 'cost') {
      kpiTitle = 'Energy Cost';
    }
    
    return `${kpiTitle} - ${siteName}`;
  };
  
  return (
    <div className="space-y-4 p-4 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedSite} onValueChange={handleSiteChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Tabs value={periodType} onValueChange={(v) => handlePeriodChange(v as 'week' | 'month')}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {!currentDetailView ? (
        // Overview with all KPIs
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <KpiCard
              title="Energy Consumption"
              value={totalKwh}
              unit="kWh"
              change={kwhChange}
              onClick={() => handleKpiCardClick('energy')}
            />
            <KpiCard
              title="CO₂ Emissions"
              value={totalCo2}
              unit="kg CO₂"
              change={co2Change}
              onClick={() => handleKpiCardClick('co2')}
            />
            <KpiCard
              title="Energy Cost"
              value={totalCost}
              unit="€"
              change={costChange}
              onClick={() => handleKpiCardClick('cost')}
            />
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Energy Monitoring Overview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {dateUtils.formatDisplay(getDateRange().startDate.toISOString())} - {dateUtils.formatDisplay(getDateRange().endDate.toISOString())}
                </p>
              </div>
              
              <ExportPanel 
                data={chartData} 
                siteName={getCurrentSiteName()}
                dateRange={getDateRange()}
              />
            </CardHeader>
            <CardContent>
              <TrendLineChart data={chartData} />
            </CardContent>
          </Card>
        </>
      ) : (
        // Detail view for a specific KPI
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBackClick} 
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
                <CardTitle>{getChartTitle()}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                {dateUtils.formatDisplay(getDateRange().startDate.toISOString())} - {dateUtils.formatDisplay(getDateRange().endDate.toISOString())}
              </p>
            </div>
            
            <ExportPanel 
              data={chartData} 
              siteName={getCurrentSiteName()}
              dateRange={getDateRange()}
            />
          </CardHeader>
          <CardContent className="pt-6">
            <TrendLineChart 
              data={chartData} 
              focusMetric={
                currentDetailView === 'co2' ? 'co2' : 
                currentDetailView === 'cost' ? 'cost_eur' : 'kwh'
              } 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
