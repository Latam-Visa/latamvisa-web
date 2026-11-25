-- === Portal · formularios de Canadá, Japón y UK dentro de la cuenta ===
-- Idempotente: se puede correr varias veces sin error. No cambia ninguna fila
-- existente ni toca RLS. Solo agrega la columna que amarra cada aplicación a la
-- solicitud del portal (se escribe en el servidor al enviar desde /mi-cuenta).
-- Correr ANTES de que los clientes usen el formulario desde su cuenta.

alter table public.visa_applications_canada
  add column if not exists solicitud_id uuid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'aplic_canada_solicitud_fk') then
    alter table public.visa_applications_canada
      add constraint aplic_canada_solicitud_fk
      foreign key (solicitud_id) references public.solicitudes(id) on delete set null;
  end if;
end $$;

create index if not exists idx_aplic_canada_solicitud
  on public.visa_applications_canada (solicitud_id);

alter table public.visa_applications_japon
  add column if not exists solicitud_id uuid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'aplic_japon_solicitud_fk') then
    alter table public.visa_applications_japon
      add constraint aplic_japon_solicitud_fk
      foreign key (solicitud_id) references public.solicitudes(id) on delete set null;
  end if;
end $$;

create index if not exists idx_aplic_japon_solicitud
  on public.visa_applications_japon (solicitud_id);

alter table public.visa_applications_uk
  add column if not exists solicitud_id uuid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'aplic_uk_solicitud_fk') then
    alter table public.visa_applications_uk
      add constraint aplic_uk_solicitud_fk
      foreign key (solicitud_id) references public.solicitudes(id) on delete set null;
  end if;
end $$;

create index if not exists idx_aplic_uk_solicitud
  on public.visa_applications_uk (solicitud_id);
