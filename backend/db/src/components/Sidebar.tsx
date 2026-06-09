"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  Building2,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/clients", icon: Users },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Services", href: "/services", icon: Package },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Serviceable City", href: "/city-services", icon: Building2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside
      className={clsx(
        "flex flex-col bg-sidebar text-white transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
        {!collapsed && (
          <span className="text-xl font-bold tracking-wide text-white">
            Admin<span className="text-indigo-400">Panel</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-sidebar-hover text-slate-400 hover:text-white transition"
        >
          <ChevronLeft
            size={20}
            className={clsx(
              "transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-sidebar-hover hover:text-white"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-sidebar-hover hover:text-white w-full transition-colors"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
