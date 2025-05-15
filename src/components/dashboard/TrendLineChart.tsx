
import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { dateUtils } from '../../utils/validation';

interface TrendLineChartProps {
  data: Array<{
    day: string;
    [key: string]: any;
  }>;
  dataKeys?: Array<{
    key: string;
    color: string;
    name: string;
    yAxisId?: string;
  }>;
  xAxisDataKey?: string;
  title?: string;
  focusMetric?: string;
  dualYAxis?: boolean;
}

const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  dataKeys,
  xAxisDataKey = 'day',
  title,
  focusMetric,
  dualYAxis = false
}) => {
  // Default dataKeys if not provided
  const chartDataKeys = dataKeys || [
    { key: 'fuel_consumption_mwh', color: '#f59e0b', name: 'Consommation (MWh)', yAxisId: "left" },
    { key: 'electricity_production_mwh', color: '#3b82f6', name: 'Production Électricité (MWh)', yAxisId: "left" },
    { key: 'heat_production_mwh', color: '#ef4444', name: 'Production Chaleur (MWh)', yAxisId: "left" },
    { key: 'efficiency_percent', color: '#10b981', name: 'Rendement (%)', yAxisId: "right" },
  ];
  
  // Format X-axis tick values for date strings
  const formatXAxis = (value: string) => {
    if (!value) return '';
    return dateUtils.formatDisplay(value);
  };
  
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm ring-1 ring-dark/10">
      {title && (
        <h3 className="text-lg font-medium text-dark mb-4">{title}</h3>
      )}
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey={xAxisDataKey} 
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
              angle={-15}
              textAnchor="end"
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }} 
              label={{ value: 'MWh', angle: -90, position: 'insideLeft' }}
            />
            {dualYAxis && (
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                label={{ value: '%', angle: 90, position: 'insideRight' }}
              />
            )}
            <Tooltip 
              formatter={(value: any, name: string) => {
                // Add % symbol to efficiency and availability values
                if (name.includes('Rendement') || name.includes('Disponibilité')) {
                  return [`${value}%`, name];
                }
                return [`${value}`, name];
              }}
              labelFormatter={(label) => formatXAxis(label)}
            />
            <Legend />
            
            {chartDataKeys.map((dataKey) => (
              <Line
                key={dataKey.key}
                type="monotone"
                dataKey={dataKey.key}
                name={dataKey.name}
                stroke={dataKey.color}
                strokeWidth={focusMetric === dataKey.key ? 3 : 2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                opacity={focusMetric && focusMetric !== dataKey.key ? 0.3 : 1}
                yAxisId={dataKey.yAxisId || "left"}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendLineChart;
