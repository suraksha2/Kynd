"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  completed:   { label: "Completed",  cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  upcoming:    { label: "Upcoming",   cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",          dot: "bg-blue-500" },
  cancelled:   { label: "Cancelled",  cls: "bg-red-50 text-red-600 ring-1 ring-red-200",             dot: "bg-red-500" },
  Completed:   { label: "Completed",  cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  Pending:     { label: "Pending",    cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",       dot: "bg-amber-400" },
  Processing:  { label: "Processing", cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",          dot: "bg-blue-500" },
  Cancelled:   { label: "Cancelled",  cls: "bg-red-50 text-red-600 ring-1 ring-red-200",             dot: "bg-red-500" },
};

const avatarColors = [
  "bg-indigo-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-sky-500",
];

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

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
        const mappedOrders = json.data.slice(0, 6).map((order: any) => {
          // items can be a JSON string or already parsed array
          let serviceName = "—";
          try {
            const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
            if (Array.isArray(items) && items.length > 0) {
              serviceName = items.map((it: any) => it.name || it.serviceName || it.title || "Service").join(", ");
            }
          } catch {}
          return {
            id: order.booking_id ? `#${order.booking_id}` : `#ORD-${order.id}`,
            rawId: order.id,
            customer: order.clientName || order.contact_name || "Unknown",
            service: serviceName,
            amount: `S$${Number(order.amount || order.total || 0).toLocaleString()}`,
            status: order.status,
            date: (order.date || order.placed_at)
              ? new Date(order.date || order.placed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "N/A",
          };
        });
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">Latest transactions</p>
        </div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition"
        >
          View all <ArrowUpRight size={11} />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                {["Order", "Customer", "Service", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order, i) => {
                const st = statusConfig[order.status] ?? statusConfig[order.status?.toLowerCase()] ?? statusConfig["upcoming"];
                return (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition group">
                    <td className="px-3 py-3 font-semibold text-indigo-600 whitespace-nowrap">
                      <Link href={`/orders/${order.rawId}`} className="hover:text-indigo-800 transition">
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={clsx("w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0", avatarColors[i % avatarColors.length])}>
                          {getInitials(order.customer)}
                        </div>
                        <span className="text-gray-800 font-medium">{order.customer}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap max-w-[140px] truncate">{order.service}</td>
                    <td className="px-3 py-3 font-semibold text-gray-900 whitespace-nowrap">{order.amount}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={clsx("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold", st.cls)}>
                        <span className={clsx("w-1.5 h-1.5 rounded-full", st.dot)} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">{order.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
