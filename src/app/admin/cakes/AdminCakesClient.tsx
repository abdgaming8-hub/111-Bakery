"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CakeImage } from "@/components/CakeImage";
import { formatPrice, calculate1kgPrice } from "@/lib/utils";
import { Cake as CakeModel } from "@prisma/client";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

const CATEGORIES = ["Birthday", "Anniversary", "Kids", "Classics"];

interface AdminCakesClientProps {
  initialCakes: CakeModel[];
}

export function AdminCakesClient({ initialCakes }: AdminCakesClientProps) {
  const router = useRouter();
  const [cakes, setCakes] = useState<CakeModel[]>(initialCakes);

  // Form Modal States (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCake, setEditingCake] = useState<CakeModel | null>(null);

  // Delete confirmation modal state
  const [deletingCake, setDeletingCake] = useState<CakeModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("Classics");
  const [formBasePrice, setFormBasePrice] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formIsAvailable, setFormIsAvailable] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingCake(null);
    setFormName("");
    setFormDescription("");
    setFormCategory("Classics");
    setFormBasePrice("");
    setFormImageUrl("");
    setFormIsAvailable(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cake: CakeModel) => {
    setEditingCake(cake);
    setFormName(cake.name);
    setFormDescription(cake.description);
    setFormCategory(cake.category);
    setFormBasePrice(String(cake.basePrice));
    setFormImageUrl(cake.imageUrl);
    setFormIsAvailable(cake.isAvailable);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (cakeId: string) => {
    setTogglingId(cakeId);
    try {
      const res = await fetch(`/api/admin/cakes/${cakeId}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        setCakes((prev) =>
          prev.map((c) => (c.id === cakeId ? { ...c, isAvailable: !c.isAvailable } : c))
        );
        router.refresh();
      } else {
        alert(data.error || "Failed to toggle availability");
      }
    } catch (e) {
      alert("Error toggling availability");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteCake = async () => {
    if (!deletingCake) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/cakes/${deletingCake.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setCakes((prev) => prev.filter((c) => c.id !== deletingCake.id));
        setDeletingCake(null);
        router.refresh();
      } else {
        alert(data.error || "Failed to delete cake");
      }
    } catch (e) {
      alert("Error deleting cake");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const price = parseFloat(formBasePrice);
    if (isNaN(price) || price <= 0) {
      setFormError("Base price must be a valid positive number.");
      return;
    }

    if (!formImageUrl.trim()) {
      setFormError("Please enter a valid image URL.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: formName.trim(),
      description: formDescription.trim(),
      category: formCategory,
      basePrice: price,
      imageUrl: formImageUrl.trim(),
      isAvailable: formIsAvailable,
    };

    try {
      const url = editingCake
        ? `/api/admin/cakes/${editingCake.id}`
        : "/api/admin/cakes";
      const method = editingCake ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to save cake.");
        setIsSubmitting(false);
        return;
      }

      if (editingCake) {
        setCakes((prev) =>
          prev.map((c) => (c.id === editingCake.id ? data.cake : c))
        );
      } else {
        setCakes((prev) => [data.cake, ...prev]);
      }

      setIsModalOpen(false);
      setIsSubmitting(false);
      router.refresh();
    } catch (err) {
      setFormError("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
            Cake Catalogue Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Create, modify prices, toggle out-of-stock availability, or delete celebration cake designs.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-neutral-950 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Cake</span>
        </button>
      </div>

      {/* Cakes Table (Responsive: horizontally scrollable on mobile) */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Cake</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">0.5kg Base</th>
                <th className="px-5 py-3.5">1.0kg Price</th>
                <th className="px-5 py-3.5">Stock Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {cakes.map((cake) => {
                const isToggling = togglingId === cake.id;
                const price1kg = calculate1kgPrice(cake.basePrice);

                return (
                  <tr key={cake.id} className="hover:bg-neutral-50/75 transition-colors">
                    {/* Cake info with thumbnail */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden relative shrink-0 border border-neutral-200">
                          <CakeImage src={cake.imageUrl} alt={cake.name} fill />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-neutral-950 truncate text-sm">
                            {cake.name}
                          </p>
                          <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                            {cake.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded bg-neutral-100 text-neutral-800 font-medium">
                        {cake.category}
                      </span>
                    </td>

                    {/* 0.5kg Base Price */}
                    <td className="px-5 py-4 font-mono font-bold text-neutral-900 text-sm">
                      {formatPrice(cake.basePrice)}
                    </td>

                    {/* 1.0kg Price */}
                    <td className="px-5 py-4 font-mono text-neutral-600 text-sm">
                      {formatPrice(price1kg)}
                    </td>

                    {/* Availability Toggle */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleAvailability(cake.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                          cake.isAvailable
                            ? "bg-white text-neutral-900 border-neutral-300 hover:border-neutral-900"
                            : "bg-neutral-100 text-neutral-400 border-neutral-200 line-through"
                        }`}
                        title="Click to toggle availability"
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : cake.isAvailable ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        )}
                        <span>{cake.isAvailable ? "Available" : "Out of Stock"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(cake)}
                          className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded transition-colors"
                          title="Edit Cake"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCake(cake)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Cake"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Cake Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-bold text-neutral-950">
                {editingCake ? "Edit Cake Details" : "Add New Cake"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Cake Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Pistachio Raspberry Tart"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Base Price (0.5kg) ₹
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="10"
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(e.target.value)}
                    placeholder="e.g. 749"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  {formBasePrice && !isNaN(parseFloat(formBasePrice)) && (
                    <p className="text-[10px] text-neutral-500 mt-1">
                      1kg auto-calculates to {formatPrice(calculate1kgPrice(parseFloat(formBasePrice)))}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="A rich artisanal description of flavours, layers, sponge and frosting..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Image URL (Unsplash or direct image link)
                </label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={formIsAvailable}
                  onChange={(e) => setFormIsAvailable(e.target.checked)}
                  className="h-4 w-4 text-neutral-950 border-neutral-300 rounded focus:ring-neutral-900"
                />
                <label htmlFor="availCheck" className="text-xs font-semibold text-neutral-800 cursor-pointer">
                  Available in store for customer orders
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-neutral-950 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCake ? "Save Changes" : "Create Cake"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCake && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-neutral-200 rounded-xl p-6 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 shrink-0">
                <AlertTriangle className="w-5 h-5 text-neutral-800" />
              </div>
              <h3 className="text-lg font-bold text-neutral-950">
                Delete &ldquo;{deletingCake.name}&rdquo;?
              </h3>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              This cake will be permanently removed from the active catalogue. Past customer orders will retain their historic name and price snapshots.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCake(null)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteCake}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
