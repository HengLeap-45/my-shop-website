import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PageSpinner, ErrorBanner } from '../components/LoadingSkeleton';

export default function CategoriesPage() {
  useDocumentTitle('Product Categories');
  const { categories, products, loading, error, refreshCatalog } = useCatalog();

  if (loading) return <PageSpinner label="Loading product categories..." />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-[#C26D2D]">
          Departments
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Product Categories
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Every collection is curated around durable materials, repairability, and calm everyday
          function.
        </p>
      </div>

      <ErrorBanner message={error} onRetry={refreshCatalog} />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {categories.map((cat) => {
          const count = products.filter(
            (p) => p.category_id === cat.id || p.category?.slug === cat.slug,
          ).length;

          return (
            <Link
              key={cat.id}
              to={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:grid-cols-12"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#F5F3EE] sm:col-span-5 sm:aspect-auto">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  width="600"
                  height="600"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-between p-6 sm:col-span-7 sm:p-8">
                <div>
                  <span className="inline-block rounded-full bg-[#0F4C5C]/10 px-3 py-1 text-xs font-bold text-[#0F4C5C]">
                    {count} {count === 1 ? 'Product' : 'Products'}
                  </span>
                  <h2 className="mt-4 text-2xl font-extrabold text-slate-900 group-hover:text-[#0F4C5C]">
                    {cat.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0F4C5C]">
                  Browse {cat.name}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
