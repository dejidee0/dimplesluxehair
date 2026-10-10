-- Dimplesluxe production security and durable lead storage.
-- Apply this migration to the linked Supabase project before launch.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  source text not null default 'homepage',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  desired_look text,
  preferred_texture text,
  preferred_length text,
  budget text,
  contact_preference text not null default 'Email',
  notes text,
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_videos enable row level security;
alter table public.categories enable row level security;
alter table public.currency_rates enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.consultation_requests enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'users', 'orders', 'order_items', 'payments', 'products',
        'product_images', 'product_videos', 'categories', 'currency_rates',
        'reviews', 'wishlists', 'newsletter_subscribers', 'contact_messages',
        'consultation_requests'
      ])
  loop
    execute format('drop policy if exists %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end $$;

-- Customer profiles are private. New accounts can create only their own customer row.
create policy "Customers can read own profile"
  on public.users for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "Customers can create own profile"
  on public.users for insert to authenticated
  with check (id = auth.uid() and role = 'customer');

create policy "Customers can update own profile"
  on public.users for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

revoke update on public.users from authenticated;
grant update (first_name, last_name, full_name, updated_at) on public.users to authenticated;

-- Orders, line items and payments are visible only to their customer or an admin.
create policy "Customers can read own orders"
  on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "Admins manage orders"
  on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Customers can read own order items"
  on public.order_items for select to authenticated
  using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()) or public.is_admin());

create policy "Admins manage order items"
  on public.order_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Customers can read own payments"
  on public.payments for select to authenticated
  using (exists (select 1 from public.orders where orders.id = payments.order_id and orders.user_id = auth.uid()) or public.is_admin());

create policy "Admins manage payments"
  on public.payments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- The public storefront can read only live merchandising data.
create policy "Public can read active products"
  on public.products for select to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "Admins manage products"
  on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read active product images"
  on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products where products.id = product_images.product_id and products.is_active = true) or public.is_admin());

create policy "Admins manage product images"
  on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read active product videos"
  on public.product_videos for select to anon, authenticated
  using (exists (select 1 from public.products where products.id = product_videos.product_id and products.is_active = true) or public.is_admin());

create policy "Admins manage product videos"
  on public.product_videos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read active categories"
  on public.categories for select to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "Admins manage categories"
  on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read currency rates"
  on public.currency_rates for select to anon, authenticated using (true);

create policy "Admins manage currency rates"
  on public.currency_rates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Public can read reviews"
  on public.reviews for select to anon, authenticated using (true);

create policy "Admins manage reviews"
  on public.reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Customers manage own wishlist"
  on public.wishlists for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Leads are written only by trusted server routes using the service role.
create policy "Admins read newsletter subscribers"
  on public.newsletter_subscribers for select to authenticated
  using (public.is_admin());

create policy "Admins manage contact messages"
  on public.contact_messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage consultation requests"
  on public.consultation_requests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

comment on table public.newsletter_subscribers is 'Durable mailing-list subscriptions written by the server only.';
comment on table public.contact_messages is 'Durable website contact requests written by the server only.';
comment on table public.consultation_requests is 'Durable stylist and custom-order requests written by the server only.';
