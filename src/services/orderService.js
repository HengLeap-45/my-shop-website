import {
  supabase,
  isSupabaseConfigured,
  isStripeConfigured,
  stripeCheckoutEndpoint,
} from './supabaseClient';
import { readStorage, writeStorage } from './storageService';
import { SAMPLE_ORDERS } from '../data/sampleData';
import { generateOrderNumber } from '../utils/formatters';

const ORDERS_KEY = 'demo_orders';

function ensureDemoOrders() {
  let orders = readStorage(ORDERS_KEY);
  if (!Array.isArray(orders) || orders.length === 0) {
    orders = SAMPLE_ORDERS;
    writeStorage(ORDERS_KEY, orders);
  }
  return orders;
}

export async function getUserOrders(userId) {
  if (!userId) return [];
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*), payment:payments(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map((o) => ({
      ...o,
      payment: Array.isArray(o.payment) ? o.payment[0] || null : o.payment,
    }));
  }
  return ensureDemoOrders()
    .filter((o) => o.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getAllOrders() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*), payment:payments(*), customer:users(full_name, email)')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map((o) => ({
      ...o,
      customer_name: o.customer?.full_name || o.shipping_address?.recipient_name || 'Customer',
      customer_email: o.customer?.email || '',
      payment: Array.isArray(o.payment) ? o.payment[0] || null : o.payment,
    }));
  }
  return [...ensureDemoOrders()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getOrderById(orderId) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*), payment:payments(*)')
      .eq('id', orderId)
      .single();
    if (error) throw new Error(error.message);
    return {
      ...data,
      payment: Array.isArray(data.payment) ? data.payment[0] || null : data.payment,
    };
  }
  const found = ensureDemoOrders().find((o) => o.id === orderId || o.order_number === orderId);
  if (!found) throw new Error('Order not found.');
  return found;
}

export async function createOrder({
  user,
  items,
  subtotal,
  shippingCost,
  discountTotal,
  totalAmount,
  shippingAddress,
  notes = '',
  paymentMode = 'demo',
}) {
  if (!user?.id) {
    throw new Error('Please sign in to place an order.');
  }
  if (!items || items.length === 0) {
    throw new Error('Your cart is empty.');
  }

  const orderNumber = generateOrderNumber();

  if (isSupabaseConfigured) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        subtotal,
        shipping_cost: shippingCost,
        discount_total: discountTotal,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        notes,
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    const itemRows = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || item.id,
      product_name: item.name,
      product_image: item.image_url || '',
      unit_price: item.effective_price,
      quantity: item.quantity,
      line_total: Number((item.effective_price * item.quantity).toFixed(2)),
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
    if (itemsError) throw new Error(itemsError.message);

    const { error: payError } = await supabase.from('payments').insert({
      order_id: order.id,
      user_id: user.id,
      provider: paymentMode === 'stripe' ? 'stripe' : 'unconfigured',
      amount: totalAmount,
      currency: 'usd',
      status: paymentMode === 'stripe' ? 'pending' : 'demo_unpaid',
    });
    if (payError) throw new Error(payError.message);

    return { ...order, items: itemRows };
  }

  const orders = ensureDemoOrders();
  const created = {
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    user_id: user.id,
    customer_name: user.full_name || shippingAddress.recipient_name,
    customer_email: user.email,
    status: 'pending',
    subtotal,
    shipping_cost: shippingCost,
    discount_total: discountTotal,
    total_amount: totalAmount,
    tracking_number: '',
    shipping_address: shippingAddress,
    notes,
    items: items.map((item, idx) => ({
      id: `oi-${Date.now()}-${idx}`,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image_url || '',
      unit_price: item.effective_price,
      quantity: item.quantity,
      line_total: Number((item.effective_price * item.quantity).toFixed(2)),
    })),
    payment: {
      provider: 'demo',
      status: 'demo_unpaid',
      amount: totalAmount,
    },
    created_at: new Date().toISOString(),
  };

  writeStorage(ORDERS_KEY, [created, ...orders]);
  return created;
}

export async function updateOrderStatus(orderId, { status, tracking_number }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        tracking_number: tracking_number ?? '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const orders = ensureDemoOrders();
  const next = orders.map((o) =>
    o.id === orderId
      ? {
          ...o,
          status,
          tracking_number: tracking_number ?? o.tracking_number,
          updated_at: new Date().toISOString(),
        }
      : o,
  );
  writeStorage(ORDERS_KEY, next);
  return next.find((o) => o.id === orderId);
}

/**
 * Initiates a real Stripe Checkout session ONLY when both publishable key and
 * server-side checkout endpoint are configured. Never fakes payment success.
 */
export async function createStripeCheckoutSession({ orderId, items, customerEmail }) {
  if (!isStripeConfigured) {
    throw new Error(
      'Stripe payment integration is not configured yet. Set VITE_STRIPE_PUBLISHABLE_KEY and VITE_STRIPE_CHECKOUT_ENDPOINT in your environment.',
    );
  }

  const response = await fetch(stripeCheckoutEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      customerEmail,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        unit_price: item.effective_price,
        quantity: item.quantity,
      })),
      successUrl: `${window.location.origin}/orders/${orderId}?checkout=success`,
      cancelUrl: `${window.location.origin}/checkout?canceled=true`,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || 'Unable to start Stripe Checkout session.');
  }

  const data = await response.json();
  if (!data?.url) {
    throw new Error('Stripe checkout endpoint did not return a redirect URL.');
  }
  return data;
}
