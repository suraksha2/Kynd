"use client";

import { useState, useEffect } from "react";
import { Search, MoreVertical, Eye } from "lucide-react";
import clsx from "clsx";

const statusStyles: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Confirmed: "bg-indigo-100 text-indigo-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Upcoming: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-600",
};

const tabs = ["All Bookings", "Upcoming", "Completed", "Cancelled"];
const filterStatuses = ["All Status", "Completed", "Confirmed", "Pending", "Upcoming", "Cancelled"];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [loading, setLoading] = useState(true);
  const [filterServices, setFilterServices] = useState<string[]>(["All Services"]);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (json.data) {
        // Map database fields to component format
        const mappedBookings = json.data.map((order: any) => {
          // Parse items JSON to get service information
          let serviceName = "Unknown";
          let serviceCategory = "General";
          try {
            if (order.items) {
              const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              if (Array.isArray(items) && items.length > 0) {
                serviceName = items[0].name || "Unknown";
                serviceCategory = items[0].category || "General";
              }
            }
          } catch (e) {
            console.error("Failed to parse items", e);
          }

          // Format status to match expected values
          let status = order.status || "Pending";
          if (status === 'upcoming') status = "Upcoming";
          else if (status === 'completed') status = "Completed";
          else if (status === 'cancelled') status = "Cancelled";

          return {
            id: `#BK${order.booking_id || order.id}`,
            consumer: { name: order.clientName || "Unknown", phone: order.clientMobile || "N/A" },
            service: { main: serviceName, sub: serviceCategory },
            partner: { name: "Service Provider", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.5 },
            date: order.date ? new Date(order.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : "N/A",
            address: order.address || `${order.city || "N/A"}`,
            amount: order.amount || 0,
            status: status,
          };
        });
        setBookings(mappedBookings);

        // Extract unique services for filter
        const uniqueServices = ["All Services", ...new Set(mappedBookings.map((b: any) => b.service.main).filter(Boolean))];
        setFilterServices(uniqueServices);
      }
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.consumer.name.toLowerCase().includes(search.toLowerCase()) ||
      b.consumer.phone.includes(search) ||
      b.service.main.toLowerCase().includes(search.toLowerCase()) ||
      b.service.sub.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || b.status === statusFilter;
    const matchService = serviceFilter === "All Services" || b.service.main === serviceFilter;
    // Tab filter
    let matchTab = true;
    if (activeTab === 1) matchTab = b.status === "Upcoming";
    else if (activeTab === 2) matchTab = b.status === "Completed";
    else if (activeTab === 3) matchTab = b.status === "Cancelled";
    return matchSearch && matchStatus && matchService && matchTab;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-gray-500 text-sm">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={clsx(
              "pb-3 px-1 text-base font-semibold border-b-2 transition",
              activeTab === i
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-gray-500 hover:text-indigo-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by Booking ID, Consumer or Service"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-80 shadow-sm bg-white"
            style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill=\\'gray\\' height=\\'16\\' viewBox=\\'0 0 24 24\\' width=\\'16\\' xmlns=\\'http://www.w3.org/2000/svg\\'><path d=\\'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z\\'/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: '10px center' }}
          />
          <select
            className="border border-gray-200 rounded-xl px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {filterStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="border border-gray-200 rounded-xl px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm bg-white"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            {filterServices.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition">Export</button>
        </div>
        <div className="flex gap-3">
          {/* Date picker placeholder */}
          <input type="text" className="border border-gray-200 rounded-xl px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm bg-white" value="May 15, 2024 - Jun 13, 2024" readOnly />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col gap-2">
          <div className="text-xs text-gray-500 font-medium">Total Bookings</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{bookings.length}</span>
            <span className="ml-auto text-green-600 text-xs font-semibold">Total</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col gap-2">
          <div className="text-xs text-gray-500 font-medium">Pending</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'Pending').length}</span>
            <span className="ml-auto text-yellow-600 text-xs font-semibold">Pending</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col gap-2">
          <div className="text-xs text-gray-500 font-medium">Completed</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'Completed').length}</span>
            <span className="ml-auto text-green-600 text-xs font-semibold">Completed</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col gap-2">
          <div className="text-xs text-gray-500 font-medium">Cancelled</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'Cancelled').length}</span>
            <span className="ml-auto text-red-600 text-xs font-semibold">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-x-auto mt-2">
        <table className="w-full text-base">
          <thead>
            <tr className="text-left text-gray-600 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-emerald-50">
              {[
                "Booking ID",
                "Consumer",
                "Service",
                "Partner",
                "Date & Time",
                "Address",
                "Amount",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-6 py-4 font-bold tracking-wide whitespace-nowrap text-lg">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-gray-100 hover:bg-indigo-50/60 transition group">
                <td className="px-6 py-4 font-semibold text-indigo-700 whitespace-nowrap">{b.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{b.consumer.name}</span>
                    <span className="text-xs text-gray-400">{b.consumer.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-semibold text-gray-800">{b.service.main}</span>
                  <br />
                  <span className="text-xs text-gray-400">{b.service.sub}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <img src={b.partner.avatar} alt={b.partner.name} className="w-8 h-8 rounded-full border border-gray-200" />
                    <div>
                      <span className="font-semibold text-gray-900">{b.partner.name}</span>
                      <span className="ml-1 text-xs text-yellow-500">★ {b.partner.rating}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{b.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs text-gray-500">{b.address}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">₹ {b.amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold", statusStyles[b.status] || "bg-gray-100 text-gray-500 border border-gray-200")}>{b.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 transition" title="View">
                      <Eye size={18} className="text-indigo-500" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition" title="More">
                      <MoreVertical size={18} className="text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10">No bookings found.</p>
        )}
      </div>
    </div>
  );
}
