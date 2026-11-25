-- ==============================================================================
-- VELORA E-COMMERCE DATABASE SCHEMA (PostgreSQL / Supabase)
-- Tables: users, categories, products, cart, orders, order_items,
--         payments, reviews, addresses, favorites
-- ==============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. USERS (Public profile table linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null default '',
  phone text default '',
  avatar_url text default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Automatically create a row in public.users when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper function to check admin role without RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES
-- ------------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text default '',
  image_url text default '',
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS
-- ------------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  sku text unique,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  discount_percent int not null default 0 check (discount_percent between 0 and 95),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  image_url text not null default '',
  gallery_urls text[] not null default '{}',
  specs jsonb not null default '{}'::jsonb,
  rating_average numeric(3, 2) not null default 0 check (rating_average between 0 and 5),
  review_count int not null default 0 check (review_count >= 0),
  popularity_score int not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_featured on public.products(is_featured);

-- ------------------------------------------------------------------------------
-- 4. ADDRESSES
-- ------------------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  label text not null default 'Home',
  recipient_name text not null,
  phone text not null default '',
  street_address text not null,
  apartment text default '',
  city text not null,
  state text not null default '',
  postal_code text default '',
  country text not null default 'United States',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_addresses_user on public.addresses(user_id);

-- ------------------------------------------------------------------------------
-- 5. CART
-- ------------------------------------------------------------------------------
create table if not exists public.cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_cart_user on public.cart(user_id);

-- ------------------------------------------------------------------------------
-- 6. FAVORITES
-- ------------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_favorites_user on public.favorites(user_id);

-- ------------------------------------------------------------------------------
-- 7. ORDERS
-- ------------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid not null references public.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  shipping_cost numeric(10, 2) not null default 0 check (shipping_cost >= 0),
  discount_total numeric(10, 2) not null default 0 check (discount_total >= 0),
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  shipping_address jsonb not null,
  tracking_number text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

-- ------------------------------------------------------------------------------
-- 8. ORDER ITEMS
-- ------------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text default '',
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0)
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ------------------------------------------------------------------------------
-- 9. PAYMENTS
-- ------------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete restrict,
  provider text not null default 'unconfigured',
  provider_session_id text default '',
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded', 'demo_unpaid')),
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_order on public.payments(order_id);

-- ------------------------------------------------------------------------------
-- 10. REVIEWS
-- ------------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  title text not null default '',
  comment text not null,
  is_verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists idx_reviews_product on public.reviews(product_id);

-- Recompute product rating_average and review_count on review changes
create or replace function public.sync_product_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_product_id uuid;
begin
  target_product_id := coalesce(new.product_id, old.product_id);
  update public.products
  set
    rating_average = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where product_id = target_product_id), 0),
    review_count = (select count(*) from public.reviews where product_id = target_product_id),
    updated_at = now()
  where id = target_product_id;
  return null;
end;
$$;

drop trigger if exists trg_reviews_sync_rating on public.reviews;
create trigger trg_reviews_sync_rating
  after insert or update or delete on public.reviews
  for each row execute procedure public.sync_product_rating();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.cart enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;

-- USERS
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id or public.is_admin());
create policy "Users can update own non-role fields" on public.users
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.users where id = auth.uid()));
create policy "Admins can manage users" on public.users
  for all using (public.is_admin());

-- CATEGORIES (Public read, Admin write)
create policy "Anyone can view categories" on public.categories
  for select using (true);
create policy "Admins can manage categories" on public.categories
  for all using (public.is_admin());

-- PRODUCTS (Public read active, Admin write all)
create policy "Anyone can view active products" on public.products
  for select using (is_active = true or public.is_admin());
create policy "Admins can manage products" on public.products
  for all using (public.is_admin());

-- ADDRESSES (Owner + Admin)
create policy "Users manage own addresses" on public.addresses
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- CART (Owner only)
create policy "Users manage own cart" on public.cart
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- FAVORITES (Owner only)
create policy "Users manage own favorites" on public.favorites
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ORDERS (Owner view/create, Admin manage all)
create policy "Users view own orders" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "Users create own orders" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "Admins update orders" on public.orders
  for update using (public.is_admin());

-- ORDER ITEMS
create policy "Users view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "Users insert own order items" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- PAYMENTS
create policy "Users view own payments" on public.payments
  for select using (auth.uid() = user_id or public.is_admin());
create policy "Users create own payments" on public.payments
  for insert with check (auth.uid() = user_id);
create policy "Admins update payments" on public.payments
  for update using (public.is_admin());

-- REVIEWS (Public read, Authenticated user write own)
create policy "Anyone can view reviews" on public.reviews
  for select using (true);
create policy "Users create own reviews" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "Users update/delete own reviews" on public.reviews
  for update using (auth.uid() = user_id or public.is_admin());
create policy "Users delete own reviews" on public.reviews
  for delete using (auth.uid() = user_id or public.is_admin());

-- ==============================================================================
-- SUPABASE STORAGE BUCKET FOR PRODUCT IMAGES
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read access for product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can update/delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
