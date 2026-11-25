import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton, ErrorBanner } from '../components/LoadingSkeleton';
import { formatCurrency, FREE_SHIPPING_THRESHOLD } from '../utils/formatters';

export default function HomePage() {
  useDocumentTitle('Curated Modern Goods');
  const { products, categories, loading, error, refreshCatalog } = useCatalog();

  const featuredProducts = products
    .filter((p) => p.is_featured)
    .slice(0, 4);
  const trendingProducts = [...products]
    .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
    .slice(0, 4);
  const discountedProducts = products
    .filter((p) => p.discount_percent > 0)
    .slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-slate-200/70 bg-gradient-to-b from-[#F5F3EE] to-[#FAF9F6]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-6">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0F4C5C]/20 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0F4C5C] shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#C26D2D]" aria-hidden="true" />
              Autumn / Studio Collection 2026
            </span>
            <h1 className="hero-display-title mb-5 font-extrabold text-slate-900">
              Objects crafted for quiet focus &amp; daily ritual.
            </h1>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Discover architectural desk tools, studio acoustics, and tactile homeware engineered
              from honest walnut, brushed steel, and organic textiles.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#0F4C5C] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[#0F4C5C]/15 transition-all hover:-translate-y-0.5 hover:bg-[#0A3642]"
              >
                Explore All Products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50"
              >
                Browse Categories
              </Link>
            </div>

            {/* Trust Stats */}
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-200/80 pt-7">
              <div>
                <dt className="text-xs font-medium text-slate-500">Customer Rating</dt>
                <dd className="mt-1 text-xl font-extrabold text-slate-900">4.85 / 5</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Free Shipping</dt>
                <dd className="mt-1 text-xl font-extrabold text-slate-900">
                  Over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Warranty</dt>
                <dd className="mt-1 text-xl font-extrabold text-slate-900">2-Year Care</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[#EDEAE2] shadow-2xl shadow-slate-900/10">
              <img
                src="/images/hero-lifestyle.jpg"
                alt="Minimalist oak desk with wireless studio headphones, ceramic mug, and brass desk lamp"
                width="1200"
                height="675"
                fetchPriority="high"
                className="aspect-[16/11] w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/60 bg-white/90 px-4 py-3 backdrop-blur-md">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
                    Featured Setup
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    Aether ANC Headphones &amp; Desk Essentials
                  </p>
                </div>
                <Link
                  to="/product/aether-studio-anc-headphones"
                  className="shrink-0 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Bar */}
      <section className="border-b border-slate-200/70 bg-white py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F4C5C]/10 text-[#0F4C5C]">
              <Truck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Fast Carbon-Neutral Delivery</h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Free standard shipping on orders {formatCurrency(FREE_SHIPPING_THRESHOLD)}+.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C26D2D]/10 text-[#C26D2D]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">2-Year Studio Warranty</h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Every hardware and carry piece is backed by repair or replacement.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">30-Day Trial &amp; Returns</h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Try Velora goods in your own space with effortless returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#C26D2D]">
              Curated Departments
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0F4C5C] hover:underline"
          >
            All Categories
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#F5F3EE]">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  width="600"
                  height="450"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F4C5C]">
                  {cat.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{cat.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0F4C5C]">
                  Explore collection
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
              Editor&apos;s Selection
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Featured Essentials
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0F4C5C] hover:underline"
          >
            View All Products
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ErrorBanner message={error} onRetry={refreshCatalog} />

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Seasonal Promo Split Banner */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-[#0F4C5C] text-white shadow-xl">
          <div className="grid grid-cols-1 items-center lg:grid-cols-12">
            <div className="p-8 sm:p-12 lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-200">
                <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                Limited-Time Studio Offers
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Save up to 20% on workspace &amp; acoustic pairings.
              </h2>
              <p className="mt-4 max-w-xl text-base text-slate-200">
                Upgrade your daily desk or kitchen ritual with special seasonal pricing across
                flagship headphones, mechanical keyboards, and precision brew gear.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/shop?discount=true"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#C26D2D] px-6 py-3 text-sm font-bold text-white hover:bg-[#ad5e24]"
                >
                  Shop Discounted Picks
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
                >
                  Our Story
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-6 sm:p-8 lg:col-span-5">
              {discountedProducts.slice(0, 2).map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <img
                    src={p.image_url}
                    alt={p.name}
                    width="300"
                    height="300"
                    loading="lazy"
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  <p className="mt-2.5 truncate text-sm font-bold text-white">{p.name}</p>
                  <p className="text-xs font-semibold text-amber-200">-{p.discount_percent}% OFF</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Picks */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#C26D2D]">
              Community Favorites
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Most Popular Right Now
            </h2>
          </div>
          <Link
            to="/shop?sort=popular"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0F4C5C] hover:underline"
          >
            Sort by Popularity
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
