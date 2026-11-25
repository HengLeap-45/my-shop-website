import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  PackageCheck,
  Truck,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getOrderById } from '../services/orderService';
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusMeta,
} from '../utils/formatters';
import { PageSpinner, ErrorBanner } from '../components/LoadingSkeleton';

const TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Preparing', icon: PackageCheck },
  { key: 'shipped', label: 'In Transit', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentTitle(order ? `Order ${order.order_number}` : 'Order Tracking');

  useEffect(() => {
    setLoading(true);
    getOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err.message || 'Unable to load order details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner label="Loading order tracking..." />;

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14">
        <ErrorBanner message={error || 'Order not found.'} />
        <Link
          to="/orders"
          className="mt-5 inline-flex rounded-xl bg-[#0F4C5C] px-5 py-2.5 text-sm font-bold text-white"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  const statusMeta = getOrderStatusMeta(order.status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to My Orders
      </Link>

      {location.state?.justOrdered && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <h2 className="text-base font-extrabold">Order Recorded</h2>
            <p className="mt-1 text-sm text-emerald-900">
              Your order <strong>{order.order_number}</strong> has been created.{' '}
              {order.payment?.status === 'demo_unpaid' &&
                'Note: No real payment was charged because Stripe keys are not configured (Demo Order).'}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
              Order Tracking
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {order.order_number}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Placed on {formatDateTime(order.created_at)}
            </p>
          </div>
          <span className={`rounded-full border px-3.5 py-1.5 text-xs font-bold ${statusMeta.badgeClass}`}>
            {statusMeta.label}
          </span>
        </div>

        {/* Fulfillment Progress Timeline */}
        {order.status === 'cancelled' ? (
          <div className="my-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <XCircle className="h-5 w-5 text-rose-600" aria-hidden="true" />
            <span>This order was cancelled.</span>
          </div>
        ) : (
          <div className="my-8">
            <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TRACKING_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const completed = statusMeta.stepIndex >= idx;
                return (
                  <li
                    key={step.key}
                    aria-current={statusMeta.stepIndex === idx ? 'step' : undefined}
                    className={`rounded-2xl border p-4 ${
                      completed
                        ? 'border-[#0F4C5C]/30 bg-[#0F4C5C]/5 text-[#0F4C5C]'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider">
                      Step {idx + 1}
                    </p>
                    <p className="text-sm font-extrabold">{step.label}</p>
                  </li>
                );
              })}
            </ol>

            {order.tracking_number && (
              <p className="mt-4 rounded-xl bg-[#F5F3EE] px-4 py-3 text-sm text-slate-800">
                Carrier Tracking Number:{' '}
                <strong className="font-mono">{order.tracking_number}</strong>
              </p>
            )}
          </div>
        )}

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-6 md:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
              <MapPin className="h-4 w-4 text-[#0F4C5C]" aria-hidden="true" />
              Shipping Address
            </h2>
            <div className="mt-2.5 text-sm leading-relaxed text-slate-700">
              <p className="font-bold text-slate-900">
                {order.shipping_address?.recipient_name}
              </p>
              <p>{order.shipping_address?.street_address}</p>
              <p>
                {order.shipping_address?.city}, {order.shipping_address?.state}{' '}
                {order.shipping_address?.postal_code}
              </p>
              <p>{order.shipping_address?.country}</p>
              {order.shipping_address?.phone && <p>{order.shipping_address.phone}</p>}
            </div>
          </div>

          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
              <CreditCard className="h-4 w-4 text-[#0F4C5C]" aria-hidden="true" />
              Payment &amp; Totals
            </h2>
            <dl className="mt-2.5 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Payment Status</dt>
                <dd className="font-bold uppercase text-slate-900">
                  {order.payment?.status === 'demo_unpaid'
                    ? 'Demo Order (No Charge)'
                    : order.payment?.status || 'Pending'}
                </dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>Shipping</dt>
                <dd className="font-semibold text-slate-900">
                  {Number(order.shipping_cost) === 0 ? 'Free' : formatCurrency(order.shipping_cost)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-extrabold text-slate-900">
                <dt>Total</dt>
                <dd>{formatCurrency(order.total_amount)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Items */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
            Items Ordered
          </h2>
          <ul className="divide-y divide-slate-100">
            {(order.items || []).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-14 w-14 rounded-xl bg-[#F5F3EE] object-cover"
                    />
                  )}
                  <div>
                    <p className="font-bold text-slate-900">{item.product_name}</p>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(item.line_total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
