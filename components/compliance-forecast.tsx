"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";

interface Inspection {
  expirationDate: Date | null;
  unitIdentifier: string;
}

interface ComplianceForecastProps {
  inspections: Inspection[];
  totalUnits: number;
  currentCompliant: number;
}

export function ComplianceForecast({ 
  inspections, 
  totalUnits, 
  currentCompliant 
}: ComplianceForecastProps) {
  const forecastData = useMemo(() => {
    const now = new Date();
    const data: { date: string; compliant: number; expiring: string[] }[] = [];
    
    // Generate data for next 90 days
    for (let i = 0; i <= 90; i += 7) { // Weekly intervals
      const targetDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = targetDate.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      });
      
      // Count how many will expire by this date
      const expiredByDate = inspections.filter(insp => {
        if (!insp.expirationDate) return true; // No expiration = not compliant
        return new Date(insp.expirationDate) < targetDate;
      });
      
      const stillCompliant = totalUnits - expiredByDate.length;
      const expiringUnits = expiredByDate.map(e => e.unitIdentifier);
      
      data.push({
        date: dateStr,
        compliant: Math.max(0, stillCompliant),
        expiring: expiringUnits,
      });
    }
    
    return data;
  }, [inspections, totalUnits]);

  // Calculate trend
  const startCompliant = forecastData[0]?.compliant ?? 0;
  const endCompliant = forecastData[forecastData.length - 1]?.compliant ?? 0;
  const trend = endCompliant - startCompliant;
  const trendPercent = startCompliant > 0 
    ? Math.round((trend / startCompliant) * 100) 
    : 0;

  // Find units expiring soon
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringSoon = inspections.filter(insp => {
    if (!insp.expirationDate) return false;
    const exp = new Date(insp.expirationDate);
    return exp > now && exp <= thirtyDaysFromNow;
  });

  if (totalUnits === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Calendar className="h-5 w-5 text-brand-500" />
            Compliance Forecast
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Projected compliance over the next 90 days
          </p>
        </div>
        
        {trend !== 0 && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            trend < 0 
              ? "bg-red-100 text-red-700" 
              : "bg-green-100 text-green-700"
          }`}>
            {trend < 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            {Math.abs(trendPercent)}%
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompliant" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              domain={[0, totalUnits]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [`${value ?? 0} units`, "Compliant"]}
            />
            <Area
              type="monotone"
              dataKey="compliant"
              stroke="#4f46e5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCompliant)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-amber-800">
                {expiringSoon.length} unit{expiringSoon.length !== 1 ? "s" : ""} expiring in next 30 days
              </p>
              <p className="text-sm text-amber-600 mt-1">
                {expiringSoon.slice(0, 3).map(e => e.unitIdentifier).join(", ")}
                {expiringSoon.length > 3 && ` and ${expiringSoon.length - 3} more`}
              </p>
            </div>
            <Link
              href="/app/compliance"
              className="flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
