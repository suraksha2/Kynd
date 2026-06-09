"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgOrderValue: 0,
    conversionRate: 0,
    bounceRate: 0,
    activeSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/orders"),
      ]);

      const analyticsJson = await analyticsRes.json();
      const ordersJson = await ordersRes.json();

      if (analyticsJson.data) {
        setMonthlyData(analyticsJson.data);
      }

      if (ordersJson.data) {
        // Calculate orders by month for bar chart
        const ordersByMonth: Record<string, { orders: number; revenue: number }> = {};
        ordersJson.data.forEach((order: any) => {
          const month = new Date(order.date).toLocaleString('default', { month: 'short' });
          if (!ordersByMonth[month]) {
            ordersByMonth[month] = { orders: 0, revenue: 0 };
          }
          ordersByMonth[month].orders += 1;
          ordersByMonth[month].revenue += order.amount || 0;
        });

        const monthlyChartData = Object.entries(ordersByMonth).map(([month, data]) => ({
          month,
          orders: data.orders,
          revenue: data.revenue,
        }));
        setMonthlyData(monthlyChartData);

        // Calculate category data from services
        const categoryCount: Record<string, number> = {};
        ordersJson.data.forEach((order: any) => {
          const category = order.serviceCategory || "Other";
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const totalOrders = ordersJson.data.length;
        const categoryChartData = Object.entries(categoryCount).map(([name, value]) => ({
          name,
          value: Math.round((value / totalOrders) * 100),
        }));
        setCategoryData(categoryChartData);

        // Calculate stats
        const totalRevenue = ordersJson.data.reduce((sum: number, order: any) => sum + (order.amount || 0), 0);
        setStats({
          avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
          conversionRate: 3.6,
          bounceRate: 28.4,
          activeSessions: 142,
        });
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-gray-500 text-sm">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Avg. Order Value", value: `$${stats.avgOrderValue}` },
          { label: "Conversion Rate", value: `${stats.conversionRate}%` },
          { label: "Bounce Rate", value: `${stats.bounceRate}%` },
          { label: "Active Sessions", value: stats.activeSessions },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-indigo-600">{item.value}</p>
            <p className="text-sm text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Orders</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
              <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, ""]}
                contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
              />
              <Legend
                formatter={(value) => <span style={{ fontSize: 12, color: "#6b7280" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
