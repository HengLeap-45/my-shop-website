import { DollarSign, ShoppingBag, Users, Package, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate, getOrderStatusMeta } from '../../utils/formatters';

export default function AdminStatsTab({ products, orders, users }) {
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;
  const lowStockProducts = products.filter((p) => (p.stock_quantity ?? 0) <= 8);

  const statusCounts = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(
    (status) => ({
      status,
      meta: getOrderStatusMeta(status),
      count: orders.filter((o) => o.status === status).length,
    }),
  );

  const maxStatusCount = Math.max(1, ...statusCounts.map((s) => s.count));

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gross Revenue
            </span>
            <DollarSign className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Avg. Order: {formatCurrency(avgOrderValue)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Orders
            </span>
            <ShoppingBag className="h-5 w-5 text-[#0F4C5C]" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{orders.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            {orders.filter((o) => o.status === 'pending' || o.status === 'processing').length} awaiting fulfillment
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Catalog Products
            </span>
            <Package className="h-5 w-5 text-[#C26D2D]" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{products.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            {lowStockProducts.length} low-stock alert(s)
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Customer Accounts
            </span>
            <Users className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{users.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            {users.filter((u) => u.is_active !== false).length} active accounts
          </p>
        </div>
      </div>

      {/* Breakdown & Low Stock */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-6">
          <h2 className="text-base font-extrabold text-slate-900">Orders by Status</h2>
          <div className="mt-5 space-y-3.5">
            {statusCounts.map(({ status, meta, count }) => (
              <div key={status}>
                <div className="mb-1 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">{meta.label}</span>
                  <span className="text-slate-900">{count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#0F4C5C] transition-all"
                    style={{ width: `${(count / maxStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            <h2 className="text-base font-extrabold text-slate-900">Low Stock Inventory</h2>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">All products are well stocked.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image_url}
                      alt=""
                      className="h-10 w-10 rounded-lg bg-[#F5F3EE] object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.sku}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                    {p.stock_quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-extrabold text-slate-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="visually-hidden">Recent store orders</caption>
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3">Order #</th>
                <th scope="col" className="px-6 py-3">Customer</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 6).map((ord) => {
                const meta = getOrderStatusMeta(ord.status);
                return (
                  <tr key={ord.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{ord.order_number}</td>
                    <td className="px-6 py-3.5 text-slate-700">{ord.customer_name || 'Customer'}</td>
                    <td className="px-6 py-3.5 text-slate-500">{formatDate(ord.created_at)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-extrabold text-slate-900">
                      {formatCurrency(ord.total_amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
