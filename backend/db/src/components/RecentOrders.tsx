"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";

const statusStyles: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default function RecentOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (json.data) {
        // Map database fields to component format
        const mappedOrders = json.data.slice(0, 5).map((order: any) => ({
          id: `#ORD-${order.id}`,
          customer: order.clientName || "Unknown",
          service: order.serviceName || "Unknown",
          amount: `$${order.amount}`,
          status: order.status,
          date: order.date ? new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A",
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-gray-500 text-sm">Loading orders...</div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Recent Orders</h2>
        <a href="/orders" className="text-sm text-indigo-600 hover:underline font-medium">
          View all
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              {["Order ID", "Customer", "Service", "Amount", "Status", "Date"].map((h) => (
                <th key={h} className="px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3 font-medium text-indigo-600">
                  <Link href={`/orders/${order.id.replace("#", "")}`} className="hover:underline">
                    {order.id}
                  </Link>
                </td>
                <td className="px-5 py-3 text-gray-700">{order.customer}</td>
                <td className="px-5 py-3 text-gray-600">{order.service}</td>
                <td className="px-5 py-3 font-semibold text-gray-800">{order.amount}</td>
                <td className="px-5 py-3">
                  <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-medium", statusStyles[order.status])}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
