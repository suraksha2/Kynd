"use client";

import { useState, useEffect } from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function TopServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopServices();
  }, []);

  async function fetchTopServices() {
    try {
      const res = await fetch("/api/services");
      const json = await res.json();
      if (json.data) {
        const mappedServices = json.data.slice(0, 4).map((service: any, index: number) => ({
          name: service.name || service.category || "Unknown",
          sales: service.availability ? parseInt(service.availability) || 0 : 0,
          fill: colors[index % colors.length],
        }));
        setServices(mappedServices);
      }
    } catch (err) {
      console.error("Failed to fetch top services", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Top Service Categories</h2>
        <div className="text-gray-500 text-sm">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-base font-semibold text-gray-800 mb-2">
        Top Service Categories
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="90%"
          data={services}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            dataKey="sales"
            label={{ position: "insideStart", fill: "#fff", fontSize: 11 }}
          />
          <Legend
            iconSize={10}
            layout="vertical"
            verticalAlign="bottom"
            align="center"
            formatter={(value) => (
              <span style={{ fontSize: 12, color: "#6b7280" }}>{value}</span>
            )}
          />
          <Tooltip
            formatter={(value: number) => [`${value} bookings`, ""]}
            contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
