import { supabase, isSupabaseConfigured } from './supabaseClient';
import { readStorage, writeStorage } from './storageService';
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS, SAMPLE_REVIEWS } from '../data/sampleData';
import { slugify } from '../utils/formatters';

const CATEGORIES_KEY = 'demo_categories';
const PRODUCTS_KEY = 'demo_products';
const REVIEWS_KEY = 'demo_reviews';

function ensureDemoCatalog() {
  let categories = readStorage(CATEGORIES_KEY);
  if (!Array.isArray(categories) || categories.length === 0) {
    categories = SAMPLE_CATEGORIES;
    writeStorage(CATEGORIES_KEY, categories);
  }
  let products = readStorage(PRODUCTS_KEY);
  if (!Array.isArray(products) || products.length === 0) {
    products = SAMPLE_PRODUCTS;
    writeStorage(PRODUCTS_KEY, products);
  }
  let reviews = readStorage(REVIEWS_KEY);
  if (!Array.isArray(reviews)) {
    reviews = SAMPLE_REVIEWS;
    writeStorage(REVIEWS_KEY, reviews);
  }
  return { categories, products, reviews };
}

export async function getCategories() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }
  const { categories } = ensureDemoCatalog();
  return [...categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}

export async function saveCategory(category) {
  const payload = {
    name: category.name.trim(),
    slug: category.slug?.trim() || slugify(category.name),
    description: category.description?.trim() || '',
    image_url: category.image_url?.trim() || '/images/prod-headphones.jpg',
    display_order: Number(category.display_order) || 0,
  };

  if (isSupabaseConfigured) {
    if (category.id) {
      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', category.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }
    const { data, error } = await supabase
      .from('categories')
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { categories } = ensureDemoCatalog();
  if (category.id) {
    const updated = categories.map((c) => (c.id === category.id ? { ...c, ...payload } : c));
    writeStorage(CATEGORIES_KEY, updated);
    return updated.find((c) => c.id === category.id);
  }
  const created = { id: `cat-${Date.now()}`, ...payload };
  writeStorage(CATEGORIES_KEY, [...categories, created]);
  return created;
}

export async function deleteCategory(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
  const { categories } = ensureDemoCatalog();
  writeStorage(
    CATEGORIES_KEY,
    categories.filter((c) => c.id !== id),
  );
  return true;
}

export async function getProducts({ includeInactive = false } = {}) {
  if (isSupabaseConfigured) {
    let query = supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .order('created_at', { ascending: false });
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  const { categories, products } = ensureDemoCatalog();
  const catMap = new Map(categories.map((c) => [c.id, c]));
  return products
    .filter((p) => includeInactive || p.is_active !== false)
    .map((p) => ({
      ...p,
      category: catMap.get(p.category_id) || null,
    }));
}

export async function getProductBySlug(slug) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name, slug)')
      .eq('slug', slug)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const products = await getProducts({ includeInactive: true });
  const found = products.find((p) => p.slug === slug || p.id === slug);
  if (!found) throw new Error('Product not found.');
  return found;
}

export async function saveProduct(product) {
  const payload = {
    category_id: product.category_id || null,
    name: product.name.trim(),
    slug: product.slug?.trim() || slugify(product.name),
    sku: product.sku?.trim() || `VLR-${Math.floor(1000 + Math.random() * 9000)}`,
    description: product.description.trim(),
    price: Number(product.price),
    compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
    discount_percent: Number(product.discount_percent || 0),
    stock_quantity: Number(product.stock_quantity || 0),
    image_url: product.image_url?.trim() || '/images/prod-headphones.jpg',
    gallery_urls:
      Array.isArray(product.gallery_urls) && product.gallery_urls.length > 0
        ? product.gallery_urls
        : [product.image_url?.trim() || '/images/prod-headphones.jpg'],
    specs: product.specs || {},
    is_featured: Boolean(product.is_featured),
    is_active: product.is_active !== false,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    if (product.id) {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id)
        .select('*, category:categories(id, name, slug)')
        .single();
      if (error) throw new Error(error.message);
      return data;
    }
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select('*, category:categories(id, name, slug)')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { products, categories } = ensureDemoCatalog();
  const catMap = new Map(categories.map((c) => [c.id, c]));

  if (product.id) {
    const updatedList = products.map((p) => (p.id === product.id ? { ...p, ...payload } : p));
    writeStorage(PRODUCTS_KEY, updatedList);
    const updatedItem = updatedList.find((p) => p.id === product.id);
    return { ...updatedItem, category: catMap.get(updatedItem.category_id) || null };
  }

  const created = {
    id: `prod-${Date.now()}`,
    ...payload,
    rating_average: 5.0,
    review_count: 0,
    popularity_score: 50,
    created_at: new Date().toISOString(),
  };
  writeStorage(PRODUCTS_KEY, [created, ...products]);
  return { ...created, category: catMap.get(created.category_id) || null };
}

export async function deleteProduct(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
  const { products } = ensureDemoCatalog();
  writeStorage(
    PRODUCTS_KEY,
    products.filter((p) => p.id !== id),
  );
  return true;
}

export async function uploadProductImage(file) {
  if (!file) throw new Error('No file selected.');
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, WebP, or AVIF image.');
  }
  if (file.size > 4 * 1024 * 1024) {
    throw new Error('Image must be 4MB or smaller.');
  }

  if (isSupabaseConfigured) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  }

  // Demo Mode: convert uploaded image to Data URL for immediate preview & local persistence
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read the selected image file.'));
    reader.readAsDataURL(file);
  });
}

export async function getReviewsByProduct(productId) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }
  const { reviews } = ensureDemoCatalog();
  return reviews
    .filter((r) => r.product_id === productId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function addReview({ product_id, user_id, author_name, rating, title, comment }) {
  const payload = {
    product_id,
    user_id,
    author_name: author_name.trim(),
    rating: Number(rating),
    title: title.trim(),
    comment: comment.trim(),
    is_verified_purchase: true,
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('reviews')
      .upsert(payload, { onConflict: 'product_id,user_id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { reviews, products } = ensureDemoCatalog();
  const existingIdx = reviews.findIndex(
    (r) => r.product_id === product_id && r.user_id === user_id,
  );
  const newReview = {
    id: existingIdx >= 0 ? reviews[existingIdx].id : `rev-${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString(),
  };

  const nextReviews =
    existingIdx >= 0
      ? reviews.map((r, i) => (i === existingIdx ? newReview : r))
      : [newReview, ...reviews];
  writeStorage(REVIEWS_KEY, nextReviews);

  // Sync product rating summary in demo storage
  const productReviews = nextReviews.filter((r) => r.product_id === product_id);
  const avg =
    productReviews.reduce((sum, r) => sum + Number(r.rating), 0) / Math.max(1, productReviews.length);
  const nextProducts = products.map((p) =>
    p.id === product_id
      ? {
          ...p,
          rating_average: Number(avg.toFixed(1)),
          review_count: productReviews.length,
        }
      : p,
  );
  writeStorage(PRODUCTS_KEY, nextProducts);

  return newReview;
}
