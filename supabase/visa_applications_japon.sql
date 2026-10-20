-- Tabla del formulario de Japón (/aplicar/turismo-japon).
-- Lo corre el dueño a mano en el SQL Editor de Supabase. Idempotente.
--
-- El formulario de Japón es una réplica del de Canadá, así que la tabla copia
-- la estructura de visa_applications_canada (columnas, defaults, índices).
-- Algunas columnas conservan el nombre de Canadá (activities_in_canada,
-- held_canadian_visa_10y, stayed_illegally_canada, funds_cad): en Japón
-- guardan lo equivalente para Japón, y funds_cad va en USD.

create table if not exists public.visa_applications_japon
  (like public.visa_applications_canada including all);

-- Solo se accede con la service role (supabaseAdmin), que ignora RLS.
alter table public.visa_applications_japon enable row level security;
