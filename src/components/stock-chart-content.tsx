"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

interface ChartDataPoint {
  date: string
  close: number
}

interface StockChartContentProps {
  data: ChartDataPoint[]
}

export default function StockChartContent({ data }: StockChartContentProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            tick={{ fill: '#6B7280' }}
          />
          <YAxis 
            stroke="#6B7280"
            tick={{ fill: '#6B7280' }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '0.375rem',
              color: '#F3F4F6'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke="#3B82F6" 
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 