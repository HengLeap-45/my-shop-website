import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { addReview, getProductBySlug, getReviewsByProduct } from '../services/catalogService';
import {
  calculateDiscountedPrice,
  formatCurrency,
  formatDate,
  FREE_SHIPPING_THRESHOLD,
} from '../utils/formatters';
import RatingStars from '../components/RatingStars';
import ProductCard from '../components/ProductCard';
import { PageSpinner, ErrorBanner } from '../components/LoadingSkeleton';

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const { products, refreshCatalog } = useCatalog();
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useDocumentTitle(product?.name || 'Product Details');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setQuantity(1);

    getProductBySlug(slug)
      .then(async (prod) => {
        if (!active) return;
        setProduct(prod);
        setActiveImage(prod.image_url);
        const revList = await getReviewsByProduct(prod.id);
        if (active) setReviews(revList);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load product.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) return <PageSpinner label="Loading product details..." />;

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorBanner message={error || 'Product not found.'} />
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-xl bg-[#0F4C5C] px-5 py-2.5 text-sm font-bold text-white"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const gallery =
    Array.isArray(product.gallery_urls) && product.gallery_urls.length > 0
      ? Array.from(new Set([product.image_url, ...product.gallery_urls]))
      : [product.image_url];

  const effectivePrice = calculateDiscountedPrice(product.price, product.discount_percent);
  const originalPrice =
    product.compare_at_price && product.compare_at_price > effectivePrice
      ? product.compare_at_price
      : product.discount_percent > 0
        ? product.price
        : null;

  const favorited = isFavorite(product.id);
  const outOfStock = (product.stock_quantity ?? 0) <= 0;
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to submit a review.', 'error');
      return;
    }
    if (!reviewComment.trim()) {
      showToast('Please write a review comment.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const created = await addReview({
        product_id: product.id,
        user_id: user.id,
        author_name: user.full_name || user.email,
        rating,
        title: reviewTitle || 'Customer Review',
        comment: reviewComment,
      });
      setReviews((prev) => {
        const filtered = prev.filter((r) => r.user_id !== user.id);
        return [created, ...filtered];
      });
      setReviewTitle('');
      setReviewComment('');
      showToast('Thank you! Your review has been published.');
      refreshCatalog();
    } catch (err) {
      showToast(err.message || 'Could not submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-slate-900">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link to="/shop" className="hover:text-slate-900">
          Shop
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <Link
              to={`/shop?category=${encodeURIComponent(product.category.slug)}`}
              className="hover:text-slate-900"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="truncate text-slate-900">{product.name}</span>
      </nav>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Gallery */}
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-[#F5F3EE]">
            <img
              src={activeImage || product.image_url}
              alt={product.name}
              width="800"
              height="800"
              className="aspect-square w-full object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={imgUrl + idx}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  aria-label={`View image ${idx + 1} of ${product.name}`}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#F5F3EE] transition-all ${
                    activeImage === imgUrl
                      ? 'border-[#0F4C5C] ring-2 ring-[#0F4C5C]/20'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col lg:col-span-6">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#0F4C5C]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
              {product.category?.name || 'Velora Collection'}
            </span>
            {product.sku && (
              <span className="text-xs font-medium text-slate-500">SKU: {product.sku}</span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-4">
            <RatingStars rating={product.rating_average} count={reviews.length} size="md" />
            <a href="#reviews" className="text-xs font-semibold text-[#0F4C5C] hover:underline">
              Read reviews
            </a>
          </div>

          {/* Pricing */}
          <div className="mt-6 flex flex-wrap items-baseline gap-3 border-y border-slate-200 py-5">
            <span className="text-3xl font-extrabold text-slate-900">
              {formatCurrency(effectivePrice)}
            </span>
            {originalPrice && (
              <span className="text-lg text-slate-400 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
            {product.discount_percent > 0 && (
              <span className="rounded-full bg-[#C26D2D] px-3 py-1 text-xs font-bold text-white">
                Save {product.discount_percent}%
              </span>
            )}
          </div>

          <p className="mt-6 text-base leading-relaxed text-slate-600">{product.description}</p>

          {/* Stock Indicator */}
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold">
            {outOfStock ? (
              <span className="text-rose-600">Currently out of stock</span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-700">
                  In stock ({product.stock_quantity} available)
                </span>
              </>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-slate-300 bg-white">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || outOfStock}
                className="flex h-12 w-11 items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-slate-900">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 99, q + 1))}
                disabled={outOfStock || quantity >= (product.stock_quantity || 99)}
                className="flex h-12 w-11 items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              disabled={outOfStock}
              onClick={() => addToCart(product, quantity)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F4C5C] px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0A3642] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              type="button"
              onClick={() => toggleFavorite(product)}
              aria-pressed={favorited}
              aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
              className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
                favorited
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${favorited ? 'fill-rose-500' : ''}`} aria-hidden="true" />
            </button>
          </div>

          {/* Specifications */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900">
                Specifications
              </h2>
              <dl className="divide-y divide-slate-100 text-sm">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between gap-4 py-2.5">
                    <dt className="font-medium text-slate-500">{key}</dt>
                    <dd className="text-right font-semibold text-slate-900">{String(val)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Guarantees */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-[#F5F3EE] p-3.5 text-xs font-medium text-slate-700">
              <Truck className="h-4 w-4 shrink-0 text-[#0F4C5C]" aria-hidden="true" />
              Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[#F5F3EE] p-3.5 text-xs font-medium text-slate-700">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#0F4C5C]" aria-hidden="true" />
              2-year warranty &amp; 30-day returns
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section id="reviews" className="mt-16 border-t border-slate-200 pt-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-extrabold text-slate-900">Customer Reviews</h2>
            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={product.rating_average} count={reviews.length} size="lg" />
            </div>

            {/* Write a review */}
            <form
              onSubmit={handleReviewSubmit}
              className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"
            >
              <h3 className="text-base font-bold text-slate-900">Write a Review</h3>
              {!isAuthenticated && (
                <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-900">
                  Please{' '}
                  <Link to="/login" className="font-bold underline">
                    sign in
                  </Link>{' '}
                  to publish a review.
                </p>
              )}

              <div className="mt-4 space-y-4">
                <div>
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">Your Rating</span>
                  <RatingStars rating={rating} interactive onChange={setRating} size="lg" />
                </div>

                <div>
                  <label htmlFor="review-title" className="mb-1.5 block text-xs font-bold text-slate-700">
                    Headline
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="review-comment" className="mb-1.5 block text-xs font-bold text-slate-700">
                    Review <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="review-comment"
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="What stood out about build quality, comfort, or performance?"
                    className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview || !isAuthenticated}
                  className="w-full rounded-xl bg-[#0F4C5C] py-3 text-sm font-bold text-white hover:bg-[#0A3642] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingReview ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4 lg:col-span-7">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                No reviews yet. Be the first to review {product.name}.
              </div>
            ) : (
              reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <RatingStars rating={rev.rating} />
                    <span className="text-xs text-slate-500">{formatDate(rev.created_at)}</span>
                  </div>
                  {rev.title && (
                    <h3 className="mt-2.5 text-base font-bold text-slate-900">{rev.title}</h3>
                  )}
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{rev.comment}</p>
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    {rev.author_name}
                    {rev.is_verified_purchase && (
                      <span className="ml-2 text-emerald-700">Verified Buyer</span>
                    )}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="mb-6 text-2xl font-extrabold text-slate-900">You May Also Like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
