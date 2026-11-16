-- ============================================================================
-- Cotizaciones de VISA DE ESTUDIANTE (Subclass 500) — hechas a mano en el admin
-- ============================================================================
-- Lo corre el dueño a mano en el SQL Editor de Supabase. 100% idempotente:
-- se puede volver a correr sin duplicar ni romper nada.
--
-- MODELO DE ACCESO (igual que admin_tasks / visa_applications_usa):
--   · RLS ACTIVADO y SIN políticas para anon/authenticated → nadie lee ni
--     escribe con la anon key desde el navegador.
--   · Todo el acceso es server-side con la service role key (el service role
--     bypassa RLS por diseño) detrás de la cookie admin_auth.
--
-- MONTOS: todo lo "al cliente" va en AUD. Los costos locales van en COP en sus
--   propias columnas. Lo "interno" (neto, comisión, notas) NUNCA sale al PDF
--   ni al WhatsApp — vive solo en el admin.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Trigger para mantener updated_at al día (igual que fin_set_updated_at).
-- ---------------------------------------------------------------------------
create or replace function public.cotizaciones_estudio_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tabla
-- ---------------------------------------------------------------------------
create table if not exists public.cotizaciones_estudio (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  estado      text not null default 'borrador'
                check (estado in ('borrador', 'enviada', 'aceptada', 'perdida')),

  -- ---- Cliente -----------------------------------------------------------
  nombre          text not null default '',
  edad            int,
  pais            text,
  nivel_ingles    text,
  pasaporte       text,                -- estado del pasaporte (ej. "Vigente")
  ciudad_llegada  text,
  telefono        text,
  email           text,
  student_type    text not null default 'offshore'
                    check (student_type in ('offshore', 'onshore')),

  -- ---- Curso -------------------------------------------------------------
  colegio                   text,       -- código corto (ej. "ANCE")
  colegio_nombre_completo   text,       -- ej. "Australian National College of English"
  tipo                      text check (tipo in ('ELICOS', 'VET')),
  curso                     text,
  cricos                    text,       -- nullable (ELICOS General English no tiene)
  semanas_enrolment         int,
  semanas_pagas             int,
  semanas_gratis            int,
  precio_semana_neto        numeric(10,2),   -- AUD/semana NETO (interno de cálculo)
  materiales_por_semana_paga numeric(10,2),  -- AUD por semana paga
  duracion_texto            text,            -- ej. "≈9 meses"
  vacaciones_semanas        int,
  fecha_inicio              date,            -- nullable; si existe, fija las fechas reales

  -- ---- Promo (sí se muestra al cliente) ----------------------------------
  promo_banner   text,
  extras_gratis  text[] not null default '{}',  -- ej. {"Curso de Barista"}

  -- ---- Montos al cliente (AUD) — SÍ salen al PDF -------------------------
  matricula_cliente  numeric(12,2) not null default 0,
  materiales         numeric(12,2) not null default 0,
  inscripcion        numeric(12,2) not null default 0,  -- "Reserva de cupo + inscripción"
  oshc               numeric(12,2) not null default 0,
  visa               numeric(12,2) not null default 0,
  total              numeric(12,2) not null default 0,

  -- ---- Interno — NUNCA sale al PDF ni al WhatsApp -------------------------
  matricula_neta  numeric(12,2),           -- semanas_pagas × precio_semana_neto
  comision_pct    numeric(6,4),            -- FRACCIÓN 0–1 (ej. 0.30 = 30%); nullable
  comision_aud    numeric(12,2),           -- matricula_neta × comision_pct
  notas_internas  text,

  -- ---- Solvencia (AUD) ---------------------------------------------------
  solvencia_aud   numeric(12,2),

  -- ---- Costos locales (COP) ----------------------------------------------
  biometria_cop   numeric(14,2),
  medico_cop      numeric(14,2),

  -- ---- Plan de pagos -----------------------------------------------------
  -- jsonb: [{ orden, cuando_tipo: 'dia_relativo'|'fecha'|'semana_curso',
  --           dias, fecha, semana, concepto, monto, por_confirmar }]
  plan_pagos      jsonb not null default '[]'::jsonb
);

-- Por si la tabla ya existía de una corrida anterior incompleta: agrega
-- cualquier columna que falte (no-op si ya están todas).
alter table public.cotizaciones_estudio
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists estado text not null default 'borrador',
  add column if not exists nombre text not null default '',
  add column if not exists edad int,
  add column if not exists pais text,
  add column if not exists nivel_ingles text,
  add column if not exists pasaporte text,
  add column if not exists ciudad_llegada text,
  add column if not exists telefono text,
  add column if not exists email text,
  add column if not exists student_type text not null default 'offshore',
  add column if not exists colegio text,
  add column if not exists colegio_nombre_completo text,
  add column if not exists tipo text,
  add column if not exists curso text,
  add column if not exists cricos text,
  add column if not exists semanas_enrolment int,
  add column if not exists semanas_pagas int,
  add column if not exists semanas_gratis int,
  add column if not exists precio_semana_neto numeric(10,2),
  add column if not exists materiales_por_semana_paga numeric(10,2),
  add column if not exists duracion_texto text,
  add column if not exists vacaciones_semanas int,
  add column if not exists fecha_inicio date,
  add column if not exists promo_banner text,
  add column if not exists extras_gratis text[] not null default '{}',
  add column if not exists matricula_cliente numeric(12,2) not null default 0,
  add column if not exists materiales numeric(12,2) not null default 0,
  add column if not exists inscripcion numeric(12,2) not null default 0,
  add column if not exists oshc numeric(12,2) not null default 0,
  add column if not exists visa numeric(12,2) not null default 0,
  add column if not exists total numeric(12,2) not null default 0,
  add column if not exists matricula_neta numeric(12,2),
  add column if not exists comision_pct numeric(6,4),
  add column if not exists comision_aud numeric(12,2),
  add column if not exists notas_internas text,
  add column if not exists solvencia_aud numeric(12,2),
  add column if not exists biometria_cop numeric(14,2),
  add column if not exists medico_cop numeric(14,2),
  add column if not exists plan_pagos jsonb not null default '[]'::jsonb;

comment on table public.cotizaciones_estudio is
  'Cotizaciones de visa de estudiante (Subclass 500) hechas a mano en el admin, con deals de colegios con convenio. Los campos *_neta/comision_*/notas_internas son internos y nunca salen al PDF ni al WhatsApp.';
comment on column public.cotizaciones_estudio.comision_pct is
  'Fracción 0–1 (0.30 = 30%). comision_aud = matricula_neta × comision_pct. La comisión va sobre el valor de las semanas (neto), no sobre materiales.';
comment on column public.cotizaciones_estudio.plan_pagos is
  'Array jsonb de cuotas: { orden, cuando_tipo (dia_relativo|fecha|semana_curso), dias, fecha, semana, concepto, monto, por_confirmar }. La suma debe cuadrar con total para poder marcar "enviada".';

-- ---------------------------------------------------------------------------
-- Índices (listado, filtros por estado/colegio, orden por fecha)
-- ---------------------------------------------------------------------------
create index if not exists cotizaciones_estudio_created_at_idx on public.cotizaciones_estudio (created_at desc);
create index if not exists cotizaciones_estudio_estado_idx     on public.cotizaciones_estudio (estado);
create index if not exists cotizaciones_estudio_colegio_idx    on public.cotizaciones_estudio (colegio);

-- ---------------------------------------------------------------------------
-- Trigger updated_at
-- ---------------------------------------------------------------------------
drop trigger if exists cotizaciones_estudio_set_updated_at on public.cotizaciones_estudio;
create trigger cotizaciones_estudio_set_updated_at
  before update on public.cotizaciones_estudio
  for each row execute function public.cotizaciones_estudio_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — solo service role (igual que las demás tablas del admin)
-- ---------------------------------------------------------------------------
alter table public.cotizaciones_estudio enable row level security;

drop policy if exists "service role full access cotizaciones_estudio" on public.cotizaciones_estudio;
create policy "service role full access cotizaciones_estudio"
  on public.cotizaciones_estudio
  for all
  to service_role
  using (true)
  with check (true);

-- ============================================================================
-- SEED · Caso real de prueba: Katherine Puerta (ANCE, ELICOS General English)
-- UUID fijo para que la URL del admin sea estable y el PDF funcione de una.
--   /admin/cotizaciones-estudio/ca7e0500-0000-4000-8000-000000000001
-- Verificación de montos:
--   materiales   = 35 × 10 = 350
--   matricula_neta = 35 × 200 = 7000
--   total = 8813 + 350 + 250 + 508 + 2079 = 12000
--   plan: 250 + 5386 + 2587 + 3777 = 12000 · para arrancar = 250+5386+2587 = 8223
-- ============================================================================
insert into public.cotizaciones_estudio (
  id, estado,
  nombre, edad, pais, nivel_ingles, pasaporte, ciudad_llegada, student_type,
  colegio, colegio_nombre_completo, tipo, curso, cricos,
  semanas_enrolment, semanas_pagas, semanas_gratis,
  precio_semana_neto, materiales_por_semana_paga, duracion_texto, vacaciones_semanas, fecha_inicio,
  promo_banner, extras_gratis,
  matricula_cliente, materiales, inscripcion, oshc, visa, total,
  matricula_neta, comision_pct, comision_aud, notas_internas,
  solvencia_aud, biometria_cop, medico_cop,
  plan_pagos
) values (
  'ca7e0500-0000-4000-8000-000000000001', 'borrador',
  'Katherine Puerta', 32, 'Colombia', 'Básico', 'Vigente', 'Melbourne', 'offshore',
  'ANCE', 'Australian National College of English', 'ELICOS', 'General English', null,
  40, 35, 5,
  200, 10, '≈9 meses', 8, null,
  '🎁 Promoción incluida: 5 semanas de inglés GRATIS + Curso de Barista GRATIS · Pagas 35 de 40 semanas · 8 semanas de vacaciones',
  array['Curso de Barista'],
  8813, 350, 250, 508, 2079, 12000,
  7000, null, null, null,
  31700, 96338, 350000,
  '[
    {"orden":1,"cuando_tipo":"dia_relativo","dias":0,"fecha":null,"semana":null,"concepto":"Reserva de cupo + inscripción","monto":250,"por_confirmar":false},
    {"orden":2,"cuando_tipo":"dia_relativo","dias":15,"fecha":null,"semana":null,"concepto":"20 semanas + materiales → se emite tu CoE","monto":5386,"por_confirmar":false},
    {"orden":3,"cuando_tipo":"dia_relativo","dias":20,"fecha":null,"semana":null,"concepto":"OSHC + Visa 500 (con CoE)","monto":2587,"por_confirmar":false},
    {"orden":4,"cuando_tipo":"semana_curso","dias":null,"fecha":null,"semana":20,"concepto":"15 semanas restantes (ya en Australia)","monto":3777,"por_confirmar":true}
  ]'::jsonb
)
on conflict (id) do nothing;
