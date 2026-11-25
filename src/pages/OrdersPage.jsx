import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getUserOrders } from '../services/orderService';
import { formatCurrency, formatDate, getOrderStatusMeta } from '../utils/formatters';
import { PageSpinner, ErrorBanner } from '../components/LoadingSkeleton';

export default function OrdersPage() {
  useDocumentTitle('My Orders');
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getUserOrders(user.id)
      .then(setOrders)
      .catch((err) => setError(err.message || 'Unable to load your orders.'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) return <PageSpinner label="Loading order history..." />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">Order History</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">My Orders &amp; Tracking</h1>
      </div>

      <ErrorBanner message={error} />

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">No orders placed yet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Once you place an order, you can track fulfillment and delivery status here.
          </p>
          <Link
            to="/shop"
            className="mt-5 inline-flex rounded-xl bg-[#0F4C5C] px-5 py-2.5 text-sm font-bold text-white"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusMeta = getOrderStatusMeta(order.status);
            return (
              <article
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <span className="block text-xs text-slate-500">Order Number</span>
                      <span className="font-extrabold text-slate-900">{order.order_number}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Placed On</span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Total</span>
                      <span className="font-extrabold text-slate-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.badgeClass}`}
                  >
                    {statusMeta.label}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {(order.items || []).slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2.5 text-sm">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="h-12 w-12 rounded-lg bg-[#F5F3EE] object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{item.product_name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {(order.items || []).length > 3 && (
                      <span className="text-xs font-semibold text-slate-500">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
                  >
                    Track Order
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
