"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import RevenueChart from "@/components/RevenueChart";
import RecentOrders from "@/components/RecentOrders";
import TopServices from "@/components/TopServices";
import { Users, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Zap } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalClients: 0,
    totalOrders: 0,
    growthRate: 0,
    todayOrders: 0,
    reprocessingToday: 0,
    processingToday: 0,
    pendingToday: 0,
    completedTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  }

  const mainStats = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: "12.5%",
      positive: true,
      icon: DollarSign,
      color: "bg-indigo-500",
      href: "/analytics",
    },
    {
      title: "Total Clients",
      value: stats.totalClients.toLocaleString(),
      change: "8.2%",
      positive: true,
      icon: Users,
      color: "bg-emerald-500",
      href: "/clients",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: "3.1%",
      positive: false,
      icon: ShoppingCart,
      color: "bg-orange-500",
      href: "/orders",
    },
    {
      title: "Growth Rate",
      value: `${stats.growthRate.toFixed(1)}%`,
      change: "4.6%",
      positive: stats.growthRate >= 0,
      icon: TrendingUp,
      color: "bg-pink-500",
      href: "/analytics",
    },
  ];

  const orderStatsCards = [
    {
      title: "Today Orders",
      value: stats.todayOrders.toString(),
      change: "0%",
      positive: true,
      icon: ShoppingCart,
      color: "bg-blue-500",
      href: "/orders",
    },
    {
      title: "Today Reprocessing",
      value: stats.reprocessingToday.toString(),
      change: "0%",
      positive: true,
      icon: Zap,
      color: "bg-purple-500",
      href: "/orders",
    },
    {
      title: "Today Processing",
      value: stats.processingToday.toString(),
      change: "0%",
      positive: true,
      icon: Clock,
      color: "bg-amber-500",
      href: "/orders",
    },
    {
      title: "Today Pending",
      value: stats.pendingToday.toString(),
      change: "0%",
      positive: true,
      icon: AlertCircle,
      color: "bg-red-500",
      href: "/orders",
    },
    {
      title: "Completed Orders",
      value: stats.completedTotal.toString(),
      change: "0%",
      positive: true,
      icon: CheckCircle,
      color: "bg-green-500",
      href: "/orders",
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 py-10 px-2 sm:px-8">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500 text-lg">Loading dashboard...</div>
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-100 rounded-2xl shadow-md">
            <TrendingUp size={32} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Urban Service Dashboard</h1>
            <p className="text-lg text-gray-500 mt-1">Get a complete overview of your business performance and growth</p>
          </div>
        </div>
      </div>

      {/* Main Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {mainStats.map((stat) => (
          <div className="transition-transform hover:scale-[1.03]">
            <StatCard key={stat.title} {...stat} />
          </div>
        ))}
      </div>

      {/* Order Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {orderStatsCards.map((stat) => (
          <div className="transition-transform hover:scale-[1.03]">
            <StatCard key={stat.title} {...stat} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white/80 rounded-3xl shadow-lg p-6 border border-gray-100">
          <RevenueChart />
        </div>
        <div className="bg-white/80 rounded-3xl shadow-lg p-6 border border-gray-100">
          <TopServices />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/80 rounded-3xl shadow-lg p-6 border border-gray-100">
        <RecentOrders />
      </div>
      </>
      )}
    </div>
  );
}
