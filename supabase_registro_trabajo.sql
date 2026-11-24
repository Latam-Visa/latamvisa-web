-- Registro de trabajo (/admin/registro): bitácora de lo que se hace cada día
-- (gestiones, llamadas, publicaciones…) para poder traducirlo a horas.
-- Correr una vez en Supabase (SQL editor).

create table if not exists public.registro_trabajo (
  id            uuid primary key default gen_random_uuid(),
  fecha         date not null default current_date,
  categoria     text not null default 'Gestión',
  descripcion   text not null,
  minutos       integer check (minutos is null or minutos >= 0),  -- null = por completar
  evidencia_url text,                                             -- link, captura, correo…
  created_at    timestamptz not null default now()
);

create index if not exists registro_trabajo_fecha_idx on public.registro_trabajo (fecha desc, created_at desc);

-- Solo el service role (servidor) la usa; sin acceso público.
alter table public.registro_trabajo enable row level security;

-- Lo hecho hasta el 24-nov-2026 (minutos por completar por Cristian).
insert into public.registro_trabajo (fecha, categoria, descripcion, evidencia_url) values
  ('2026-11-24', 'Compras / pedidos', 'Canapés Fendi: revisé opciones de proveedores y escribí a Wine & Dine''m (correo con mezcla 3x1, 25 de cada sabor, retiro sábado 5/12).', null),
  ('2026-11-24', 'Reclutamiento', 'Aviso de doorman para Adelaide: redacté el texto con los datos de Breno y creé la cuenta/aviso en SEEK; evalué costos.', null),
  ('2026-11-24', 'Reclutamiento', 'Publiqué el aviso de doorman en Indeed (en revisión).', 'https://employers.indeed.com/jobs/view?employerJobId=aXJpOi8vYXBpcy5pbmRlZWQuY29tL0VtcGxveWVySm9iLzA3YzQ4YWUzLWM1MDUtNGVmZS1hM2NlLTkyMWVlMGVmMGU4ZA%3D%3D'),
  ('2026-11-24', 'Coordinación', 'Actualicé mi número personal (0452 257 233) en los mensajes de staffing y coordiné con Breno.', null);
