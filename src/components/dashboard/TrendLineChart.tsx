
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
  dataKeys: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  xAxisDataKey?: string;
  title?: string;
}

const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  dataKeys,
  xAxisDataKey = 'day',
  title
}) => {
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
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: any) => [`${value}`, '']}
              labelFormatter={(label) => formatXAxis(label)}
            />
            <Legend />
            
            {dataKeys.map((dataKey) => (
              <Line
                key={dataKey.key}
                type="monotone"
                dataKey={dataKey.key}
                name={dataKey.name}
                stroke={dataKey.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendLineChart;
