"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import {
  CityRecord,
  CityService,
  CreateCityServiceInput,
  ServiceCategory,
} from "@/lib/types";

const CATEGORIES: ServiceCategory[] = [
  "Water & Sanitation",
  "Transportation",
  "Electricity",
  "Healthcare",
  "Education",
  "Waste Management",
  "Public Safety",
  "Parks & Recreation",
];

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyForm(): CreateCityServiceInput {
  return {
    cityId: "",
    name: "",
    category: "Water & Sanitation",
    description: "",
    status: "Pending",
    provider: "",
    contactEmail: "",
    contactPhone: "",
    budget: 0,
    startDate: getTodayDate(),
    endDate: null,
  };
}

interface Props {
  open: boolean;
  service?: CityService | null;
  cities: CityRecord[];
  citiesLoading?: boolean;
  onClose: () => void;
  onSave: (data: CreateCityServiceInput) => Promise<void>;
}

export default function ServiceFormModal({ open, service, cities, citiesLoading = false, onClose, onSave }: Props) {
  const [form, setForm] = useState<CreateCityServiceInput>(createEmptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateCityServiceInput, string>>>({});

  useEffect(() => {
    if (service) {
      const { id, createdAt, updatedAt, ...rest } = service;
      void id; void createdAt; void updatedAt;
      setForm(rest);
    } else {
      setForm(createEmptyForm());
    }
    setErrors({});
  }, [service, open]);

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.cityId?.trim()) newErrors.cityId = "City is required.";
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    if (!form.provider.trim()) newErrors.provider = "Provider is required.";
    if (!form.contactEmail.trim()) newErrors.contactEmail = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
      newErrors.contactEmail = "Enter a valid email.";
    if (!form.contactPhone.trim()) newErrors.contactPhone = "Phone is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        status: form.status || "Pending",
        budget: Number.isFinite(form.budget) ? form.budget : 0,
        startDate: form.startDate || getTodayDate(),
        endDate: form.endDate || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function field(key: keyof CreateCityServiceInput) {
    return {
      value: form[key] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const val = key === "budget" ? Number(e.target.value) : e.target.value || (key === "endDate" ? null : e.target.value);
        setForm((prev) => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
      },
    };
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white via-indigo-50 to-emerald-50 rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[92vh] flex flex-col border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-emerald-50 rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {service ? "Edit City Service" : "Add City Service"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 transition shadow-sm"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
            <select
              className={clsx(
                "w-full border rounded-xl px-3 py-2 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm",
                errors.cityId ? "border-red-400" : "border-gray-300"
              )}
              value={form.cityId ?? ""}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, cityId: e.target.value }));
                if (errors.cityId) setErrors((prev) => ({ ...prev, cityId: undefined }));
              }}
            >
              <option value="">{citiesLoading ? "Loading cities..." : "Select a city"}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.cityName} ({city.pinCode})
                </option>
              ))}
            </select>
            {errors.cityId && <p className="text-xs text-red-500 mt-1">{errors.cityId}</p>}
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Service Name <span className="text-red-500">*</span></label>
              <input
                className={clsx(
                  "w-full border rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm",
                  errors.name ? "border-red-400" : "border-gray-300"
                )}
                placeholder="e.g. Clean Water Supply"
                {...field("name")}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm"
                {...field("category")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
              <select
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm"
                {...field("status")}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              className={clsx(
                "w-full border rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm resize-none",
                errors.description ? "border-red-400" : "border-gray-300"
              )}
              placeholder="Describe the city service..."
              {...field("description")}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Provider */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Provider <span className="text-red-500">*</span></label>
              <input
                className={clsx(
                  "w-full border rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm",
                  errors.provider ? "border-red-400" : "border-gray-300"
                )}
                placeholder="Provider name"
                {...field("provider")}
              />
              {errors.provider && <p className="text-xs text-red-500 mt-1">{errors.provider}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Contact Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                className={clsx(
                  "w-full border rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm",
                  errors.contactEmail ? "border-red-400" : "border-gray-300"
                )}
                placeholder="contact@city.gov"
                {...field("contactEmail")}
              />
              {errors.contactEmail && <p className="text-xs text-red-500 mt-1">{errors.contactEmail}</p>}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone <span className="text-red-500">*</span></label>
              <input
                type="tel"
                className={clsx(
                  "w-full border rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm",
                  errors.contactPhone ? "border-red-400" : "border-gray-300"
                )}
                placeholder="+1-800-555-0000"
                {...field("contactPhone")}
              />
              {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-8 py-5 border-t border-gray-200 bg-gradient-to-r from-indigo-50 to-emerald-50 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-base font-semibold text-gray-600 hover:text-white hover:bg-gray-400 rounded-xl transition shadow-sm border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 text-base font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 text-white rounded-xl shadow hover:from-indigo-700 hover:to-emerald-600 hover:shadow-lg transition disabled:opacity-60"
          >
            {saving ? "Saving…" : service ? "Update Service" : "Add Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
