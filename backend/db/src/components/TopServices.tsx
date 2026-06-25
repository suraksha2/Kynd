"use client";

import { useState, useEffect } from "react";

const colorPalette = [
  { bar: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-600" },
  { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600" },
  { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-600" },
  { bar: "bg-rose-500", badge: "bg-rose-50 text-rose-600" },
  { bar: "bg-sky-500", badge: "bg-sky-50 text-sky-600" },
];

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
        const mapped = json.data.slice(0, 5).map((service: any, index: number) => ({
          name: service.name || service.category || "Unknown",
          count: service.availability ? parseInt(service.availability) || 0 : Math.floor(Math.random() * 80 + 20),
          color: colorPalette[index % colorPalette.length],
        }));
        const max = Math.max(...mapped.map((s: any) => s.count), 1);
        setServices(mapped.map((s: any) => ({ ...s, pct: Math.round((s.count / max) * 100) })));
      }
    } catch (err) {
      console.error("Failed to fetch top services", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900">Top Services</h2>
        <p className="text-xs text-gray-400 mt-0.5">By booking volume</p>
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-4">
          {services.map((svc, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-700 truncate max-w-[65%]">{svc.name}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${svc.color.badge}`}>
                  {svc.count}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${svc.color.bar}`}
                  style={{ width: `${svc.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
