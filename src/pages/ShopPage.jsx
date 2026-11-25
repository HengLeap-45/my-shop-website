import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { calculateDiscountedPrice } from '../utils/formatters';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton, ErrorBanner } from '../components/LoadingSkeleton';

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under-100', label: 'Under $100', min: 0, max: 99.99 },
  { id: '100-200', label: '$100 – $200', min: 100, max: 200 },
  { id: '200-350', label: '$200 – $350', min: 200, max: 350 },
  { id: 'over-350', label: 'Over $350', min: 350.01, max: Infinity },
];

export default function ShopPage() {
  useDocumentTitle('Shop All Products');
  const { products, categories, loading, error, refreshCatalog } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [priceRangeId, setPriceRangeId] = useState(searchParams.get('price') || 'all');
  const [onlyDiscounted, setOnlyDiscounted] = useState(searchParams.get('discount') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setPriceRangeId(searchParams.get('price') || 'all');
    setOnlyDiscounted(searchParams.get('discount') === 'true');
    setSortBy(searchParams.get('sort') || 'popular');
  }, [searchParams]);

  const updateUrlParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'false') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setPriceRangeId('all');
    setOnlyDiscounted(false);
    setSortBy('popular');
    setSearchParams({}, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const range = PRICE_RANGES.find((r) => r.id === priceRangeId) || PRICE_RANGES[0];

    const list = products.filter((p) => {
      if (selectedCategory !== 'all') {
        const catSlug = p.category?.slug;
        if (catSlug !== selectedCategory && p.category_id !== selectedCategory) return false;
      }

      const effective = calculateDiscountedPrice(p.price, p.discount_percent);
      if (effective < range.min || effective > range.max) return false;

      if (onlyDiscounted && !(p.discount_percent > 0)) return false;

      if (q) {
        const haystack = `${p.name} ${p.description} ${p.category?.name || ''} ${p.sku || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      const priceA = calculateDiscountedPrice(a.price, a.discount_percent);
      const priceB = calculateDiscountedPrice(b.price, b.discount_percent);
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'rating') return (b.rating_average || 0) - (a.rating_average || 0);
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      return (b.popularity_score || 0) - (a.popularity_score || 0);
    });
  }, [products, query, selectedCategory, priceRangeId, onlyDiscounted, sortBy]);

  const activeFiltersCount =
    (query.trim() ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (priceRangeId !== 'all' ? 1 : 0) +
    (onlyDiscounted ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
          Velora Catalog
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Shop All Products
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          Browse our full collection. Filter by department, price tier, or special offers, and sort
          by popularity or price.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          {/* Search Input */}
          <div className="md:col-span-4">
            <search>
              <label htmlFor="shop-search" className="mb-1.5 block text-xs font-bold text-slate-700">
                Search Catalog
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="shop-search"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    updateUrlParam('q', e.target.value);
                  }}
                  placeholder="Headphones, kettle, walnut..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm focus:border-[#0F4C5C] focus:bg-white"
                />
              </div>
            </search>
          </div>

          {/* Category Select */}
          <div className="md:col-span-3">
            <label htmlFor="shop-category" className="mb-1.5 block text-xs font-bold text-slate-700">
              Category
            </label>
            <select
              id="shop-category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                updateUrlParam('category', e.target.value);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Select */}
          <div className="md:col-span-2">
            <label htmlFor="shop-price" className="mb-1.5 block text-xs font-bold text-slate-700">
              Price Range
            </label>
            <select
              id="shop-price"
              value={priceRangeId}
              onChange={(e) => {
                setPriceRangeId(e.target.value);
                updateUrlParam('price', e.target.value);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800"
            >
              {PRICE_RANGES.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div className="md:col-span-3">
            <label htmlFor="shop-sort" className="mb-1.5 block text-xs font-bold text-slate-700">
              Sort By
            </label>
            <select
              id="shop-sort"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                updateUrlParam('sort', e.target.value);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800"
            >
              <option value="popular">Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Secondary filter row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={onlyDiscounted}
                onChange={(e) => {
                  setOnlyDiscounted(e.target.checked);
                  updateUrlParam('discount', e.target.checked ? 'true' : '');
                }}
                className="h-4 w-4 rounded accent-[#0F4C5C]"
              />
              On Sale / Discounted Only
            </label>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear Filters ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <ErrorBanner message={error} onRetry={refreshCatalog} />

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-bold text-slate-900">No matching products found</h2>
          <p className="mt-1 text-sm text-slate-600">
            Try clearing one of your filters or searching with a broader term.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-xl bg-[#0F4C5C] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0A3642]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
