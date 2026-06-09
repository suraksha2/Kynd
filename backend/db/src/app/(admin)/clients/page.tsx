"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Search, UserPlus, MoreVertical, X, Trash2 } from "lucide-react";
import clsx from "clsx";

type Customer = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  city: string;
  totalOrders: number;
  totalSpend: number;
  status: 'Active' | 'Inactive';
  joined: string;
  avatar: string;
};

type CustomerForm = Omit<Customer, "id" | "joined" | "avatar">;


import { useEffect } from "react";

const initialCustomers: Customer[] = [];

const statusStyles: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  Suspended: "bg-red-100 text-red-600",
};

// Removed roleColors

const avatarColors = ["bg-indigo-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"];

const defaultForm: CustomerForm = { name: "", email: "", mobile: "", city: "", totalOrders: 0, totalSpend: 0, status: "Active" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setCustomers(data.data);
        }
      })
      .catch((err) => {
        // Optionally handle error
        console.error("Failed to fetch clients", err);
      });
  }, []);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CustomerForm>(defaultForm);
  const [errors, setErrors] = useState<Partial<typeof defaultForm>>({});

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  function validate() {
    const e: Partial<typeof defaultForm> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email.";
    else if (customers.some((c) => c.email === form.email)) e.email = "Email already exists.";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required.";
    if (!form.city.trim()) e.city = "City is required.";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const initials = form.name.trim().split(" ").map((w) => w[0].toUpperCase()).slice(0, 2).join("");
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setCustomers((prev) => [...prev, { id: Date.now(), ...form, joined: today, avatar: initials }]);
    setForm(defaultForm);
    setErrors({});
    setShowModal(false);
  }

  function handleClose() {
    setShowModal(false);
    setForm(defaultForm);
    setErrors({});
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              <UserPlus size={15} />
              Add Customer
            </button>
            <button
              onClick={() => {
                const exportData = filtered.map(({ avatar, id, ...rest }) => rest);
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Clients");
                const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                saveAs(new Blob([wbout], { type: "application/octet-stream" }), "clients.xlsx");
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Export
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
                  {["Customer", "Mobile No", "City", "Total Orders", "Total Spend", "Status", "Joined On", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((client, i) => (
                  <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={clsx("w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", avatarColors[i % avatarColors.length])}>
                          {client.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{client.name}</p>
                          <p className="text-xs text-gray-400">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{client.mobile}</td>
                    <td className="px-5 py-3">{client.city}</td>
                    <td className="px-5 py-3">{client.totalOrders}</td>
                    <td className="px-5 py-3">₹{client.totalSpend}</td>
                    <td className="px-5 py-3">
                      <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-medium", statusStyles[client.status])}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{client.joined}</td>
                    <td className="px-5 py-3 flex gap-2">
                      <button className="p-1.5 hover:bg-red-100 rounded-lg transition text-red-600 border border-red-200" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10">No clients found.</p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-100/60 via-white/80 to-emerald-100/60 backdrop-blur-sm">
          <div className="bg-white/90 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 border border-gray-100 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Add New Client</h2>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  placeholder="e.g. john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Orders</label>
                  <input
                    type="number"
                    min="0"
                    value={form.totalOrders}
                    onChange={(e) => setForm({ ...form, totalOrders: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.totalSpend}
                    onChange={(e) => setForm({ ...form, totalSpend: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={handleClose} className="px-5 py-2 text-base font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition shadow-sm border border-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 text-base font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 text-white rounded-xl shadow hover:from-indigo-700 hover:to-emerald-600 hover:shadow-lg transition transform hover:scale-[1.03] disabled:opacity-60">
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
