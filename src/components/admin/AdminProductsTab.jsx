import { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Search } from 'lucide-react';
import {
  deleteProduct,
  saveProduct,
  uploadProductImage,
} from '../../services/catalogService';
import { validateProductForm } from '../../utils/validators';
import { calculateDiscountedPrice, formatCurrency, slugify } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import ModalDialog from '../ModalDialog';

const EMPTY_PRODUCT = {
  id: '',
  name: '',
  slug: '',
  sku: '',
  category_id: '',
  price: '',
  compare_at_price: '',
  discount_percent: 0,
  stock_quantity: 10,
  image_url: '/images/prod-headphones.jpg',
  description: '',
  is_featured: false,
  is_active: true,
};

export default function AdminProductsTab({ products, categories, onRefresh }) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.category?.name || '').toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setForm({
      ...EMPTY_PRODUCT,
      category_id: categories[0]?.id || '',
    });
    setModalOpen(true);
  };

  const openEdit = (prod) => {
    setForm({
      ...EMPTY_PRODUCT,
      ...prod,
      category_id: prod.category_id || categories[0]?.id || '',
      compare_at_price: prod.compare_at_price ?? '',
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setForm((prev) => ({ ...prev, image_url: url }));
      showToast('Product image uploaded.');
    } catch (err) {
      showToast(err.message || 'Image upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errors = validateProductForm(form);
    if (Object.keys(errors).length > 0) {
      showToast(Object.values(errors)[0], 'error');
      return;
    }

    setSaving(true);
    try {
      await saveProduct({
        ...form,
        slug: form.slug || slugify(form.name),
      });
      await onRefresh();
      setModalOpen(false);
      showToast(form.id ? 'Product updated.' : 'Product added to catalog.');
    } catch (err) {
      showToast(err.message || 'Could not save product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      await onRefresh();
      showToast(`Deleted "${deleteTarget.name}".`, 'info');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || 'Could not delete product.', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Filter products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or SKU..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F4C5C] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0A3642]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Product
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="visually-hidden">Catalog products management table</caption>
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3">Product</th>
                <th scope="col" className="px-5 py-3">Category</th>
                <th scope="col" className="px-5 py-3">Price</th>
                <th scope="col" className="px-5 py-3">Stock</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image_url}
                        alt=""
                        className="h-11 w-11 rounded-lg bg-[#F5F3EE] object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{prod.name}</p>
                        <p className="text-xs text-slate-500">{prod.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{prod.category?.name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-slate-900">
                      {formatCurrency(calculateDiscountedPrice(prod.price, prod.discount_percent))}
                    </span>
                    {prod.discount_percent > 0 && (
                      <span className="ml-1.5 rounded bg-[#C26D2D]/15 px-1.5 py-0.5 text-[11px] font-bold text-[#C26D2D]">
                        -{prod.discount_percent}%
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{prod.stock_quantity}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        prod.is_active !== false
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {prod.is_active !== false ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(prod)}
                        aria-label={`Edit ${prod.name}`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(prod)}
                        aria-label={`Delete ${prod.name}`}
                        className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Dialog */}
      <ModalDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Edit Product' : 'Add New Product'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="p-name" className="mb-1 block text-xs font-bold text-slate-700">
                Product Name <span aria-hidden="true">*</span>
              </label>
              <input
                id="p-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="p-cat" className="mb-1 block text-xs font-bold text-slate-700">
                Category <span aria-hidden="true">*</span>
              </label>
              <select
                id="p-cat"
                required
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="p-sku" className="mb-1 block text-xs font-bold text-slate-700">
                SKU
              </label>
              <input
                id="p-sku"
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="VLR-NEW-001"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="p-price" className="mb-1 block text-xs font-bold text-slate-700">
                Base Price ($) <span aria-hidden="true">*</span>
              </label>
              <input
                id="p-price"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="p-disc" className="mb-1 block text-xs font-bold text-slate-700">
                Discount (%)
              </label>
              <input
                id="p-disc"
                type="number"
                min="0"
                max="95"
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="p-stock" className="mb-1 block text-xs font-bold text-slate-700">
                Stock Quantity <span aria-hidden="true">*</span>
              </label>
              <input
                id="p-stock"
                type="number"
                min="0"
                required
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="p-img-url" className="mb-1 block text-xs font-bold text-slate-700">
                Image URL
              </label>
              <input
                id="p-img-url"
                type="text"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">
                Upload Product Image
              </span>
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-slate-300 p-3">
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="h-14 w-14 rounded-lg bg-[#F5F3EE] object-cover"
                  />
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {uploading ? 'Uploading...' : 'Choose Image File'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleImageUpload}
                    className="visually-hidden"
                  />
                </label>
                <span className="text-xs text-slate-500">JPG, PNG, WebP up to 4MB</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="p-desc" className="mb-1 block text-xs font-bold text-slate-700">
                Description <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="p-desc"
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-6 sm:col-span-2">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#0F4C5C]"
                />
                Featured on Homepage
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active !== false}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#0F4C5C]"
                />
                Active in Storefront
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-xl bg-[#0F4C5C] px-5 py-2 text-sm font-bold text-white hover:bg-[#0A3642] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Delete Confirmation Dialog */}
      <ModalDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to permanently delete{' '}
          <strong className="text-slate-900">{deleteTarget?.name}</strong>? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={() => setDeleteTarget(null)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
          >
            Keep Product
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
          >
            Delete
          </button>
        </div>
      </ModalDialog>
    </div>
  );
}
