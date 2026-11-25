import { useState } from 'react';
import { Eye } from 'lucide-react';
import { updateOrderStatus } from '../../services/orderService';
import { formatCurrency, formatDateTime, getOrderStatusMeta } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import ModalDialog from '../ModalDialog';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersTab({ orders, onRefresh }) {
  const { showToast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusInput, setStatusInput] = useState('pending');
  const [trackingInput, setTrackingInput] = useState('');
  const [saving, setSaving] = useState(false);

  const openOrder = (order) => {
    setSelectedOrder(order);
    setStatusInput(order.status);
    setTrackingInput(order.tracking_number || '');
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSaving(true);
    try {
      await updateOrderStatus(selectedOrder.id, {
        status: statusInput,
        tracking_number: trackingInput,
      });
      await onRefresh();
      setSelectedOrder(null);
      showToast(`Order ${selectedOrder.order_number} updated to ${statusInput}.`);
    } catch (err) {
      showToast(err.message || 'Could not update order.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="visually-hidden">All customer orders</caption>
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3">Order #</th>
                <th scope="col" className="px-5 py-3">Customer</th>
                <th scope="col" className="px-5 py-3">Placed</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Total</th>
                <th scope="col" className="px-5 py-3 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => {
                const meta = getOrderStatusMeta(ord.status);
                return (
                  <tr key={ord.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{ord.order_number}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{ord.customer_name || 'Customer'}</p>
                      <p className="text-xs text-slate-500">{ord.customer_email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDateTime(ord.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-slate-900">
                      {formatCurrency(ord.total_amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openOrder(ord)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ModalDialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Manage Order ${selectedOrder?.order_number || ''}`}
      >
        {selectedOrder && (
          <form onSubmit={handleUpdateOrder} className="space-y-5">
            <div className="rounded-xl bg-[#F5F3EE] p-4 text-sm">
              <p className="font-bold text-slate-900">
                {selectedOrder.shipping_address?.recipient_name}
              </p>
              <p className="text-slate-600">
                {selectedOrder.shipping_address?.street_address},{' '}
                {selectedOrder.shipping_address?.city} {selectedOrder.shipping_address?.state}{' '}
                {selectedOrder.shipping_address?.postal_code}
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Items
              </h2>
              <ul className="divide-y divide-slate-100 text-sm">
                {(selectedOrder.items || []).map((item) => (
                  <li key={item.id} className="flex justify-between py-2">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-bold">{formatCurrency(item.line_total)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ord-status" className="mb-1 block text-xs font-bold text-slate-700">
                  Order Status
                </label>
                <select
                  id="ord-status"
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {getOrderStatusMeta(st).label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ord-track" className="mb-1 block text-xs font-bold text-slate-700">
                  Tracking Number
                </label>
                <input
                  id="ord-track"
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="1Z999AA..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#0F4C5C] px-5 py-2 text-sm font-bold text-white hover:bg-[#0A3642]"
              >
                {saving ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </form>
        )}
      </ModalDialog>
    </div>
  );
}
