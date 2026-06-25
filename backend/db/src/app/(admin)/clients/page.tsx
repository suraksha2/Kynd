"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Search, UserPlus, X, Trash2, Download,
  Users, ShoppingCart, DollarSign, MapPin, Phone, Mail, Calendar,
} from "lucide-react";
import clsx from "clsx";
import ModalPortal from "@/components/ModalPortal";

type Customer = {
  id: number | string;
  name: string;
  email: string | null;
  mobile: string;
  city: string;
  totalOrders: number;
  totalSpend: number;
  status: "Active" | "Inactive";
  joined: string;
  avatar: string;
};

type CustomerForm = {
  name: string;
  email: string;
  mobile: string;
  city: string;
  totalOrders: number;
  totalSpend: number;
  status: "Active" | "Inactive";
};

const avatarColors = [
  "bg-indigo-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500",   "bg-sky-500",     "bg-violet-500",
];

const statusCfg: Record<string, { cls: string; dot: string }> = {
  Active:   { cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  Inactive: { cls: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",         dot: "bg-gray-400" },
  Suspended:{ cls: "bg-red-50 text-red-600 ring-1 ring-red-200",             dot: "bg-red-500" },
};

const defaultForm: CustomerForm = {
  name: "", email: "", mobile: "", city: "", totalOrders: 0, totalSpend: 0, status: "Active",
};

function getInitials(name: string) {
  return (name || "?").trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function CustomersPage() {
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState<CustomerForm>(defaultForm);
  const [errors, setErrors]         = useState<Partial<CustomerForm>>({});
  const [expandedRow, setExpandedRow] = useState<number | string | null>(null);

  useEffect(() => { loadCustomers(); }, []);

  async function loadCustomers() {
    setLoading(true);
    try {
      const res  = await fetch("/api/clients");
      const json = await res.json();
      if (Array.isArray(json.data)) setCustomers(json.data);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      (c.name  || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.mobile || "").includes(q) ||
      (c.city  || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary stats
  const totalSpend   = customers.reduce((s, c) => s + Number(c.totalSpend  || 0), 0);
  const totalOrders  = customers.reduce((s, c) => s + Number(c.totalOrders || 0), 0);
  const activeCount  = customers.filter(c => c.status === "Active").length;

  function validate() {
    const e: Partial<CustomerForm> = {};
    if (!form.name.trim())   e.name   = "Name is required.";
    if (!form.mobile.trim()) e.mobile = "Mobile is required.";
    if (!form.city.trim())   e.city   = "City is required.";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setCustomers(prev => [...prev, {
      id: Date.now(), ...form,
      joined: today,
      avatar: getInitials(form.name),
    }]);
    setForm(defaultForm);
    setErrors({});
    setShowModal(false);
  }

  function handleClose() {
    setShowModal(false);
    setForm(defaultForm);
    setErrors({});
  }

  function handleExport() {
    const exportData = filtered.map(({ avatar, id, ...rest }) => rest);
    const ws  = XLSX.utils.json_to_sheet(exportData);
    const wb  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([out], { type: "application/octet-stream" }), "clients.xlsx");
  }

  const inputCls = "w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition placeholder:text-gray-400";

  return (
    <>
      <div className="space-y-5 pb-6">

        {/* Summary cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Customers", value: customers.length.toLocaleString(),        icon: Users,         color: "bg-indigo-500"  },
            { label: "Active",          value: activeCount.toLocaleString(),              icon: Users,         color: "bg-emerald-500" },
            { label: "Total Orders",    value: totalOrders.toLocaleString(),              icon: ShoppingCart,  color: "bg-orange-500"  },
            { label: "Total Revenue",   value: `S$${totalSpend.toLocaleString()}`,         icon: DollarSign,   color: "bg-violet-500"  },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, mobile, city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition"
              />
            </div>
            {/* Status filter */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {["All", "Active", "Inactive"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={clsx(
                    "text-xs font-semibold px-3 py-1.5 rounded-lg transition",
                    statusFilter === s
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >{s}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-xl transition shadow-sm"
            >
              <Download size={14} /> Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition shadow-sm shadow-indigo-200"
            >
              <UserPlus size={14} /> Add Customer
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-sm text-gray-400">Loading customers…</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Customer", "Mobile", "City", "Orders", "Total Spend", "Status", "Joined", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((client, i) => {
                    const st = statusCfg[client.status] ?? statusCfg["Inactive"];
                    const isExpanded = expandedRow === client.id;
                    return (
                      <React.Fragment key={client.id}>
                        <tr
                          className="hover:bg-gray-50/70 transition cursor-pointer"
                          onClick={() => setExpandedRow(isExpanded ? null : client.id)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0", avatarColors[i % avatarColors.length])}>
                                {getInitials(client.name)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 leading-tight">{client.name}</p>
                                {client.email && <p className="text-[11px] text-gray-400 leading-tight">{client.email}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{client.mobile || "—"}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{client.city || "—"}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{client.totalOrders ?? 0}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">S${Number(client.totalSpend || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={clsx("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold", st.cls)}>
                              <span className={clsx("w-1.5 h-1.5 rounded-full", st.dot)} />
                              {client.status || "Active"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{client.joined || "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setCustomers(prev => prev.filter(c => c.id !== client.id))}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                              title="Remove"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${client.id}-expand`} className="bg-indigo-50/40">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone size={13} className="text-indigo-400 shrink-0" />
                                  <span>{client.mobile || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Mail size={13} className="text-indigo-400 shrink-0" />
                                  <span className="truncate">{client.email || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin size={13} className="text-indigo-400 shrink-0" />
                                  <span>{client.city || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar size={13} className="text-indigo-400 shrink-0" />
                                  <span>Joined: {client.joined || "—"}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <Users size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No customers found.</p>
                </div>
              )}
            </div>
          )}
          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of <span className="font-semibold text-gray-600">{customers.length}</span> customers
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 border border-gray-100 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Add New Customer</h2>
                <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                  <input type="text" placeholder="e.g. Rahul Sharma" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                  <input type="email" placeholder="e.g. rahul@example.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mobile *</label>
                  <input type="text" placeholder="9876543210" value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })} className={inputCls} />
                  {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">City *</label>
                  <input type="text" placeholder="Mumbai" value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })} className={inputCls} />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Orders</label>
                  <input type="number" min="0" value={form.totalOrders}
                    onChange={e => setForm({ ...form, totalOrders: Number(e.target.value) })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Spend (S$)</label>
                  <input type="number" min="0" value={form.totalSpend}
                    onChange={e => setForm({ ...form, totalSpend: Number(e.target.value) })} className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as "Active" | "Inactive" })} className={inputCls}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={handleClose}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm shadow-indigo-200 transition">
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}
    </>
  );
}
