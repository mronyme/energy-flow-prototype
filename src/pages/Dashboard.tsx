
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import KpiCard from '@/components/dashboard/KpiCard';
import TrendLineChart from '@/components/dashboard/TrendLineChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  BarChartIcon, LineChartIcon, PieChartIcon, Download, Calendar, AlertTriangle,
  Wind, Flame, Gauge, Fuel, Zap, TrendingUp, TrendingDown
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import ExportPanel from '@/components/dashboard/ExportPanel';
import { DatePicker } from '@/components/ui/date-picker';

const Dashboard: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [selectedKpi, setSelectedKpi] = useState<string>('electricity_production_mwh');
  const [selectedView, setSelectedView] = useState<string>('production');
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(1))); // First day of current month
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showExport, setShowExport] = useState(false);
  const [showDualYAxis, setShowDualYAxis] = useState(true);
  
  // Use custom hook to fetch dashboard data with the right parameters
  const { 
    chartData: dashboardData, 
    loading: isLoading, 
    sites,
    // Production metrics
    totalElectricityProduction,
    electricityChange,
    totalHeatProduction,
    heatChange,
    // Performance metrics
    avgEfficiency,
    efficiencyChange,
    avgAvailability,
    availabilityChange,
    // Input metrics
    totalFuelConsumption,
    fuelChange,
    // Environmental metrics
    totalCo2,
    co2Change,
    // Financial metrics
    totalCost,
    costChange,
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

  const handleViewChange = (view: string) => {
    setSelectedView(view);
    
    // Set appropriate default KPI based on view
    switch (view) {
      case 'production':
        setSelectedKpi('electricity_production_mwh');
        setShowDualYAxis(true);
        break;
      case 'performance':
        setSelectedKpi('efficiency_percent');
        setShowDualYAxis(true);
        break;
      case 'consumption':
        setSelectedKpi('fuel_consumption_mwh');
        setShowDualYAxis(false);
        break;
      case 'environmental':
        setSelectedKpi('co2');
        setShowDualYAxis(false);
        break;
    }
  };
  
  const toggleExportPanel = () => {
    setShowExport(!showExport);
  };
  
  // Define dataKeys for the chart based on selected view
  const getDataKeys = () => {
    switch (selectedView) {
      case 'production':
        return [
          { key: 'electricity_production_mwh', color: '#3b82f6', name: 'Electricity Production (MWh)', yAxisId: "left" },
          { key: 'heat_production_mwh', color: '#ef4444', name: 'Heat Production (MWh)', yAxisId: "left" },
          { key: 'efficiency_percent', color: '#10b981', name: 'Efficiency (%)', yAxisId: "right" },
        ];
      case 'performance':
        return [
          { key: 'efficiency_percent', color: '#10b981', name: 'Efficiency (%)', yAxisId: "right" },
          { key: 'availability_percent', color: '#8b5cf6', name: 'Availability (%)', yAxisId: "right" },
        ];
      case 'consumption':
        return [
          { key: 'fuel_consumption_mwh', color: '#f59e0b', name: 'Fuel Consumption (MWh)', yAxisId: "left" },
          { key: 'cost_eur', color: '#9333ea', name: 'Cost (EUR)', yAxisId: "left" },
        ];
      case 'environmental':
        return [
          { key: 'co2', color: '#64748b', name: 'CO₂ Emissions (kg)', yAxisId: "left" },
          { key: 'electricity_production_mwh', color: '#3b82f6', name: 'Electricity Production (MWh)', yAxisId: "left" },
        ];
      default:
        return [
          { key: 'electricity_production_mwh', color: '#3b82f6', name: 'Electricity Production (MWh)', yAxisId: "left" },
          { key: 'heat_production_mwh', color: '#ef4444', name: 'Heat Production (MWh)', yAxisId: "left" },
        ];
    }
  };

  // Check if we have data
  const hasData = dashboardData && dashboardData.length > 0;
  
  return (
    <div className="container mx-auto py-6 px-2 md:px-4 lg:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">ENGIE Energy Dashboard</h1>
          <p className="text-gray-500">Production Site Performance Monitoring</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 w-full md:w-auto">
          <Select
            value={selectedSite}
            onValueChange={handleSiteChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select a site" />
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
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Current month</SelectItem>
              <SelectItem value="quarter">Current quarter</SelectItem>
              <SelectItem value="year">Current year</SelectItem>
              <SelectItem value="custom">Custom period</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedPeriod === 'custom' && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <Label>Start date</Label>
            <DatePicker
              selected={startDate}
              onSelect={setStartDate}
              maxDate={new Date()}
            />
          </div>
          <div>
            <Label>End date</Label>
            <DatePicker
              selected={endDate}
              onSelect={setEndDate}
              maxDate={new Date()}
              minDate={startDate}
            />
          </div>
        </div>
      )}
      
      {/* View selector tabs */}
      <div className="mb-6">
        <Tabs value={selectedView} onValueChange={handleViewChange}>
          <TabsList className="w-full border-b">
            <TabsTrigger value="production">
              Production
            </TabsTrigger>
            <TabsTrigger value="performance">
              Performance
            </TabsTrigger>
            <TabsTrigger value="consumption">
              Consumption
            </TabsTrigger>
            <TabsTrigger value="environmental">
              Environmental Impact
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* KPI Cards based on selected view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {selectedView === 'production' && (
          <>
            <KpiCard
              title="Electricity Production"
              value={totalElectricityProduction.toLocaleString(undefined, {maximumFractionDigits: 1})}
              unit="MWh"
              change={electricityChange}
              icon={<Wind className="h-5 w-5" />}
              onClick={() => handleKpiSelect('electricity_production_mwh')}
              isActive={selectedKpi === 'electricity_production_mwh'}
              inverseChange={true} // For production, positive change is good
            />
            
            <KpiCard
              title="Heat Production"
              value={totalHeatProduction.toLocaleString(undefined, {maximumFractionDigits: 1})}
              unit="MWh"
              change={heatChange}
              icon={<Flame className="h-5 w-5" />}
              onClick={() => handleKpiSelect('heat_production_mwh')}
              isActive={selectedKpi === 'heat_production_mwh'}
              inverseChange={true} // For production, positive change is good
            />
            
            <KpiCard
              title="Overall Efficiency"
              value={avgEfficiency.toLocaleString(undefined, {maximumFractionDigits: 1})}
              unit="%"
              change={efficiencyChange}
              icon={<Gauge className="h-5 w-5" />}
              onClick={() => handleKpiSelect('efficiency_percent')}
              isActive={selectedKpi === 'efficiency_percent'}
              valueColor="text-green-600"
              inverseChange={true} // For efficiency, positive change is good
            />
          </>
        )}
        
        {selectedView === 'performance' && (
          <>
            <KpiCard
              title="Overall Efficiency"
              value={avgEfficiency.toLocaleString(undefined, {maximumFractionDigits: 1})}
              unit="%"
              change={efficiencyChange}
              icon={<Gauge className="h-5 w-5" />}
              onClick={() => handleKpiSelect('efficiency_percent')}
              isActive={selectedKpi === 'efficiency_percent'}
              valueColor="text-green-600"
              inverseChange={true}
            />
            
            <KpiCard
              title="Availability"
              value={avgAvailability.toLocaleString(undefined, {maximumFractionDigits: 1})}
              unit="%"
              change={availabilityChange}
              icon={<TrendingUp className="h-5 w-5" />}
              onClick={() => handleKpiSelect('availability_percent')}
              isActive={selectedKpi === 'availability_percent'}
              valueColor="text-purple-600"
              inverseChange={true}
            />
            
            <KpiCard
              title="Operational Cost"
              value={totalCost.toLocaleString(undefined, {maximumFractionDigits: 1})}
              unit="EUR"
              change={costChange}
              icon={<PieChartIcon className="h-5 w-5" />}
              onClick={() => handleKpiSelect('cost_eur')}
              isActive={selectedKpi === 'cost_eur'}
            />
          </>
        )}
        
        {selectedView === 'consumption' && (
          <>
            <KpiCard
              title="Fuel Consumption"
              value={totalFuelConsumption.toLocaleString(undefined, {maximumFractionDigits: 1})}
              unit="MWh"
              change={fuelChange}
              icon={<Fuel className="h-5 w-5" />}
              onClick={() => handleKpiSelect('fuel_consumption_mwh')}
              isActive={selectedKpi === 'fuel_consumption_mwh'}
            />
            
            <KpiCard
              title="Operational Cost"
              value={totalCost.toLocaleString(undefined, {maximumFractionDigits: 1})}
              unit="EUR"
              change={costChange}
              icon={<PieChartIcon className="h-5 w-5" />}
              onClick={() => handleKpiSelect('cost_eur')}
              isActive={selectedKpi === 'cost_eur'}
            />
            
            <KpiCard
              title="Total Production"
              value={(totalElectricityProduction + totalHeatProduction).toLocaleString(undefined, {maximumFractionDigits: 1})}
              unit="MWh"
              change={(electricityChange + heatChange) / 2} // Average of both changes
              icon={<Zap className="h-5 w-5" />}
              inverseChange={true} // For production, positive change is good
            />
          </>
        )}
        
        {selectedView === 'environmental' && (
          <>
            <KpiCard
              title="CO₂ Emissions"
              value={totalCo2.toLocaleString(undefined, {maximumFractionDigits: 1})}
              unit="kg"
              change={co2Change}
              icon={<TrendingDown className="h-5 w-5" />}
              onClick={() => handleKpiSelect('co2')}
              isActive={selectedKpi === 'co2'}
            />
            
            <KpiCard
              title="CO₂ per MWh"
              value={totalElectricityProduction > 0 ? 
                (totalCo2 / totalElectricityProduction).toLocaleString(undefined, {maximumFractionDigits: 1}) : 0}
              unit="kg/MWh"
              change={totalElectricityProduction > 0 && electricityChange !== 0 ? 
                co2Change - electricityChange : 0}
              icon={<LineChartIcon className="h-5 w-5" />}
            />
            
            <KpiCard
              title="Renewable Production"
              value={selectedSite === '2' ? 
                totalElectricityProduction.toLocaleString(undefined, {maximumFractionDigits: 1}) : 0}
              unit="MWh"
              change={selectedSite === '2' ? electricityChange : 0}
              icon={<Wind className="h-5 w-5" />}
              valueColor="text-green-600"
              inverseChange={true} // For renewable production, positive change is good
            />
          </>
        )}
      </div>
      
      {/* Tabs for different views */}
      <Tabs defaultValue="chart">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" onClick={toggleExportPanel}>
            <Download className="w-4 h-4 mr-2" />
            Export data
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
                <h3 className="text-xl font-medium mb-2">No data available</h3>
                <p className="text-center text-gray-600">
                  {selectedSite !== 'all' 
                    ? `No data available for the selected site and period.` 
                    : `No data available for the selected period.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Main chart */
            <TrendLineChart 
              data={dashboardData} 
              dataKeys={getDataKeys()}
              focusMetric={selectedKpi}
              title={selectedView === 'production' ? "Production and efficiency" : 
                     selectedView === 'performance' ? "Performance indicators" : 
                     selectedView === 'consumption' ? "Consumption and costs" : 
                     "Environmental impact"}
              dualYAxis={showDualYAxis}
            />
          )}
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed data</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Detailed data will be displayed here as a table.</p>
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
