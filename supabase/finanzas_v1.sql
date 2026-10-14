-- =============================================================================
-- Finanzas v1 — herramienta personal de flujo de caja, multi-usuario.
-- Ejecutar a mano en el editor SQL de Supabase (una sola vez, en orden).
--
-- Reglas de privacidad que este archivo garantiza en la base:
--   * Toda tabla fin_* tiene user_id -> auth.users y RLS "user_id = auth.uid()"
--     para select / insert / update / delete. Sin excepciones, sin políticas
--     para anon. La service role (servidor) se salta RLS: el código de Finanzas
--     solo la usa en el cron de limpieza de archivos vencidos (no lee datos).
--   * El único dato agregado visible para el admin es el total de perfiles
--     (función fin_total_perfiles, solo ejecutable por service_role).
--   * Bucket privado finanzas-uploads, ruta {user_id}/{uuid}-{archivo}; cada
--     usuario solo ve/escribe/borra su carpeta.
--
-- NO toca las tablas viejas finanzas_* (ver nota al final).
-- =============================================================================

begin;

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Utilidades
-- -----------------------------------------------------------------------------
create or replace function public.fin_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- -----------------------------------------------------------------------------
-- Piloto: ÚNICA lista de correos permitidos. La app pregunta con
-- fin_en_piloto() (boolean del usuario actual) y la política de insert de
-- fin_profiles la exige, así que ni la app ni la API directa con la anon key
-- pueden crear un perfil fuera del piloto. La tabla no tiene políticas:
-- nadie la lee salvo la función. Se administra desde el editor SQL.
-- -----------------------------------------------------------------------------
create table if not exists public.fin_pilot_emails (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);
alter table public.fin_pilot_emails enable row level security;

create or replace function public.fin_en_piloto()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.fin_pilot_emails
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.fin_en_piloto() from public;
grant execute on function public.fin_en_piloto() to authenticated;

insert into public.fin_pilot_emails (email) values ('c.d.montenegro.gomez@gmail.com') on conflict do nothing;
-- Para sumar a alguien del equipo:
-- insert into public.fin_pilot_emails (email) values ('correo@ejemplo.com') on conflict do nothing;

-- -----------------------------------------------------------------------------
-- Perfil (uno por usuario)
-- -----------------------------------------------------------------------------
create table if not exists public.fin_profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  pay_frequency text check (pay_frequency in ('semanal', 'quincenal', 'mensual', 'irregular')),
  timezone text not null default 'Australia/Brisbane',
  currency text not null default 'AUD' check (currency ~ '^[A-Z]{3}$'),
  consent_at timestamptz not null,           -- sin consentimiento no hay perfil
  onboarding_step smallint not null default 0 check (onboarding_step between 0 and 7),
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Ingresos
-- -----------------------------------------------------------------------------
create table if not exists public.fin_income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  type text not null check (type in ('empleo_tfn', 'contrato_abn', 'negocio')),
  amount numeric(12, 2) not null check (amount >= 0),
  frequency text not null check (frequency in ('semanal', 'quincenal', 'mensual', 'trimestral', 'anual', 'unico')),
  is_minimum boolean not null default true,   -- "lo mínimo que me entra"
  next_date date,
  tax_withheld boolean not null default true, -- ABN normalmente false
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Gastos fijos y pagos grandes (los únicos van con frequency = 'unico')
-- -----------------------------------------------------------------------------
create table if not exists public.fin_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (char_length(category) between 1 and 60), -- arriendo, bills, comida, transporte, gym, celular, suscripciones, estudio, impuestos, seguros, otro
  amount numeric(12, 2) not null check (amount >= 0),
  frequency text not null check (frequency in ('semanal', 'quincenal', 'mensual', 'trimestral', 'anual', 'unico')),
  next_due date,                              -- obligatorio en la app para 'unico' y pagos grandes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Cuentas y saldos
-- -----------------------------------------------------------------------------
create table if not exists public.fin_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  kind text not null check (kind in ('personal', 'negocio', 'tarjeta', 'bnpl')),
  balance numeric(12, 2) not null default 0,
  available numeric(12, 2),
  as_of date not null default current_date,
  is_untouchable boolean not null default false, -- p. ej. la cuenta del negocio
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Deudas y sus cuotas
-- -----------------------------------------------------------------------------
create table if not exists public.fin_debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lender text not null check (char_length(lender) between 1 and 120),
  kind text not null check (kind in ('bnpl', 'tarjeta', 'prestamo_personal', 'otro')),
  balance numeric(12, 2) not null check (balance >= 0),
  interest_rate numeric(6, 3) check (interest_rate >= 0),  -- % anual
  fee_monthly numeric(10, 2) check (fee_monthly >= 0),
  late_fee_risk boolean not null default false,
  notes text check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)  -- permite que las cuotas exijan el mismo dueño
);

create table if not exists public.fin_debt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  debt_id uuid not null,
  due_date date not null,
  amount numeric(12, 2) not null check (amount > 0),
  status text not null default 'pendiente' check (status in ('pendiente', 'pagado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- La cuota y su deuda son siempre del mismo usuario.
  foreign key (debt_id, user_id) references public.fin_debts (id, user_id) on delete cascade
);

-- -----------------------------------------------------------------------------
-- Archivos subidos y lo extraído (se borran al confirmar o a los 7 días)
-- -----------------------------------------------------------------------------
create table if not exists public.fin_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  storage_path text not null unique,
  mime text not null check (mime in ('image/png', 'image/jpeg', 'image/heic', 'image/heif', 'application/pdf')),
  size_bytes integer check (size_bytes between 1 and 10485760),
  status text not null default 'subido' check (status in ('subido', 'extraido', 'confirmado', 'descartado', 'manual')),
  extracted jsonb,                            -- se vacía al confirmar/descartar
  delete_after timestamptz not null default (now() + interval '7 days'),
  file_deleted_at timestamptz,                -- cuándo se borró el archivo de Storage
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- La ruta siempre vive en la carpeta del dueño.
  check (storage_path like (user_id::text || '/%'))
);

-- -----------------------------------------------------------------------------
-- Meta y planes calculados
-- -----------------------------------------------------------------------------
create table if not exists public.fin_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  target_amount numeric(12, 2) not null check (target_amount > 0),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fin_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  version integer not null default 1,
  inputs_hash text not null,                  -- hash de los datos confirmados
  plan jsonb not null,                        -- salida del motor determinístico
  narrative jsonb,                            -- "tu análisis" (Esta semana, riesgos, mensajes, recomendación)
  created_at timestamptz not null default now(),
  unique (user_id, inputs_hash)               -- caché: mismos datos = no se vuelve a cobrar
);

-- -----------------------------------------------------------------------------
-- Reglas del clasificador (reutiliza el diseño de finanzas_reglas, por usuario)
-- -----------------------------------------------------------------------------
create table if not exists public.fin_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  patron text not null check (char_length(patron) between 1 and 120),
  categoria text not null,
  tipo text not null check (tipo in ('ingreso', 'gasto', 'transferencia_interna', 'reembolso')),
  grupo text not null check (grupo in ('negocio', 'personal', 'na')),
  es_recurrente boolean not null default false,
  prioridad integer not null default 100,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Índices
-- -----------------------------------------------------------------------------
create index if not exists fin_income_sources_user_idx on public.fin_income_sources (user_id);
create index if not exists fin_expenses_user_due_idx on public.fin_expenses (user_id, next_due);
create index if not exists fin_accounts_user_idx on public.fin_accounts (user_id);
create index if not exists fin_debts_user_idx on public.fin_debts (user_id);
create index if not exists fin_debt_payments_user_due_idx on public.fin_debt_payments (user_id, due_date);
create index if not exists fin_debt_payments_debt_idx on public.fin_debt_payments (debt_id, user_id);
create index if not exists fin_uploads_user_idx on public.fin_uploads (user_id, created_at desc);
create index if not exists fin_uploads_cleanup_idx on public.fin_uploads (delete_after) where file_deleted_at is null;
create index if not exists fin_goals_user_idx on public.fin_goals (user_id);
create index if not exists fin_plans_user_idx on public.fin_plans (user_id, created_at desc);
create index if not exists fin_rules_user_idx on public.fin_rules (user_id, prioridad);

-- -----------------------------------------------------------------------------
-- updated_at automático
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['fin_profiles', 'fin_income_sources', 'fin_expenses', 'fin_accounts', 'fin_debts',
                           'fin_debt_payments', 'fin_uploads', 'fin_goals']
  loop
    execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.fin_set_updated_at()', t, t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- RLS: user_id = auth.uid() en las 4 operaciones, solo para "authenticated".
-- (select auth.uid()) se evalúa una vez por consulta, no por fila.
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['fin_profiles', 'fin_income_sources', 'fin_expenses', 'fin_accounts', 'fin_debts',
                           'fin_debt_payments', 'fin_uploads', 'fin_goals', 'fin_plans', 'fin_rules']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_select_propio', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert_propio', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_propio', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_propio', t);
    execute format('create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()))', t || '_select_propio', t);
    execute format('create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t || '_update_propio', t);
    execute format('create policy %I on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t || '_delete_propio', t);
    -- El perfil además exige estar en el piloto; las demás tablas exigen
    -- tener perfil (o sea, haber pasado el piloto y el consentimiento).
    if t = 'fin_profiles' then
      execute format('create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()) and public.fin_en_piloto())', t || '_insert_propio', t);
    else
      execute format('create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.fin_profiles p where p.user_id = (select auth.uid())))', t || '_insert_propio', t);
    end if;
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Métrica admin: SOLO el total de perfiles (ningún dato individual).
-- -----------------------------------------------------------------------------
create or replace function public.fin_total_perfiles()
returns bigint
language sql
stable
security definer
set search_path = public
as $$ select count(*) from public.fin_profiles $$;
revoke all on function public.fin_total_perfiles() from public, anon, authenticated;
grant execute on function public.fin_total_perfiles() to service_role;

-- -----------------------------------------------------------------------------
-- "Borrar todos mis datos": borra cada fila del usuario que llama (con RLS).
-- Los archivos de Storage los borra la app (lista la carpeta {user_id}/).
-- -----------------------------------------------------------------------------
create or replace function public.fin_borrar_mis_datos()
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'no autenticado'; end if;
  delete from public.fin_debt_payments where user_id = uid;
  delete from public.fin_debts where user_id = uid;
  delete from public.fin_income_sources where user_id = uid;
  delete from public.fin_expenses where user_id = uid;
  delete from public.fin_accounts where user_id = uid;
  delete from public.fin_uploads where user_id = uid;
  delete from public.fin_goals where user_id = uid;
  delete from public.fin_plans where user_id = uid;
  delete from public.fin_rules where user_id = uid;
  delete from public.fin_profiles where user_id = uid;
end $$;
revoke all on function public.fin_borrar_mis_datos() from public, anon;
grant execute on function public.fin_borrar_mis_datos() to authenticated;

-- -----------------------------------------------------------------------------
-- Storage: bucket privado finanzas-uploads (10 MB, solo imágenes y PDF)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('finanzas-uploads', 'finanzas-uploads', false, 10485760,
        array['image/png', 'image/jpeg', 'image/heic', 'image/heif', 'application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Cada usuario solo su carpeta: primer segmento de la ruta = su uid.
drop policy if exists "finanzas_uploads_select_propio" on storage.objects;
drop policy if exists "finanzas_uploads_insert_propio" on storage.objects;
drop policy if exists "finanzas_uploads_update_propio" on storage.objects;
drop policy if exists "finanzas_uploads_delete_propio" on storage.objects;

create policy "finanzas_uploads_select_propio" on storage.objects
  for select to authenticated
  using (bucket_id = 'finanzas-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "finanzas_uploads_insert_propio" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'finanzas-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "finanzas_uploads_update_propio" on storage.objects
  for update to authenticated
  using (bucket_id = 'finanzas-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'finanzas-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "finanzas_uploads_delete_propio" on storage.objects
  for delete to authenticated
  using (bucket_id = 'finanzas-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;

-- =============================================================================
-- DESPUÉS de tu primer login en /finanzas (opcional): copiar tus 55 reglas del
-- clasificador viejo a tu usuario nuevo. Ejecútalo aparte (quita los "--").
--
-- insert into public.fin_rules (user_id, patron, categoria, tipo, grupo, es_recurrente, prioridad)
-- select u.id, r.patron, r.categoria, r.tipo, r.grupo, r.es_recurrente, r.prioridad
-- from public.finanzas_reglas r
-- cross join (select id from auth.users where email = 'c.d.montenegro.gomez@gmail.com') u;
--
-- Las tablas viejas (finanzas_perfil, finanzas_reglas, finanzas_transacciones,
-- finanzas_reportes) no se tocan aquí. Quedan para retirarlas cuando la nueva
-- sección reemplace a /admin/finanzas.
-- =============================================================================
