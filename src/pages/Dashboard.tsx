
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import KpiCard from '@/components/dashboard/KpiCard';
import TrendLineChart from '@/components/dashboard/TrendLineChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChartIcon, LineChartIcon, PieChartIcon, Download, Calendar, AlertTriangle } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import ExportPanel from '@/components/dashboard/ExportPanel';
import { DatePicker } from '@/components/ui/date-picker';

const Dashboard: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [selectedKpi, setSelectedKpi] = useState<string>('kwh');
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(1))); // First day of current month
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showExport, setShowExport] = useState(false);
  
  // Use custom hook to fetch dashboard data with the right parameters
  const { 
    chartData: dashboardData, 
    loading: isLoading, 
    totalKwh,
    totalCo2,
    totalCost,
    kwhChange,
    co2Change,
    costChange,
    sites
  } = useDashboardData(selectedPeriod as any, selectedSite);
  
  const handleSiteChange = (value: string) => {
    console.log(`Changing selected site to: ${value}`);
    setSelectedSite(value);
  };
  
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    
    // Adjust date range based on selected period
    const today = new Date();
    let newStartDate = new Date();
    
    switch (value) {
      case 'week':
        newStartDate = new Date(today);
        newStartDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter':
        newStartDate = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        newStartDate = new Date(today.getFullYear(), 0, 1);
        break;
    }
    
    setStartDate(newStartDate);
    setEndDate(today);
  };
  
  const handleKpiSelect = (kpi: string) => {
    setSelectedKpi(kpi);
  };
  
  const toggleExportPanel = () => {
    setShowExport(!showExport);
  };
  
  // Define dataKeys for the chart
  const dataKeys = [
    { key: 'kwh', color: '#3b82f6', name: 'Consumption (kWh)' },
    { key: 'co2', color: '#10b981', name: 'CO₂ Emissions' },
    { key: 'cost_eur', color: '#f59e0b', name: 'Cost (EUR)' }
  ];

  // Check if we have data
  const hasData = dashboardData && dashboardData.length > 0;
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Monitor and analyze your energy consumption.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          <Select
            value={selectedSite}
            onValueChange={handleSiteChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites && sites.map(site => (
                <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedPeriod}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedPeriod === 'custom' && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <Label>Start Date</Label>
            <DatePicker
              selected={startDate}
              onSelect={setStartDate}
              maxDate={new Date()}
            />
          </div>
          <div>
            <Label>End Date</Label>
            <DatePicker
              selected={endDate}
              onSelect={setEndDate}
              maxDate={new Date()}
              minDate={startDate}
            />
          </div>
        </div>
      )}
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard
          title="Energy Consumption"
          value={totalKwh.toLocaleString()}
          unit="kWh"
          change={kwhChange}
          icon={<BarChartIcon />}
          onClick={() => handleKpiSelect('kwh')}
          isActive={selectedKpi === 'kwh'}
        />
        
        <KpiCard
          title="CO₂ Emissions"
          value={totalCo2.toLocaleString()}
          unit="kg"
          change={co2Change}
          icon={<LineChartIcon />}
          onClick={() => handleKpiSelect('co2')}
          isActive={selectedKpi === 'co2'}
        />
        
        <KpiCard
          title="Energy Cost"
          value={totalCost.toLocaleString()}
          unit="EUR"
          change={costChange}
          icon={<PieChartIcon />}
          onClick={() => handleKpiSelect('cost_eur')}
          isActive={selectedKpi === 'cost_eur'}
        />
      </div>
      
      {/* Tabs for different views */}
      <Tabs defaultValue="chart">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" onClick={toggleExportPanel}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
        
        <TabsContent value="chart" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-80">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : !hasData ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <AlertTriangle size={48} className="text-amber-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Data Available</h3>
                <p className="text-center text-gray-600">
                  {selectedSite !== 'all' 
                    ? `No data available for the selected site and time period.` 
                    : `No data available for the selected time period.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Main chart */
            <TrendLineChart 
              data={dashboardData} 
              dataKeys={dataKeys}
              focusMetric={selectedKpi}
            />
          )}
        </TabsContent>
        
        <TabsContent value="details">
          {/* Detailed view with tables would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Consumption Data</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table would go here */}
              <p>Detailed consumption data would be displayed here in tabular format.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <ExportPanel 
        isOpen={showExport} 
        onClose={() => setShowExport(false)} 
        data={dashboardData || []} 
        dateRange={{ startDate, endDate }}
      />
    </div>
  );
};

// Helper component for the custom date range
const Label: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div className="text-sm font-medium mb-1 flex items-center">
    <Calendar className="w-4 h-4 mr-1" />
    {children}
  </div>
);

export default Dashboard;
