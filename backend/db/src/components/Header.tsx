"use client";

import { Bell, Search, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Customers",
  "/orders": "Orders",
  "/services": "Services",
  "/analytics": "Analytics",
  "/city-services": "Serviceable City",
  "/settings": "Settings",
};

const pageSubs: Record<string, string> = {
  "/dashboard": "Welcome back, here's what's happening today.",
  "/clients": "Manage your customers.",
  "/orders": "View and manage orders.",
  "/services": "Manage available services.",
  "/analytics": "Track your performance.",
  "/city-services": "Manage serviceable cities.",
  "/settings": "Configure your preferences.",
};

export default function Header() {
  const pathname = usePathname();
  const title =
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ?? "Admin Panel";
  const sub =
    Object.entries(pageSubs).find(([key]) => pathname.startsWith(key))?.[1] ?? "";

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-[15px] font-semibold text-gray-900 leading-tight">{title}</h1>
        {sub && <p className="text-xs text-gray-400 leading-tight mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:block mr-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-8 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 w-56 placeholder:text-gray-400 transition"
          />
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl hover:bg-gray-50 transition group">
          <Bell size={17} className="text-gray-500 group-hover:text-gray-700 transition" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Avatar */}
        <button className="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl px-2.5 py-1.5 transition group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-300/50">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
          <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
