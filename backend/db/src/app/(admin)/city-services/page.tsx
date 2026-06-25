"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, RefreshCw, Building2, MapPin } from "lucide-react";
import { CityRecord, CityService, CreateCityInput, CreateCityServiceInput, ServiceStatus } from "@/lib/types";
import ServiceFormModal from "@/components/ServiceFormModal";
import CityFormModal from "@/components/CityFormModal";
import AreasManagementModal from "@/components/AreasManagementModal";
import ModalPortal from "@/components/ModalPortal";

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// serviceCategoryId may be a single id, a JSON array of ids, or empty.
function parseCategoryIds(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v));
  } catch {
    // not JSON; treat as a single id
  }
  return [String(value)];
}

function resolveCategoryNames(
  serviceCategoryId: string | undefined,
  categories: { id: string; name: string }[]
): string[] {
  if (categories.length === 0) return [];
  const ids = parseCategoryIds(serviceCategoryId);
  return ids
    .map((id) => categories.find((c) => String(c.id) === id)?.name)
    .filter((n): n is string => Boolean(n));
}

export default function CityServicesPage() {
  const [services, setServices] = useState<CityService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "All">("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CityService | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [banningServiceId, setBanningServiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<CityRecord[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<CityRecord | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
  const [cityDeleteId, setCityDeleteId] = useState<string | null>(null);
  const [deletingCity, setDeletingCity] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [areasModalOpen, setAreasModalOpen] = useState(false);
  const [selectedCityForAreas, setSelectedCityForAreas] = useState<CityRecord | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/city-services");
      if (!res.ok) throw new Error("Failed to load services.");
      const json = await res.json();
      setServices(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCities = useCallback(async () => {
    setCitiesLoading(true);
    setCityError(null);
    try {
      const res = await fetch("/api/cities");
      if (!res.ok) throw new Error("Failed to load cities.");
      const json = await res.json();
      setCities(json.data);
    } catch (e) {
      setCityError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/service-categories");
      if (!res.ok) throw new Error("Failed to load categories.");
      const json = await res.json();
      setCategories(json.data || []);
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCities();
    fetchCategories();
  }, [fetchServices, fetchCities, fetchCategories]);

  async function handleSave(data: CreateCityServiceInput) {
    const url = editTarget
      ? `/api/city-services/${editTarget.id}`
      : "/api/city-services";
    const method = editTarget ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error ?? "Save failed.");
    }
    await fetchServices();
  }

  async function handleBanService(service: CityService) {
    if (service.status === "Suspended") {
      return;
    }

    setBanningServiceId(service.id);
    try {
      const res = await fetch(`/api/city-services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Suspended" }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to ban service.");
      }
      await fetchServices();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBanningServiceId(null);
    }
  }

  async function handleSaveCity(data: CreateCityInput) {
    const url = editingCity ? `/api/cities/${editingCity.id}` : "/api/cities";
    const method = editingCity ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error ?? "Save failed.");
    }
    await fetchCities();
  }

  async function handleDeleteCity(id: string) {
    setDeletingCity(true);
    try {
      const res = await fetch(`/api/cities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      setCityDeleteId(null);
      await fetchCities();
    } finally {
      setDeletingCity(false);
    }
  }

  const servicesByCityId = new Map<string, CityService[]>();
  for (const service of services) {
    if (!service.cityId) continue;
    const group = servicesByCityId.get(service.cityId) ?? [];
    group.push(service);
    servicesByCityId.set(service.cityId, group);
  }

  type TableRow = {
    key: string;
    cityName: string;
    pinCode: string;
    serviceName: string;
    serviceDescription: string;
    addedAt: string;
    kind: "service" | "city";
    service?: CityService;
    city?: CityRecord;
    services?: CityService[];
    status?: ServiceStatus;
  };

  const tableRows: TableRow[] = [];

  for (const city of cities) {
    const cityServices = servicesByCityId.get(city.id) ?? [];

    // Use areaCount from API if available, otherwise parse pinCode as fallback
    let pinCodeDisplay = city.pinCode;
    if (city.areaCount !== undefined) {
      pinCodeDisplay = `${city.areaCount} area(s)`;
    } else {
      try {
        const parsed = JSON.parse(city.pinCode);
        if (Array.isArray(parsed)) {
          pinCodeDisplay = `${parsed.length} area(s)`;
        }
      } catch {
        // Keep as is if not JSON
      }
    }

    if (cityServices.length === 0) {
      // Resolve one or more service category names from fetched categories
      const categoryNames = resolveCategoryNames(city.serviceCategoryId, categories);
      const serviceCategoryName = categoryNames.join(", ");
      tableRows.push({
        key: `city_${city.id}`,
        cityName: city.cityName,
        pinCode: pinCodeDisplay,
        serviceName: serviceCategoryName || "—",
        serviceDescription: categoryNames.length > 0
          ? `${categoryNames.length > 1 ? "Categories" : "Category"}: ${serviceCategoryName}`
          : "No services available",
        addedAt: city.createdAt,
        kind: "city",
        city,
      });
    } else {
      // For each city, show a single row with all services and statuses listed
      tableRows.push({
        key: `city_${city.id}`,
        cityName: city.cityName,
        pinCode: pinCodeDisplay,
        serviceName: cityServices.map(s => s.name).join(", "),
        serviceDescription: cityServices.map(s => `${s.name}: ${s.status}`).join(" | "),
        addedAt: city.createdAt,
        kind: "city",
        services: cityServices,
        status: cityServices[0]?.status,
        city,
        service: undefined,
      });
    }
  }

  for (const service of services) {
    if (service.cityId && cities.some((city) => city.id === service.cityId)) continue;
    tableRows.push({
      key: `service_unlinked_${service.id}`,
      cityName: "—",
      pinCode: "—",
      serviceName: service.name || "—",
      serviceDescription: service.description || "—",
      addedAt: service.createdAt,
      kind: "service",
      service,
    });
  }

  tableRows.sort((left, right) => {
    const leftTime = new Date(left.addedAt).getTime();
    const rightTime = new Date(right.addedAt).getTime();
    return rightTime - leftTime;
  });

  const filtered = tableRows.filter((row) => {
    const q = search.toLowerCase();
    const matchSearch =
      row.cityName.toLowerCase().includes(q) ||
      row.pinCode.toLowerCase().includes(q) ||
      row.serviceName.toLowerCase().includes(q) ||
      row.serviceDescription.toLowerCase().includes(q);
    const matchStatus =
      row.kind === "city" ? statusFilter === "All" : statusFilter === "All" || row.service?.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Status badge helper
  function StatusBadge({ status }: { status?: ServiceStatus | string }) {
    if (!status) return <span className="text-gray-300 text-xs">—</span>;
    const cfg: Record<string, { cls: string; dot: string }> = {
      Active:    { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
      Pending:   { cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",       dot: "bg-amber-400"  },
      Suspended: { cls: "bg-red-50 text-red-600 ring-1 ring-red-200",             dot: "bg-red-500"    },
      Completed: { cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",          dot: "bg-blue-500"   },
    };
    const s = cfg[status] ?? { cls: "bg-gray-100 text-gray-500 ring-1 ring-gray-200", dot: "bg-gray-400" };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${s.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {status}
      </span>
    );
  }

  // Summary counts
  const totalCities   = cities.length;
  const totalSvc      = services.length;
  const activeSvc     = services.filter(s => s.status === "Active").length;
  const suspendedSvc  = services.filter(s => s.status === "Suspended").length;

  return (
    <div className="space-y-5 pb-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Cities",      value: totalCities,   icon: Building2, color: "bg-indigo-500"  },
          { label: "City Services",     value: totalSvc,      icon: MapPin,    color: "bg-emerald-500" },
          { label: "Active Services",   value: activeSvc,     icon: RefreshCw, color: "bg-violet-500"  },
          { label: "Suspended",         value: suspendedSvc,  icon: Trash2,    color: "bg-rose-500"    },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} className="text-white" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="pl-8 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-60 transition"
                placeholder="Search city, service…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Status filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {(["All", "Active", "Pending", "Suspended", "Completed"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s as ServiceStatus | "All")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                    statusFilter === s
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => { fetchServices(); fetchCities(); }}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition" title="Refresh">
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => { setEditingCity(null); setCityModalOpen(true); }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl transition shadow-sm shadow-indigo-200"
            >
              <Plus size={14} /> Add City
            </button>
          </div>
        </div>

        {/* Errors */}
        {(error || cityError) && (
          <div className="px-5 py-3 bg-red-50 text-red-600 text-sm border-b border-red-100">
            {error || cityError}
          </div>
        )}

        {/* Loading */}
        {loading || citiesLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-sm text-gray-400">Loading data…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300 gap-2">
            <Building2 size={32} />
            <p className="text-sm text-gray-400">No records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["City", "Areas", "Services", "Status", "Added", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((row) => (
                  <tr key={row.key} className="hover:bg-gray-50/60 transition group">

                    {/* City */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                          <Building2 size={13} className="text-indigo-600" />
                        </div>
                        <span className="font-semibold text-gray-800 text-xs">{row.cityName}</span>
                      </div>
                    </td>

                    {/* Areas / pincode */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.kind === "city" && row.city ? (
                        <button
                          onClick={() => { setSelectedCityForAreas(row.city!); setAreasModalOpen(true); }}
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition"
                          title="Manage areas"
                        >
                          <MapPin size={11} />
                          {row.pinCode}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">{row.pinCode}</span>
                      )}
                    </td>

                    {/* Services */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-xs font-semibold text-gray-800 truncate">{row.serviceName}</p>
                      {row.serviceDescription && row.serviceDescription !== row.serviceName && (
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{row.serviceDescription}</p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={row.kind === "service" ? row.service?.status : row.status} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(row.addedAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {/* Ban button — service rows only */}
                        {row.kind === "service" && row.service && (
                          <button
                            onClick={() => handleBanService(row.service!)}
                            disabled={row.service.status === "Suspended" || banningServiceId === row.service.id}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition ${
                              row.service.status === "Suspended"
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-amber-200"
                            }`}
                          >
                            {banningServiceId === row.service.id
                              ? <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block" />
                              : row.service.status === "Suspended" ? "Banned" : "Ban"}
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => {
                            if (row.kind === "service" && row.service) {
                              setEditTarget(row.service); setModalOpen(true);
                            } else if (row.kind === "city" && row.city) {
                              setEditingCity(row.city); setCityModalOpen(true);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition" title="Edit"
                        >
                          <Pencil size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (row.kind === "service" && row.service) setDeleteConfirm(row.service.id);
                            else if (row.kind === "city" && row.city) setCityDeleteId(row.city.id);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && !citiesLoading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of <span className="font-semibold text-gray-600">{tableRows.length}</span> records
          </div>
        )}
      </div>

      {/* ── Modals (logic unchanged) ── */}
      <ServiceFormModal
        open={modalOpen}
        service={editTarget}
        cities={cities}
        citiesLoading={citiesLoading}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
      />

      <CityFormModal
        open={cityModalOpen}
        city={editingCity}
        onClose={() => { setCityModalOpen(false); setEditingCity(null); }}
        onSave={handleSaveCity}
      />

      <AreasManagementModal
        open={areasModalOpen}
        city={selectedCityForAreas}
        onClose={() => { setAreasModalOpen(false); setSelectedCityForAreas(null); }}
        onChanged={fetchCities}
      />

      {/* Delete city confirm */}
      {cityDeleteId && (
        <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 border border-gray-100 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Trash2 size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete City?</h3>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCityDeleteId(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                Cancel
              </button>
              <button onClick={() => handleDeleteCity(cityDeleteId)} disabled={deletingCity}
                className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition disabled:opacity-60">
                {deletingCity ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Delete service confirm */}
      {deleteConfirm && (
        <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 border border-gray-100 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Trash2 size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Service?</h3>
              <p className="text-sm text-gray-500 mt-1">This will permanently remove this city service.</p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm) {
                    setDeleting(true);
                    fetch(`/api/city-services/${deleteConfirm}`, { method: "DELETE" })
                      .then(res => { if (!res.ok) throw new Error("Delete failed."); setDeleteConfirm(null); fetchServices(); })
                      .finally(() => setDeleting(false));
                  }
                }}
                disabled={deleting}
                className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
