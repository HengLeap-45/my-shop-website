/**
 * Currency, date, discount, and order calculation helpers.
 */

export const FREE_SHIPPING_THRESHOLD = 100;
export const STANDARD_SHIPPING_RATE = 9.95;

export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function calculateDiscountedPrice(price, discountPercent = 0) {
  const base = Number(price) || 0;
  const discount = Math.min(95, Math.max(0, Number(discountPercent) || 0));
  if (discount <= 0) return Number(base.toFixed(2));
  return Number((base * (1 - discount / 100)).toFixed(2));
}

export function calculateCartTotals(items = [], shippingMethod = 'standard') {
  let subtotal = 0;
  let originalTotal = 0;

  for (const item of items) {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const basePrice = Number(item.price) || 0;
    const effectivePrice = item.discount_percent > 0
      ? calculateDiscountedPrice(basePrice, item.discount_percent)
      : basePrice;

    subtotal += effectivePrice * qty;
    originalTotal += (item.compare_at_price && item.compare_at_price > effectivePrice
      ? Number(item.compare_at_price)
      : basePrice) * qty;
  }

  subtotal = Number(subtotal.toFixed(2));
  const discountSavings = Number(Math.max(0, originalTotal - subtotal).toFixed(2));

  let shipping = 0;
  if (subtotal > 0) {
    if (shippingMethod === 'express') {
      shipping = 19.95;
    } else {
      shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_RATE;
    }
  }

  const total = Number((subtotal + shipping).toFixed(2));
  const amountToFreeShipping = Number(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2));

  return {
    subtotal,
    discountSavings,
    shipping,
    total,
    amountToFreeShipping,
    itemCount: items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
  };
}

export function getOrderStatusMeta(status) {
  const map = {
    pending: {
      label: 'Pending',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      stepIndex: 0,
    },
    processing: {
      label: 'Processing',
      badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
      stepIndex: 1,
    },
    shipped: {
      label: 'Shipped',
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      stepIndex: 2,
    },
    delivered: {
      label: 'Delivered',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      stepIndex: 3,
    },
    cancelled: {
      label: 'Cancelled',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      stepIndex: -1,
    },
  };
  return map[status] || map.pending;
}

export function generateOrderNumber() {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VLR-${stamp}-${rand}`;
}
