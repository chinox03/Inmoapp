import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  sublabel?: string;
}

export interface LineChartDataPoint {
  label: string;
  values: { [key: string]: number };
}

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  valueFormatter?: (value: number) => string;
  showValues?: boolean;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  lines: { key: string; color: string; label: string }[];
  height?: number;
  valueFormatter?: (value: number) => string;
}

interface PieChartProps {
  data: ChartDataPoint[];
  size?: number;
  valueFormatter?: (value: number) => string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface HeatmapProps {
  data: { row: string; col: string; value: number }[];
  rows: string[];
  cols: string[];
  valueFormatter?: (value: number) => string;
  colorScale?: (value: number, max: number) => string;
}

export function BarChart({ data, height = 300, valueFormatter = (v) => v.toString(), showValues = true }: BarChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const chartHeight = height - 60;

  return (
    <div className="w-full">
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-end justify-around gap-2 px-4 pb-16">
          {data.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100;
            const barHeight = (heightPercent / 100) * chartHeight;
            const color = item.color || 'bg-blue-500';

            return (
              <div key={index} className="flex flex-col items-center justify-end flex-1 min-w-0">
                {showValues && (
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {valueFormatter(item.value)}
                  </span>
                )}
                <div
                  className={`w-full max-w-[60px] ${color} rounded-t-md transition-all duration-500 hover:opacity-80 cursor-pointer relative group`}
                  style={{ height: `${barHeight}px`, minHeight: '2px' }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {item.label}: {valueFormatter(item.value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-around gap-2 px-4">
        {data.map((item, index) => (
          <div key={index} className="text-center flex-1 min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">{item.label}</p>
            {item.sublabel && (
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{item.sublabel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({ data, lines, height = 300, valueFormatter = (v) => v.toString() }: LineChartProps) {
  if (data.length === 0) return null;

  const allValues = data.flatMap((d) => Object.values(d.values));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues, 0);
  const range = maxValue - minValue;

  const width = 100;
  const padding = 10;
  const chartWidth = width - 2 * padding;
  const stepX = chartWidth / (data.length - 1);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-4">
        {lines.map((line) => (
          <div key={line.key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: line.color }} />
            <span className="text-sm text-gray-700 dark:text-gray-300">{line.label}</span>
          </div>
        ))}
      </div>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            {lines.map((line) => (
              <linearGradient key={`gradient-${line.key}`} id={`gradient-${line.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={line.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={line.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {lines.map((line) => {
            const points = data.map((d, i) => {
              const x = padding + i * stepX;
              const y = height - padding - ((d.values[line.key] - minValue) / range) * (height - 2 * padding);
              return `${x},${y}`;
            }).join(' ');

            const areaPoints = `${padding},${height - padding} ${points} ${padding + (data.length - 1) * stepX},${height - padding}`;

            return (
              <g key={line.key}>
                <polygon points={areaPoints} fill={`url(#gradient-${line.key})`} />
                <polyline
                  points={points}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                {data.map((d, i) => {
                  const x = padding + i * stepX;
                  const y = height - padding - ((d.values[line.key] - minValue) / range) * (height - 2 * padding);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={line.color}
                      className="hover:r-5 transition-all cursor-pointer"
                    >
                      <title>{`${d.label}: ${valueFormatter(d.values[line.key])}`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between mt-4 px-2">
        {data.map((item, index) => (
          <span key={index} className="text-xs text-gray-600 dark:text-gray-400">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PieChart({ data, size = 200, valueFormatter = (v) => v.toString() }: PieChartProps) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 100 + 90 * Math.cos(startRad);
    const y1 = 100 + 90 * Math.sin(startRad);
    const x2 = 100 + 90 * Math.cos(endRad);
    const y2 = 100 + 90 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...item,
      percentage,
      path: `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      <svg width={size} height={size} viewBox="0 0 200 200" className="flex-shrink-0">
        {slices.map((slice, index) => (
          <g key={index} className="cursor-pointer hover:opacity-80 transition-opacity">
            <path
              d={slice.path}
              fill={slice.color || `hsl(${index * (360 / data.length)}, 70%, 60%)`}
            >
              <title>{`${slice.label}: ${valueFormatter(slice.value)} (${slice.percentage.toFixed(1)}%)`}</title>
            </path>
          </g>
        ))}
      </svg>
      <div className="flex flex-col gap-2">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: slice.color || `hsl(${index * (360 / data.length)}, 70%, 60%)` }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{slice.label}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {valueFormatter(slice.value)} ({slice.percentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricCard({ title, value, change, changeLabel, icon, color = 'blue' }: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
              {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
              <span
                className={`text-sm font-medium ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}{change}%
              </span>
              {changeLabel && <span className="text-sm text-gray-600 dark:text-gray-400">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function Heatmap({ data, rows, cols, valueFormatter = (v) => v.toString(), colorScale }: HeatmapProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  const defaultColorScale = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity > 0.8) return 'bg-red-500';
    if (intensity > 0.6) return 'bg-orange-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.2) return 'bg-blue-500';
    return 'bg-gray-300 dark:bg-gray-600';
  };

  const getColorScale = colorScale || defaultColorScale;

  const getValue = (row: string, col: string) => {
    const item = data.find((d) => d.row === row && d.col === col);
    return item?.value || 0;
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${cols.length}, 1fr)` }}>
          <div></div>
          {cols.map((col) => (
            <div key={col} className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center p-2">
              {col}
            </div>
          ))}
          {rows.map((row) => (
            <React.Fragment key={row}>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center p-2">
                {row}
              </div>
              {cols.map((col) => {
                const value = getValue(row, col);
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`${getColorScale(value, maxValue)} rounded p-2 flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:scale-105 transition-transform`}
                    title={`${row} - ${col}: ${valueFormatter(value)}`}
                  >
                    {valueFormatter(value)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
