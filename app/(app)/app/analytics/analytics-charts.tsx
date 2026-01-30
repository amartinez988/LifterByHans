"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DailyData {
  date: string;
  jobs: number;
  maintenance: number;
  emergency: number;
}

interface MechanicData {
  name: string;
  completed: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface PriorityData {
  name: string;
  value: number;
}

interface AnalyticsChartsProps {
  dailyData: DailyData[];
  mechanicPerformance: MechanicData[];
  statusData: StatusData[];
  priorityData: PriorityData[];
}

const COLORS = {
  brand: "#4f46e5",
  accent: "#0891b2",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  slate: "#64748b",
};

const STATUS_COLORS: Record<string, string> = {
  "SCHEDULED": COLORS.brand,
  "EN ROUTE": COLORS.warning,
  "ON SITE": COLORS.accent,
  "COMPLETED": COLORS.success,
  "CANCELLED": COLORS.slate,
};

const PRIORITY_COLORS: Record<string, string> = {
  "LOW": COLORS.slate,
  "NORMAL": COLORS.brand,
  "HIGH": COLORS.warning,
  "URGENT": COLORS.danger,
};

export function AnalyticsCharts({
  dailyData,
  mechanicPerformance,
  statusData,
  priorityData,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-8">
      {/* Activity Trend Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-slate-900">
          Activity Trend (Last 30 Days)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="jobs"
                stroke={COLORS.brand}
                strokeWidth={2}
                dot={false}
                name="Jobs"
              />
              <Line
                type="monotone"
                dataKey="maintenance"
                stroke={COLORS.accent}
                strokeWidth={2}
                dot={false}
                name="Maintenance"
              />
              <Line
                type="monotone"
                dataKey="emergency"
                stroke={COLORS.danger}
                strokeWidth={2}
                dot={false}
                name="Emergency Calls"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mechanic Performance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-slate-900">
            Mechanic Performance (This Month)
          </h3>
          {mechanicPerformance.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mechanicPerformance}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar
                    dataKey="completed"
                    fill={COLORS.brand}
                    radius={[0, 4, 4, 0]}
                    name="Jobs Completed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center text-slate-500">
              No mechanic performance data available
            </div>
          )}
        </div>

        {/* Job Status Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-slate-900">
            Job Status Distribution
          </h3>
          {statusData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || COLORS.slate}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center text-slate-500">
              No job status data available
            </div>
          )}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-slate-900">
          Jobs by Priority
        </h3>
        {priorityData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Jobs">
                  {priorityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PRIORITY_COLORS[entry.name] || COLORS.slate}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">
            No priority data available
          </div>
        )}
      </div>
    </div>
  );
}
