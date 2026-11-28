-- Tiendita de bandanas — LATAM VISA × NOCTIVE
-- Ejecutar en Supabase → SQL Editor. Se puede correr más de una vez.

-- 1) Productos
create table if not exists public.bandana_products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  description text not null default '',
  price_aud   numeric(10,2) not null check (price_aud >= 0.50),  -- mínimo de Stripe
  images      text[] not null default '{}',                      -- URLs; la primera es la portada
  active      boolean not null default false,                    -- nace oculto
  created_at  timestamptz not null default now()
);

-- 2) Órdenes (una fila por pago)
create table if not exists public.bandana_orders (
  id                    uuid primary key default gen_random_uuid(),
  stripe_session_id     text not null unique,   -- evita duplicados si Stripe reintenta
  stripe_payment_intent text,                   -- extra: para reembolsar
  product_id            uuid not null references public.bandana_products(id) on delete restrict,
  quantity              integer not null check (quantity between 1 and 10),
  amount_aud            numeric(10,2) not null check (amount_aud >= 0),
  customer_name         text,
  customer_email        text,
  shipping_address      jsonb,
  status                text not null default 'paid'
                        check (status in ('paid','refunded','fulfilled')),
  created_at            timestamptz not null default now()
);

create index if not exists bandana_orders_product_idx on public.bandana_orders (product_id);
create index if not exists bandana_orders_status_idx  on public.bandana_orders (status, created_at desc);

-- 3) RLS y permisos
alter table public.bandana_products enable row level security;
alter table public.bandana_orders   enable row level security;

revoke all on public.bandana_products from anon, authenticated;
revoke all on public.bandana_orders   from anon, authenticated;

-- Público: solo leer productos activos
grant select on public.bandana_products to anon, authenticated;
drop policy if exists "bandana_products: lectura de activos" on public.bandana_products;
create policy "bandana_products: lectura de activos"
  on public.bandana_products for select
  to anon, authenticated
  using (active);

-- Órdenes: sin políticas ni permisos públicos. Solo el servidor (service role).
grant all on public.bandana_products to service_role;
grant all on public.bandana_orders   to service_role;

-- 4) Bucket público para las fotos (subir solo desde el panel de Supabase)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bandanas', 'bandanas', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

notify pgrst, 'reload schema';
