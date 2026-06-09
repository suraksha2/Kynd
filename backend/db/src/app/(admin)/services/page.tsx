"use client";

import { useCallback, useEffect, useState } from "react";
import { MoreVertical, Plus, Search, Pencil, Trash2, X, Wrench } from "lucide-react";
import clsx from "clsx";
import { ServiceCategory } from "@/lib/service-category-types";

type Service = {
  id: number;
  name: string;
  category: string;
  price: string;
  availability: string;
  status: "Available" | "Busy" | "Offline";
  icon: string;
  image: string | null;
};

const initialServices: Service[] = [];

const statusStyles: Record<Service["status"], string> = {
  Available: "bg-green-100 text-green-700",
  Busy: "bg-yellow-100 text-yellow-700",
  Offline: "bg-red-100 text-red-600",
};

const defaultCategoryForm = {
  name: "",
  description: "",
};

const AVAILABLE_IMAGES = [
  "/images/after-party-express-clean.webp",
  "/images/balcony.webp",
  "/images/bathroom-surface-cleaning.webp",
  "/images/complete-wardrobe-cleaning.webp",
  "/images/dusting.webp",
  "/images/fan-cleaning.webp",
  "/images/fridge-surface-cleaning.webp",
  "/images/hourly-bookings.webp",
  "/images/ironing-folding.webp",
  "/images/kitchen-cabinet-cleaning.webp",
  "/images/kitchen-cleaning.webp",
  "/images/kitchen-prep.webp",
  "/images/laundry.webp",
  "/images/packing-unpacking.webp",
  "/images/pre-party-express-clean.webp",
  "/images/sweeping-mopping.webp",
  "/images/utensils.webp",
  "/images/window.webp",
];

const defaultServiceForm = {
  name: "",
  category: "",
  price: "",
  availability: "",
  status: "Available" as Service["status"],
  icon: "",
  image: "",
};

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<Service[]>(initialServices);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const res = await fetch("/api/services");
      const json = await res.json();
      if (json.data) {
        const mappedServices = json.data.map((service: any) => ({
          id: service.id,
          name: service.name,
          category: service.category,
          price: `$${service.price}`,
          availability: service.availability,
          status: service.status,
          icon: service.name.substring(0, 2).toUpperCase(),
          image: service.image || null,
        }));
        setServices(mappedServices);
      }
    } catch (err) {
      console.error("Failed to fetch services", err);
    } finally {
      setServicesLoading(false);
    }
  }

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState(defaultServiceForm);
  const [serviceFormError, setServiceFormError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoryError(null);

    try {
      const res = await fetch("/api/service-categories");
      if (!res.ok) {
        throw new Error("Failed to load service categories.");
      }
      const json = await res.json();
      setCategories(json.data);
    } catch (error) {
      setCategoryError(
        error instanceof Error ? error.message : "Failed to load service categories."
      );
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.category.toLowerCase().includes(search.toLowerCase())
  );

  if (servicesLoading) {
    return (
      <div className="space-y-4">
        <div className="text-gray-500 text-sm">Loading services...</div>
      </div>
    );
  }

  function openCreateServiceModal() {
    setServiceForm({
      ...defaultServiceForm,
      category: categories[0]?.name ?? "",
    });
    setServiceFormError(null);
    setShowServiceModal(true);
  }

  async function handleSaveService(e: React.FormEvent) {
    e.preventDefault();

    if (!serviceForm.name.trim()) {
      setServiceFormError("Service name is required.");
      return;
    }

    if (!serviceForm.category.trim()) {
      setServiceFormError("Service category is required.");
      return;
    }

    if (!serviceForm.price.trim()) {
      setServiceFormError("Price is required.");
      return;
    }

    if (!serviceForm.availability.trim()) {
      setServiceFormError("Availability is required.");
      return;
    }

    const cleanedIcon = serviceForm.icon.trim().toUpperCase();
    const fallbackIcon = serviceForm.name
      .split(" ")
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serviceForm.name.trim(),
          category: serviceForm.category.trim(),
          price: serviceForm.price.trim().replace("$", ""),
          availability: serviceForm.availability.trim(),
          status: serviceForm.status,
          image: serviceForm.image || null,
        }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error ?? "Failed to create service.");
      }

      await fetchServices();
      setShowServiceModal(false);
      setServiceForm(defaultServiceForm);
      setServiceFormError(null);
    } catch (error) {
      setServiceFormError(
        error instanceof Error ? error.message : "Failed to create service."
      );
    }
  }

  function openCreateCategoryModal() {
    setEditingCategory(null);
    setCategoryForm(defaultCategoryForm);
    setCategoryFormError(null);
    setShowCategoryModal(true);
  }

  function openEditCategoryModal(category: ServiceCategory) {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
    });
    setCategoryFormError(null);
    setShowCategoryModal(true);
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setCategoryFormError("Category name is required.");
      return;
    }

    setSavingCategory(true);
    setCategoryFormError(null);

    try {
      const url = editingCategory
        ? `/api/service-categories/${editingCategory.id}`
        : "/api/service-categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to save category.");
      }

      await fetchCategories();
      setShowCategoryModal(false);
    } catch (error) {
      setCategoryFormError(
        error instanceof Error ? error.message : "Failed to save category."
      );
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    setDeletingCategory(true);
    try {
      const res = await fetch(`/api/service-categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete category.");
      }

      setDeleteCategoryId(null);
      await fetchCategories();
    } catch (error) {
      setCategoryError(
        error instanceof Error ? error.message : "Failed to delete category."
      );
    } finally {
      setDeletingCategory(false);
    }
  }

  return (
    <div className="space-y-10">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Wrench size={22} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Service Category</h2>
            <span className="ml-2 px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
              {categories.length}
            </span>
          </div>
          <button
            onClick={openCreateCategoryModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-sm font-semibold rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <Plus size={15} />
            Add Category
          </button>
        </div>

        {categoryError && (
          <p className="px-8 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100 font-medium">
            {categoryError}
          </p>
        )}

        {categoriesLoading ? (
          <p className="px-8 py-8 text-base text-gray-400">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="px-8 py-8 text-base text-gray-400">
            No service categories found. Add one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-start justify-between gap-3 p-5 rounded-2xl border border-gray-100 bg-gray-50/80 hover:shadow-md hover:bg-white transition-all duration-200"
              >
                <div>
                  <p className="text-base font-semibold text-gray-900 mb-0.5">{category.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {category.description || "No description"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditCategoryModal(category)}
                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteCategoryId(category.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full shadow-sm"
            />
          </div>
          <button
            onClick={openCreateServiceModal}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-base font-semibold px-5 py-2.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <Plus size={17} />
            Add Service
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                {service.image ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-extrabold tracking-wide shadow-sm">
                    {service.icon}
                  </div>
                )}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <MoreVertical size={18} className="text-gray-400" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base mb-0.5">{service.name}</h3>
                <p className="text-xs text-gray-500 font-medium">{service.category}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xl font-bold text-indigo-600">{service.price}</span>
                <span
                  className={clsx(
                    "px-3 py-0.5 rounded-full text-xs font-semibold",
                    statusStyles[service.status]
                  )}
                >
                  {service.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">Availability: {service.availability}</p>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-base">No services found.</p>
        )}
      </div>

      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Add Service</h2>
              <button
                onClick={() => setShowServiceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveService} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AC Repair"
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={clsx(
                    "w-full px-3 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    serviceFormError ? "border-red-400" : "border-gray-200"
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={serviceForm.category}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.length === 0 && <option value="">No categories available</option>}
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 60.50"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={serviceForm.status}
                    onChange={(e) =>
                      setServiceForm((prev) => ({
                        ...prev,
                        status: e.target.value as Service["status"],
                      }))
                    }
                    className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Availability <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mon-Sat"
                    value={serviceForm.availability}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, availability: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Service Image
                  </label>
                  <select
                    value={serviceForm.image}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, image: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No image (use icon)</option>
                    {AVAILABLE_IMAGES.map((img) => (
                      <option key={img} value={img}>
                        {img.replace('/images/', '').replace('.webp', '').replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  {serviceForm.image && (
                    <div className="mt-2">
                      <img src={serviceForm.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}
                </div>
              </div>

              {serviceFormError && (
                <p className="text-xs text-red-500 mt-1">{serviceFormError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-5 py-2 text-base font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 rounded-lg shadow transition"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCategory ? "Edit Service Category" : "Add Service Category"}
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plumbing"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                  className={clsx(
                    "w-full px-3 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    categoryFormError ? "border-red-400" : "border-gray-200"
                  )}
                />
                {categoryFormError && (
                  <p className="text-xs text-red-500 mt-1">{categoryFormError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of this service category..."
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2 text-base font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-5 py-2 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 rounded-lg shadow transition disabled:opacity-60"
                >
                  {savingCategory
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteCategoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 space-y-5 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Delete Service Category?</h3>
            <p className="text-base text-gray-500">
              This action cannot be undone and will remove this service category.
            </p>
            <div className="flex justify-end gap-4 pt-2">
              <button
                onClick={() => setDeleteCategoryId(null)}
                className="px-5 py-2 text-base text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteCategoryId)}
                disabled={deletingCategory}
                className="px-5 py-2 text-base font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60"
              >
                {deletingCategory ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
