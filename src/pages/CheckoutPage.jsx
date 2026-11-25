import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFormAriaSync } from '../hooks/useFormAriaSync';
import { getAddresses, saveAddress } from '../services/accountService';
import { createOrder, createStripeCheckoutSession } from '../services/orderService';
import { isStripeConfigured } from '../services/supabaseClient';
import { validateAddressForm } from '../utils/validators';
import { formatCurrency } from '../utils/formatters';

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const { user, isAuthenticated } = useAuth();
  const { items, totals, shippingMethod, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const formRef = useRef(null);
  useFormAriaSync(formRef);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveToBook, setSaveToBook] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [address, setAddress] = useState({
    recipient_name: user?.full_name || '',
    phone: user?.phone || '',
    street_address: '',
    apartment: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    notes: '',
  });

  useEffect(() => {
    if (!user?.id) return;
    getAddresses(user.id)
      .then((list) => {
        setSavedAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) {
          setSelectedAddressId(def.id);
          setAddress((prev) => ({
            ...prev,
            recipient_name: def.recipient_name,
            phone: def.phone || '',
            street_address: def.street_address,
            apartment: def.apartment || '',
            city: def.city,
            state: def.state || '',
            postal_code: def.postal_code || '',
            country: def.country || 'United States',
          }));
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const handleSelectSavedAddress = (addrId) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setAddress((prev) => ({
        ...prev,
        recipient_name: user?.full_name || '',
        phone: user?.phone || '',
        street_address: '',
        apartment: '',
        city: '',
        state: '',
        postal_code: '',
      }));
      return;
    }
    const found = savedAddresses.find((a) => a.id === addrId);
    if (found) {
      setAddress((prev) => ({
        ...prev,
        recipient_name: found.recipient_name,
        phone: found.phone || '',
        street_address: found.street_address,
        apartment: found.apartment || '',
        city: found.city,
        state: found.state || '',
        postal_code: found.postal_code || '',
        country: found.country || 'United States',
      }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-600">Add items to your cart before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-xl bg-[#0F4C5C] px-6 py-3 text-sm font-bold text-white"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F4C5C]/10 text-[#0F4C5C]">
          <Lock className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Sign in to complete checkout</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your cart items are saved. Sign in or create an account so we can attach your order
          tracking and saved shipping addresses.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            state={{ from: '/checkout' }}
            className="rounded-xl bg-[#0F4C5C] px-6 py-3 text-sm font-bold text-white hover:bg-[#0A3642]"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            state={{ from: '/checkout' }}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    const errors = validateAddressForm(address);
    if (Object.keys(errors).length > 0) {
      const firstMsg = Object.values(errors)[0];
      setFormError(firstMsg);
      return;
    }

    setSubmitting(true);
    try {
      if (selectedAddressId === 'new' && saveToBook) {
        await saveAddress(user.id, {
          ...address,
          label: 'Shipping',
          is_default: savedAddresses.length === 0,
        }).catch(() => {});
      }

      const createdOrder = await createOrder({
        user,
        items,
        subtotal: totals.subtotal,
        shippingCost: totals.shipping,
        discountTotal: totals.discountSavings,
        totalAmount: totals.total,
        shippingAddress: {
          recipient_name: address.recipient_name,
          phone: address.phone,
          street_address: address.street_address,
          apartment: address.apartment,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country,
          shipping_method: shippingMethod,
        },
        notes: address.notes,
        paymentMode: isStripeConfigured ? 'stripe' : 'demo',
      });

      if (isStripeConfigured) {
        const session = await createStripeCheckoutSession({
          orderId: createdOrder.id,
          items,
          customerEmail: user.email,
        });
        await clearCart();
        window.location.assign(session.url);
        return;
      }

      await clearCart();
      showToast(`Order ${createdOrder.order_number} recorded in Demo Mode.`);
      navigate(`/orders/${createdOrder.id}`, { state: { justOrdered: true } });
    } catch (err) {
      setFormError(err.message || 'Could not place your order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/cart"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Cart
      </Link>

      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900">
        Secure Checkout
      </h1>

      <form
        ref={formRef}
        onSubmit={handlePlaceOrder}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12"
      >
        {/* Left Column: Shipping & Payment */}
        <div className="space-y-6 lg:col-span-7">
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          {/* Saved Address Picker */}
          {savedAddresses.length > 0 && (
            <fieldset className="rounded-2xl border border-slate-200 bg-white p-6">
              <legend className="px-1 text-base font-extrabold text-slate-900">
                Select Shipping Address
              </legend>
              <div className="mt-3 space-y-2.5">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 text-sm has-[:checked]:border-[#0F4C5C] has-[:checked]:bg-[#0F4C5C]/5"
                  >
                    <input
                      type="radio"
                      name="saved_address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => handleSelectSavedAddress(addr.id)}
                      className="mt-1 accent-[#0F4C5C]"
                    />
                    <div>
                      <p className="font-bold text-slate-900">
                        {addr.label} — {addr.recipient_name}
                      </p>
                      <p className="text-slate-600">
                        {addr.street_address}, {addr.city} {addr.state} {addr.postal_code},{' '}
                        {addr.country}
                      </p>
                    </div>
                  </label>
                ))}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-sm font-semibold has-[:checked]:border-[#0F4C5C] has-[:checked]:bg-[#0F4C5C]/5">
                  <input
                    type="radio"
                    name="saved_address"
                    checked={selectedAddressId === 'new'}
                    onChange={() => handleSelectSavedAddress('new')}
                    className="accent-[#0F4C5C]"
                  />
                  Use a different shipping address
                </label>
              </div>
            </fieldset>
          )}

          {/* Shipping Address Form */}
          <fieldset className="rounded-2xl border border-slate-200 bg-white p-6">
            <legend className="flex items-center gap-2 px-1 text-base font-extrabold text-slate-900">
              <MapPin className="h-4 w-4 text-[#0F4C5C]" aria-hidden="true" />
              Shipping Details
            </legend>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="ship-name" className="mb-1 block text-xs font-bold text-slate-700">
                  Full Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="ship-name"
                  name="recipient_name"
                  type="text"
                  required
                  autoComplete="shipping name"
                  value={address.recipient_name}
                  onChange={(e) => setAddress({ ...address, recipient_name: e.target.value })}
                  className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
                <div className="velora-error-msg">Full name is required.</div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="ship-street" className="mb-1 block text-xs font-bold text-slate-700">
                  Street Address <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="ship-street"
                  name="street_address"
                  rows={2}
                  required
                  autoComplete="shipping street-address"
                  value={address.street_address}
                  onChange={(e) => setAddress({ ...address, street_address: e.target.value })}
                  className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
                <div className="velora-error-msg">Street address is required.</div>
              </div>

              <div>
                <label htmlFor="ship-city" className="mb-1 block text-xs font-bold text-slate-700">
                  City <span aria-hidden="true">*</span>
                </label>
                <input
                  id="ship-city"
                  name="city"
                  type="text"
                  required
                  autoComplete="shipping address-level2"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
                <div className="velora-error-msg">City is required.</div>
              </div>

              <div>
                <label htmlFor="ship-state" className="mb-1 block text-xs font-bold text-slate-700">
                  State / Province
                </label>
                <input
                  id="ship-state"
                  name="state"
                  type="text"
                  autoComplete="shipping address-level1"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label htmlFor="ship-postal" className="mb-1 block text-xs font-bold text-slate-700">
                  Postal / ZIP Code
                </label>
                <input
                  id="ship-postal"
                  name="postal_code"
                  type="text"
                  autoComplete="shipping postal-code"
                  value={address.postal_code}
                  onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                  className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label htmlFor="ship-phone" className="mb-1 block text-xs font-bold text-slate-700">
                  Phone Number
                </label>
                <input
                  id="ship-phone"
                  name="phone"
                  type="tel"
                  autoComplete="shipping tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="ship-country" className="mb-1 block text-xs font-bold text-slate-700">
                  Country <span aria-hidden="true">*</span>
                </label>
                <input
                  id="ship-country"
                  name="country"
                  type="text"
                  required
                  autoComplete="shipping country-name"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="velora-input w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              {selectedAddressId === 'new' && (
                <div className="sm:col-span-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={saveToBook}
                      onChange={(e) => setSaveToBook(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#0F4C5C]"
                    />
                    Save this address to my account
                  </label>
                </div>
              )}

              <div className="sm:col-span-2">
                <label htmlFor="order-notes" className="mb-1 block text-xs font-bold text-slate-700">
                  Delivery Notes (Optional)
                </label>
                <input
                  id="order-notes"
                  type="text"
                  value={address.notes}
                  onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                  placeholder="Gate code, leave with concierge, etc."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </fieldset>

          {/* Payment Section (Honest Stripe Integration Status) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#0F4C5C]" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Payment Provider</h2>
            </div>

            {isStripeConfigured ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
                <div>
                  <p className="font-bold">Stripe Checkout Configured</p>
                  <p className="mt-0.5 text-emerald-800">
                    You will be redirected to Stripe&apos;s encrypted hosted checkout page to
                    complete payment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-bold">Payment Integration Not Configured (Demo Checkout)</p>
                <p className="mt-1 leading-relaxed text-amber-900">
                  Stripe live/test keys (<code>VITE_STRIPE_PUBLISHABLE_KEY</code> and{' '}
                  <code>VITE_STRIPE_CHECKOUT_ENDPOINT</code>) are not configured in{' '}
                  <code>.env.local</code>. No real card will be charged and no payment is processed.
                  Submitting below records a demo order marked <strong>demo_unpaid</strong> so you
                  can inspect order history and admin tracking.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Order Review */}
        <aside className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-extrabold text-slate-900">Order Review</h2>

            <ul className="mt-4 divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg bg-[#F5F3EE] object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(item.effective_price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2.5 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-slate-900">{formatCurrency(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>Shipping ({shippingMethod})</dt>
                <dd className="font-semibold text-slate-900">
                  {totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-extrabold text-slate-900">
                <dt>Total</dt>
                <dd>{formatCurrency(totals.total)}</dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F4C5C] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#0A3642] disabled:opacity-60"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              {submitting
                ? 'Processing...'
                : isStripeConfigured
                  ? `Pay ${formatCurrency(totals.total)} via Stripe`
                  : `Place Demo Order (${formatCurrency(totals.total)} — No Charge)`}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
