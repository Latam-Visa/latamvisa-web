-- Traducciones manuales (documentos que llegan por Gmail/WhatsApp, sin pasar
-- por el formulario público). Correr en el SQL editor de Supabase.
--
-- La relación con los documentos es por id: para un lote manual,
-- documentos_traducidos.application_id guarda el lotes_traduccion.id.
-- No hay FK porque documentos_traducidos.application_id apunta a cinco tablas
-- distintas de aplicaciones según el país, más ahora a los lotes manuales.

create table if not exists public.lotes_traduccion (
  id             uuid primary key default gen_random_uuid(),
  nombre_cliente text not null,
  pais           text,
  notas          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists lotes_traduccion_created_at_idx
  on public.lotes_traduccion (created_at desc);

-- El buscador filtra sobre lower(nombre_cliente).
create index if not exists lotes_traduccion_nombre_cliente_idx
  on public.lotes_traduccion (lower(nombre_cliente));

alter table public.documentos_traducidos
  add column if not exists origen text;

-- Los documentos se leen siempre por application_id, así que este índice es el
-- que sirve tanto a las solicitudes como a los lotes manuales.
create index if not exists documentos_traducidos_application_id_idx
  on public.documentos_traducidos (application_id);

-- La app entra con la service role key, que salta RLS. Se deja habilitado y sin
-- políticas para que nadie llegue con la anon key.
alter table public.lotes_traduccion enable row level security;
