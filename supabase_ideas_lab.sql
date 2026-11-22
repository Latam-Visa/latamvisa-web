-- Laboratorio de Ideas (/admin/ideas/lab): historial de simulaciones de panel.
-- Correr una vez en Supabase (SQL editor). La app funciona sin esta tabla,
-- pero no guarda historial hasta que exista.

create table if not exists public.ideas_lab (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  descripcion text not null,
  publico     text,
  precio      text,
  resultado   jsonb,          -- el reporte completo del panel
  veredicto   text,
  adopcion    integer,        -- % estimado que lo consideraría
  created_at  timestamptz not null default now()
);

create index if not exists ideas_lab_created_at_idx on public.ideas_lab (created_at desc);

-- Solo el service role (servidor) la usa; sin acceso público.
alter table public.ideas_lab enable row level security;
