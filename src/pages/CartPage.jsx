import { Link, useNavigate } from 'react-router-dom';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCurrency, FREE_SHIPPING_THRESHOLD } from '../utils/formatters';

export default function CartPage() {
  useDocumentTitle('Shopping Cart');
  const {
    items,
    totals,
    shippingMethod,
    setShippingMethod,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const progressPercent = Math.min(
    100,
    Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F3EE] text-[#0F4C5C]">
          <ShoppingBag className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Your shopping cart is empty</h1>
        <p className="mt-2 text-slate-600">
          Explore our curated studio essentials and add items to begin your order.
        </p>
        <Link
          to="/shop"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0F4C5C] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#0A3642]"
        >
          Start Shopping
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Shopping Cart</h1>
          <p className="mt-1 text-sm text-slate-600">
            {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cart Items List */}
        <div className="space-y-4 lg:col-span-8">
          {/* Free Shipping Progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Truck className="h-4 w-4 text-[#0F4C5C]" aria-hidden="true" />
              {totals.amountToFreeShipping > 0 ? (
                <span>
                  Add <strong>{formatCurrency(totals.amountToFreeShipping)}</strong> more to unlock
                  free standard shipping!
                </span>
              ) : (
                <span className="text-emerald-700">
                  You&apos;ve unlocked complimentary standard shipping!
                </span>
              )}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#0F4C5C] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <Link
                    to={`/product/${item.slug}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F5F3EE]"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      width="120"
                      height="120"
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/product/${item.slug}`}
                      className="text-base font-bold text-slate-900 hover:text-[#0F4C5C]"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.effective_price)}
                      </span>
                      {item.discount_percent > 0 && (
                        <>
                          <span className="text-slate-400 line-through">
                            {formatCurrency(item.price)}
                          </span>
                          <span className="rounded bg-[#C26D2D]/15 px-1.5 py-0.5 text-xs font-bold text-[#C26D2D]">
                            -{item.discount_percent}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  {/* Quantity Stepper */}
                  <div className="flex items-center rounded-xl border border-slate-300">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-10 w-10 items-center justify-center text-slate-600 hover:text-slate-900"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= (item.stock_quantity || 99)}
                      className="flex h-10 w-10 items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="w-24 text-right font-extrabold text-slate-900">
                    {formatCurrency(item.effective_price * item.quantity)}
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Order Summary */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-extrabold text-slate-900">Order Summary</h2>

            {/* Shipping Selector */}
            <fieldset className="mt-5 space-y-2.5">
              <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Shipping Option
              </legend>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 text-sm has-[:checked]:border-[#0F4C5C] has-[:checked]:bg-[#0F4C5C]/5">
                <span className="flex items-center gap-2.5 font-medium">
                  <input
                    type="radio"
                    name="shipping_method"
                    value="standard"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="accent-[#0F4C5C]"
                  />
                  Standard (3–5 days)
                </span>
                <span className="font-bold">
                  {totals.subtotal >= FREE_SHIPPING_THRESHOLD ? 'Free' : '$9.95'}
                </span>
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 text-sm has-[:checked]:border-[#0F4C5C] has-[:checked]:bg-[#0F4C5C]/5">
                <span className="flex items-center gap-2.5 font-medium">
                  <input
                    type="radio"
                    name="shipping_method"
                    value="express"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="accent-[#0F4C5C]"
                  />
                  Express Air (1–2 days)
                </span>
                <span className="font-bold">$19.95</span>
              </label>
            </fieldset>

            <dl className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-slate-900">{formatCurrency(totals.subtotal)}</dd>
              </div>
              {totals.discountSavings > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount Savings</dt>
                  <dd className="font-semibold">-{formatCurrency(totals.discountSavings)}</dd>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <dt>Estimated Shipping</dt>
                <dd className="font-semibold text-slate-900">
                  {totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
                <dt>Total</dt>
                <dd>{formatCurrency(totals.total)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F4C5C] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#0A3642]"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <Link
              to="/shop"
              className="mt-3 block text-center text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
