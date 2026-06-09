"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  async function fetchRevenueData() {
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch revenue data", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Revenue Overview</h2>
        <div className="text-gray-500 text-sm">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        Revenue Overview
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#revenueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
