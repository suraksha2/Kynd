"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { CityRecord, CreateCityInput } from "@/lib/types";

interface AreaPincode {
  areaName: string;
  pinCode: string;
}

type CityFormState = CreateCityInput & { serviceCategoryId?: string };

const EMPTY_FORM: CityFormState = {
  cityName: "",
  pinCode: "",
  serviceCategoryId: "",
};

interface Props {
  open: boolean;
  city?: CityRecord | null;
  onClose: () => void;
  onSave: (data: CreateCityInput) => Promise<void>;
}

export default function CityFormModal({ open, city, onClose, onSave }: Props) {
  const [form, setForm] = useState<CityFormState>(EMPTY_FORM);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [areas, setAreas] = useState<AreaPincode[]>([]);
  const [newArea, setNewArea] = useState({ areaName: "", pinCode: "" });
  
  useEffect(() => {
    fetch("/api/service-categories")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) setCategories(data.data);
      });
  }, []);
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateCityInput, string>>>({});

  useEffect(() => {
    if (city) {
      setForm({ 
        cityName: city.cityName, 
        pinCode: city.pinCode, 
        serviceCategoryId: city.serviceCategoryId ? String(city.serviceCategoryId) : "" 
      });
      try {
        const parsed = JSON.parse(city.pinCode);
        if (Array.isArray(parsed)) {
          setAreas(parsed);
        } else {
          setAreas([{ areaName: "Default", pinCode: city.pinCode }]);
        }
      } catch {
        setAreas([{ areaName: "Default", pinCode: city.pinCode }]);
      }
    } else {
      setForm(EMPTY_FORM);
      setAreas([]);
    }
    setErrors({});
  }, [city, open]);

  function validate() {
    const nextErrors: Partial<Record<keyof CreateCityInput, string>> = {};
    if (!form.cityName.trim()) {
      nextErrors.cityName = "City name is required.";
    }
    if (areas.length === 0) {
      nextErrors.pinCode = "At least one area/pincode is required.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function addArea() {
    if (newArea.areaName.trim() && newArea.pinCode.trim()) {
      setAreas([...areas, { ...newArea }]);
      setNewArea({ areaName: "", pinCode: "" });
    }
  }

  function removeArea(index: number) {
    setAreas(areas.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const pinCodeJson = JSON.stringify(areas);
      await onSave({
        cityName: form.cityName.trim(),
        pinCode: pinCodeJson,
        serviceCategoryId: form.serviceCategoryId,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-gradient-to-br from-white via-indigo-50 to-emerald-50 shadow-2xl border border-gray-100 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 md:px-8 py-4 md:py-5 bg-gradient-to-r from-indigo-50 to-emerald-50 rounded-t-3xl shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            {city ? "Edit City" : "Add City"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 transition shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 px-4 md:px-8 py-4 md:py-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">City Name <span className="text-red-500">*</span></label>
            <input
              value={form.cityName}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, cityName: e.target.value }));
                if (errors.cityName) {
                  setErrors((prev) => ({ ...prev, cityName: undefined }));
                }
              }}
              className={clsx(
                "w-full rounded-xl border px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm",
                errors.cityName ? "border-red-400" : "border-gray-300"
              )}
              placeholder="Enter city name"
            />
            {errors.cityName && <p className="mt-1 text-xs text-red-500">{errors.cityName}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Areas & Pincodes <span className="text-red-500">*</span></label>
            
            <div className="space-y-2 mb-3">
              {areas.map((area, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{area.areaName}</p>
                    <p className="text-xs text-gray-500">{area.pinCode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArea(index)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {areas.length === 0 && (
                <p className="text-sm text-gray-400 italic">No areas added yet</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={newArea.areaName}
                onChange={(e) => setNewArea({ ...newArea, areaName: e.target.value })}
                className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm border-gray-300"
                placeholder="Area name (e.g., Indiranagar)"
              />
              <input
                value={newArea.pinCode}
                onChange={(e) => setNewArea({ ...newArea, pinCode: e.target.value })}
                className="w-full sm:w-28 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm border-gray-300"
                placeholder="Pincode"
              />
              <button
                type="button"
                onClick={addArea}
                className="px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>
            {errors.pinCode && <p className="mt-1 text-xs text-red-500">{errors.pinCode}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Service Category</label>
            <select
              value={form.serviceCategoryId || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, serviceCategoryId: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-sm border-gray-300"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 text-sm md:text-base font-semibold text-gray-600 hover:text-white hover:bg-gray-400 rounded-xl transition shadow-sm border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2 text-sm md:text-base font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 text-white rounded-xl shadow hover:from-indigo-700 hover:to-emerald-600 hover:shadow-lg transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
