import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readStorage, writeStorage } from '../services/storageService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { getFavoriteIds, setFavoriteState } from '../services/accountService';
import { calculateCartTotals, calculateDiscountedPrice } from '../utils/formatters';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'cart_items';

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState(() => readStorage(CART_STORAGE_KEY, []));
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [shippingMethod, setShippingMethod] = useState('standard');

  // Persist local cart
  useEffect(() => {
    writeStorage(CART_STORAGE_KEY, items);
  }, [items]);

  // Load favorites whenever user changes
  useEffect(() => {
    let active = true;
    getFavoriteIds(user?.id)
      .then((ids) => {
        if (active) setFavoriteIds(ids);
      })
      .catch(() => {
        if (active) setFavoriteIds([]);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Sync cart row to Supabase if authenticated and configured
  const syncSupabaseCartItem = useCallback(
    async (productId, quantity) => {
      if (!isSupabaseConfigured || !user?.id || !supabase) return;
      try {
        if (quantity <= 0) {
          await supabase
            .from('cart')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);
        } else {
          await supabase.from('cart').upsert(
            {
              user_id: user.id,
              product_id: productId,
              quantity,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,product_id' },
          );
        }
      } catch {
        // Keep local cart responsive even if background sync fails
      }
    },
    [user?.id],
  );

  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (!product) return;
      const qtyToAdd = Math.max(1, Number(quantity) || 1);
      const maxStock = product.stock_quantity ?? 99;
      if (maxStock <= 0) {
        showToast(`${product.name} is currently out of stock.`, 'error');
        return;
      }

      const effectivePrice = calculateDiscountedPrice(product.price, product.discount_percent);

      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        let nextQty = qtyToAdd;
        if (existing) {
          nextQty = Math.min(maxStock, existing.quantity + qtyToAdd);
          syncSupabaseCartItem(product.id, nextQty);
          return prev.map((i) =>
            i.id === product.id
              ? {
                  ...i,
                  quantity: nextQty,
                  price: Number(product.price),
                  discount_percent: Number(product.discount_percent || 0),
                  effective_price: effectivePrice,
                }
              : i,
          );
        }
        nextQty = Math.min(maxStock, qtyToAdd);
        syncSupabaseCartItem(product.id, nextQty);
        return [
          ...prev,
          {
            id: product.id,
            slug: product.slug,
            name: product.name,
            image_url: product.image_url,
            price: Number(product.price),
            compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
            discount_percent: Number(product.discount_percent || 0),
            effective_price: effectivePrice,
            stock_quantity: maxStock,
            quantity: nextQty,
          },
        ];
      });

      showToast(`Added "${product.name}" to your cart.`);
    },
    [showToast, syncSupabaseCartItem],
  );

  const updateQuantity = useCallback(
    (productId, quantity) => {
      const nextQty = Number(quantity);
      if (Number.isNaN(nextQty) || nextQty <= 0) {
        setItems((prev) => prev.filter((i) => i.id !== productId));
        syncSupabaseCartItem(productId, 0);
        return;
      }
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== productId) return item;
          const clamped = Math.min(item.stock_quantity || 99, Math.max(1, nextQty));
          syncSupabaseCartItem(productId, clamped);
          return { ...item, quantity: clamped };
        }),
      );
    },
    [syncSupabaseCartItem],
  );

  const removeFromCart = useCallback(
    (productId) => {
      setItems((prev) => prev.filter((i) => i.id !== productId));
      syncSupabaseCartItem(productId, 0);
      showToast('Item removed from cart.', 'info');
    },
    [showToast, syncSupabaseCartItem],
  );

  const clearCart = useCallback(async () => {
    setItems([]);
    if (isSupabaseConfigured && user?.id && supabase) {
      await supabase.from('cart').delete().eq('user_id', user.id);
    }
  }, [user?.id]);

  const toggleFavorite = useCallback(
    async (product) => {
      const productId = typeof product === 'string' ? product : product.id;
      const productName = typeof product === 'object' ? product.name : 'Item';
      const currentlyFav = favoriteIds.includes(productId);
      const nextFav = !currentlyFav;

      // Optimistic update
      setFavoriteIds((prev) =>
        nextFav ? Array.from(new Set([...prev, productId])) : prev.filter((id) => id !== productId),
      );

      try {
        const synced = await setFavoriteState(user?.id, productId, nextFav);
        setFavoriteIds(synced);
        showToast(
          nextFav ? `Saved "${productName}" to favorites.` : `Removed "${productName}" from favorites.`,
          nextFav ? 'success' : 'info',
        );
      } catch (err) {
        // Rollback on failure
        setFavoriteIds((prev) =>
          currentlyFav
            ? Array.from(new Set([...prev, productId]))
            : prev.filter((id) => id !== productId),
        );
        showToast(err.message || 'Could not update favorites.', 'error');
      }
    },
    [favoriteIds, showToast, user?.id],
  );

  const isFavorite = useCallback(
    (productId) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const totals = useMemo(
    () => calculateCartTotals(items, shippingMethod),
    [items, shippingMethod],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        favoriteIds,
        shippingMethod,
        setShippingMethod,
        totals,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
