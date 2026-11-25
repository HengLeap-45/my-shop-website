import { supabase, isSupabaseConfigured } from './supabaseClient';
import { readStorage, writeStorage } from './storageService';
import { SAMPLE_ADDRESSES } from '../data/sampleData';

const ADDRESSES_KEY = 'demo_addresses';
const FAVORITES_KEY = 'demo_favorites';

function ensureDemoAddresses() {
  let list = readStorage(ADDRESSES_KEY);
  if (!Array.isArray(list)) {
    list = SAMPLE_ADDRESSES;
    writeStorage(ADDRESSES_KEY, list);
  }
  return list;
}

export async function getAddresses(userId) {
  if (!userId) return [];
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }
  return ensureDemoAddresses().filter((a) => a.user_id === userId);
}

export async function saveAddress(userId, address) {
  const payload = {
    user_id: userId,
    label: address.label?.trim() || 'Home',
    recipient_name: address.recipient_name.trim(),
    phone: address.phone?.trim() || '',
    street_address: address.street_address.trim(),
    apartment: address.apartment?.trim() || '',
    city: address.city.trim(),
    state: address.state?.trim() || '',
    postal_code: address.postal_code?.trim() || '',
    country: address.country?.trim() || 'United States',
    is_default: Boolean(address.is_default),
  };

  if (isSupabaseConfigured) {
    if (payload.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    }
    if (address.id) {
      const { data, error } = await supabase
        .from('addresses')
        .update(payload)
        .eq('id', address.id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }
    const { data, error } = await supabase.from('addresses').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  let list = ensureDemoAddresses();
  if (payload.is_default) {
    list = list.map((a) => (a.user_id === userId ? { ...a, is_default: false } : a));
  }
  if (address.id) {
    list = list.map((a) => (a.id === address.id ? { ...a, ...payload } : a));
    writeStorage(ADDRESSES_KEY, list);
    return list.find((a) => a.id === address.id);
  }
  const created = { id: `addr-${Date.now()}`, ...payload };
  writeStorage(ADDRESSES_KEY, [created, ...list]);
  return created;
}

export async function deleteAddress(userId, addressId) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return true;
  }
  const list = ensureDemoAddresses();
  writeStorage(
    ADDRESSES_KEY,
    list.filter((a) => !(a.id === addressId && a.user_id === userId)),
  );
  return true;
}

export async function getFavoriteIds(userId) {
  if (!userId) return readStorage(`${FAVORITES_KEY}_guest`, []);
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return (data || []).map((row) => row.product_id);
  }
  return readStorage(`${FAVORITES_KEY}_${userId}`, []);
}

export async function setFavoriteState(userId, productId, shouldFavorite) {
  if (!userId) {
    const current = readStorage(`${FAVORITES_KEY}_guest`, []);
    const next = shouldFavorite
      ? Array.from(new Set([...current, productId]))
      : current.filter((id) => id !== productId);
    writeStorage(`${FAVORITES_KEY}_guest`, next);
    return next;
  }

  if (isSupabaseConfigured) {
    if (shouldFavorite) {
      const { error } = await supabase
        .from('favorites')
        .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) throw new Error(error.message);
    }
    return getFavoriteIds(userId);
  }

  const key = `${FAVORITES_KEY}_${userId}`;
  const current = readStorage(key, []);
  const next = shouldFavorite
    ? Array.from(new Set([...current, productId]))
    : current.filter((id) => id !== productId);
  writeStorage(key, next);
  return next;
}
