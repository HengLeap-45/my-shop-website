import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { deleteCategory, saveCategory } from '../../services/catalogService';
import { slugify } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import ModalDialog from '../ModalDialog';

const EMPTY_CATEGORY = {
  id: '',
  name: '',
  slug: '',
  description: '',
  image_url: '/images/prod-headphones.jpg',
  display_order: 1,
};

export default function AdminCategoriesTab({ categories, products, onRefresh }) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_CATEGORY);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm({ ...EMPTY_CATEGORY, display_order: categories.length + 1 });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setForm({ ...EMPTY_CATEGORY, ...cat });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveCategory({ ...form, slug: form.slug || slugify(form.name) });
      await onRefresh();
      setModalOpen(false);
      showToast(form.id ? 'Category updated.' : 'Category created.');
    } catch (err) {
      showToast(err.message || 'Could not save category.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    try {
      await deleteCategory(cat.id);
      await onRefresh();
      showToast(`Deleted category "${cat.name}".`, 'info');
    } catch (err) {
      showToast(err.message || 'Could not delete category.', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Categories ({categories.length})</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F4C5C] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0A3642]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id).length;
          return (
            <article
              key={cat.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={cat.image_url}
                  alt=""
                  className="h-16 w-16 rounded-xl bg-[#F5F3EE] object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900">{cat.name}</h3>
                  <p className="text-xs text-slate-500">
                    /{cat.slug} • {count} products
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-600">{cat.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(cat)}
                  aria-label={`Edit ${cat.name}`}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  aria-label={`Delete ${cat.name}`}
                  className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <ModalDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="cat-name" className="mb-1 block text-xs font-bold text-slate-700">
              Category Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="cat-slug" className="mb-1 block text-xs font-bold text-slate-700">
              URL Slug
            </label>
            <input
              id="cat-slug"
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated-from-name"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="cat-img" className="mb-1 block text-xs font-bold text-slate-700">
              Cover Image Path / URL
            </label>
            <input
              id="cat-img"
              type="text"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="cat-desc" className="mb-1 block text-xs font-bold text-slate-700">
              Description
            </label>
            <textarea
              id="cat-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
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
              disabled={saving}
              className="rounded-xl bg-[#0F4C5C] px-5 py-2 text-sm font-bold text-white hover:bg-[#0A3642]"
            >
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}
