-- === Entrega 2 · Australia · esquema del formulario dentro de la cuenta ===
-- Idempotente: se puede correr varias veces sin error. No cambia ninguna fila
-- existente ni toca RLS. Las escrituras del borrador/envío corren siempre en el
-- servidor con la service key, verificando que el usuario con sesión es dueño de
-- la solicitud (ver app/(portal)/mi-cuenta/formulario/[id]/acciones.ts).

-- (a) Borrador del formulario del cliente, guardado dentro de la propia solicitud.
--     Guarda { data: <valores de todos los pasos>, step: <último paso visto> }.
alter table public.solicitudes
  add column if not exists borrador_formulario jsonb not null default '{}'::jsonb,
  add column if not exists borrador_actualizado_at timestamptz;

-- (c) Amarre de la aplicación a la solicitud. Se setea al enviar el formulario.
alter table public.aplicaciones_turismo_australia
  add column if not exists solicitud_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'aplic_australia_solicitud_fk'
  ) then
    alter table public.aplicaciones_turismo_australia
      add constraint aplic_australia_solicitud_fk
      foreign key (solicitud_id) references public.solicitudes(id) on delete set null;
  end if;
end $$;

create index if not exists idx_aplic_australia_solicitud
  on public.aplicaciones_turismo_australia (solicitud_id);
