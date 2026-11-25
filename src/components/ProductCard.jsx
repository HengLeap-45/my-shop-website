import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { calculateDiscountedPrice, formatCurrency } from '../utils/formatters';
import RatingStars from './RatingStars';

export default function ProductCard({ product, priority = false }) {
  const { addToCart, toggleFavorite, isFavorite, items } = useCart();

  const effectivePrice = calculateDiscountedPrice(product.price, product.discount_percent);
  const hasDiscount = product.discount_percent > 0;
  const originalPrice = product.compare_at_price && product.compare_at_price > effectivePrice
    ? product.compare_at_price
    : hasDiscount
      ? product.price
      : null;

  const favorited = isFavorite(product.id);
  const inCart = items.some((i) => i.id === product.id);
  const outOfStock = (product.stock_quantity ?? 0) <= 0;
  const lowStock = !outOfStock && product.stock_quantity <= 6;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F3EE]">
        <Link
          to={`/product/${product.slug}`}
          className="block h-full w-full"
          aria-label={`View ${product.name}`}
        >
          <img
            src={product.image_url}
            alt={product.name}
            width="600"
            height="600"
            loading={priority ? undefined : 'lazy'}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="inline-flex items-center rounded-full bg-[#C26D2D] px-2.5 py-1 text-xs font-bold tracking-wide text-white shadow-sm">
              -{product.discount_percent}% OFF
            </span>
          )}
          {outOfStock ? (
            <span className="inline-flex items-center rounded-full bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-white">
              Sold Out
            </span>
          ) : lowStock ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
              Only {product.stock_quantity} left
            </span>
          ) : null}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={() => toggleFavorite(product)}
          aria-pressed={favorited}
          aria-label={favorited ? `Remove ${product.name} from favorites` : `Save ${product.name} to favorites`}
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all ${
            favorited
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-white/70 bg-white/85 text-slate-600 hover:bg-white hover:text-rose-600'
          }`}
        >
          <Heart className={`h-4 w-4 ${favorited ? 'fill-rose-500' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0F4C5C]">
            {product.category?.name || 'Collection'}
          </span>
          <RatingStars rating={product.rating_average} count={product.review_count} />
        </div>

        <h3 className="mb-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#0F4C5C]">
          <Link to={`/product/${product.slug}`} className="focus:outline-none">
            {product.name}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-2 text-sm text-slate-600">
          {product.description}
        </p>

        {/* Price + Action */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-slate-900">
              {formatCurrency(effectivePrice)}
            </span>
            {originalPrice && (
              <span className="text-sm text-slate-400 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={() => addToCart(product, 1)}
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              outOfStock
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : inCart
                  ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100'
                  : 'bg-[#0F4C5C] text-white hover:bg-[#0A3642] active:scale-[0.98]'
            }`}
          >
            {inCart ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
