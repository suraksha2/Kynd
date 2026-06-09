"use client";

import { Bell, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clients",
  "/orders": "Orders",
  "/services": "Services",
  "/analytics": "Analytics",
  "/city-services": "Serviceable City",
  "/settings": "Settings",
};

export default function Header() {
  const pathname = usePathname();
  const title =
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ??
    "Admin Panel";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
          />
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <button className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 transition">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            Admin
          </span>
        </button>
      </div>
    </header>
  );
}
