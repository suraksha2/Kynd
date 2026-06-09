"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, RefreshCw, Building2 } from "lucide-react";
import { CityRecord, CityService, CreateCityInput, CreateCityServiceInput, ServiceStatus } from "@/lib/types";
import ServiceFormModal from "@/components/ServiceFormModal";
import CityFormModal from "@/components/CityFormModal";

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
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
    
    // Parse pinCode to get areas
    let pinCodeDisplay = city.pinCode;
    try {
      const parsed = JSON.parse(city.pinCode);
      if (Array.isArray(parsed)) {
        pinCodeDisplay = `${parsed.length} area(s)`;
      }
    } catch {
      // Keep as is if not JSON
    }
    
    if (cityServices.length === 0) {
      // Lookup service category name from fetched categories
      let serviceCategoryName = "";
      if (city.serviceCategoryId && categories.length > 0) {
        const found = categories.find(cat => cat.id === city.serviceCategoryId);
        serviceCategoryName = found ? found.name : "";
      }
      tableRows.push({
        key: `city_${city.id}`,
        cityName: city.cityName,
        pinCode: pinCodeDisplay,
        serviceName: serviceCategoryName || "—",
        serviceDescription: serviceCategoryName ? `Category: ${serviceCategoryName}` : "No services available",
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

  return (
    <div className="min-h-screen py-8 px-2 sm:px-6 bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-2xl shadow-md">
            <Building2 size={28} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Serviceable City</h1>
            <p className="text-base text-gray-500 mt-1">Manage municipal services across the city</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditingCity(null); setCityModalOpen(true); }}
              className="flex items-center gap-2 px-5 py-2 border border-indigo-200 bg-white text-indigo-700 text-base font-semibold rounded-xl shadow hover:bg-indigo-50 hover:shadow-md transition"
            >
              <Plus size={18} />
              Add City
            </button>
          </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow px-6 py-5 mb-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
            placeholder="Search by city, pin code, or service…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ServiceStatus | "All")}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
          <option value="Completed">Completed</option>
        </select>
        <button
          onClick={fetchServices}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-base text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        {error && (
          <div className="px-5 py-3 bg-red-50 text-red-600 text-sm border-b border-red-100">
            {error}
          </div>
        )}

        {cityError && (
          <div className="px-5 py-3 bg-red-50 text-red-600 text-sm border-b border-red-100">
            {cityError}
          </div>
        )}

        {loading || citiesLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            Loading data…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <Building2 size={32} className="opacity-40" />
            <p className="text-sm">No serviceable city found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-emerald-50">
                  {["City", "Pin Code", "Service", "Status", "Service Add Date", "Action"].map(
                    (h) => (
                      <th key={h} className="px-6 py-4 font-bold tracking-wide whitespace-nowrap text-lg">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-gray-100 hover:bg-indigo-50/60 transition group"
                  >
                    <td className="px-6 py-4 text-gray-900 font-semibold whitespace-nowrap">
                      {row.cityName}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      {row.pinCode}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-indigo-700 group-hover:text-indigo-900 transition">{row.serviceName}</p>
                      {row.kind === "city" && row.serviceDescription ? (
                        <div className="text-xs text-gray-500 mt-1">
                          {row.serviceDescription.split(" | ").map((desc, idx) => (
                            <div key={idx}>{desc}</div>
                          ))}
                        </div>
                      ) : row.serviceDescription ? (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{row.serviceDescription}</p>
                      ) : null}
                    </td>
                    {/* Status column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.kind === "service" && row.service ? (
                        <span
                          className={
                            row.service.status === "Active"
                              ? "inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200"
                              : row.service.status === "Suspended"
                              ? "inline-block px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200"
                              : row.service.status === "Pending"
                              ? "inline-block px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : row.service.status === "Completed"
                              ? "inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200"
                              : "inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200"
                          }
                        >
                          {row.service.status}
                        </span>
                      ) : row.kind === "city" && row.status ? (
                        <span
                          className={
                            row.status === "Active"
                              ? "inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200"
                              : row.status === "Suspended"
                              ? "inline-block px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200"
                              : row.status === "Pending"
                              ? "inline-block px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : row.status === "Completed"
                              ? "inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200"
                              : "inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200"
                          }
                        >
                          {row.status}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {formatDate(row.addedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {row.kind === "service" && row.service ? (
                          <>
                            <button
                              onClick={() => handleBanService(row.service!)}
                              disabled={row.service.status === "Suspended" || banningServiceId === row.service.id}
                              className={
                                row.service.status === "Suspended"
                                  ? "px-3 py-1 text-xs font-semibold rounded-lg bg-amber-100 text-amber-700 border border-amber-200 cursor-not-allowed"
                                  : "px-3 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-200 hover:text-amber-900 transition"
                              }
                              title={row.service.status === "Suspended" ? "Already banned" : "Ban"}
                            >
                              {banningServiceId === row.service.id ? "Banning..." : row.service.status === "Suspended" ? "Banned" : "Ban"}
                            </button>
                          </>
                        ) : null}
                        {row.kind === "city" && row.serviceName && row.serviceName !== "—" ? (
                          <button
                            disabled
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed"
                            title="No service to ban"
                          >
                            Ban
                          </button>
                        ) : null}
                        <button
                          onClick={() => {
                            if (row.kind === "service" && row.service) {
                              setEditTarget(row.service);
                              setModalOpen(true);
                              return;
                            }
                            if (row.kind === "city" && row.city) {
                              setEditingCity(row.city);
                              setCityModalOpen(true);
                            }
                          }}
                          className="p-2 rounded-lg text-indigo-500 hover:text-white hover:bg-indigo-500 transition shadow-sm"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (row.kind === "service" && row.service) {
                              setDeleteConfirm(row.service.id);
                              return;
                            }
                            if (row.kind === "city" && row.city) {
                              setCityDeleteId(row.city.id);
                            }
                          }}
                          className="p-2 rounded-lg text-red-500 hover:text-white hover:bg-red-500 transition shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                  () ||
                  (row.kind === 'city' && row.status === status)
                
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !citiesLoading && filtered.length > 0 && (
          <>
            <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">
              Showing {filtered.length} of {tableRows.length} rows
            </div>
            {/* Service Status Summary */}
            <div className="px-5 py-3 text-sm text-gray-700 border-t border-gray-100 flex flex-wrap gap-6">
              <span className="font-semibold">Service Status:</span>
              {['Active', 'Pending', 'Suspended', 'Completed'].map((status) => {
                const count = filtered.filter(row => row.kind === 'service' && row.service?.status === status).length;
                return (
                  <span key={status} className="inline-block mr-4">
                    <span className={
                      status === 'Active' ? 'text-green-600' :
                      status === 'Pending' ? 'text-yellow-600' :
                      status === 'Suspended' ? 'text-amber-600' :
                      status === 'Completed' ? 'text-blue-600' : 'text-gray-500'
                    }>
                      {status}: {count}
                    </span>
                  </span>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
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

      {cityDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-800">Delete City?</h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone. The city record will be permanently removed.
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setCityDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCity(cityDeleteId)}
                disabled={deletingCity}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60"
              >
                {deletingCity ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-800">Delete Service?</h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone. The service record will be permanently removed.
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm) {
                    setDeleting(true);
                    fetch(`/api/city-services/${deleteConfirm}`, { method: "DELETE" })
                      .then((res) => {
                        if (!res.ok) throw new Error("Delete failed.");
                        setDeleteConfirm(null);
                        fetchServices();
                      })
                      .finally(() => setDeleting(false));
                  }
                }}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
