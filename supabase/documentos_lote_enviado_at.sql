-- Carga inmediata de documentos: cargado ≠ enviado.
-- Lo corre el dueño a mano en el SQL Editor de Supabase. Idempotente.
--
-- enviado_at NULL  = el archivo ya está en Storage y en documentos_lote, pero
--                    nadie le dio "Ya terminé": n8n todavía no lo recibió.
-- enviado_at fecha = ya se mandó al webhook de traducción.

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'documentos_lote' and column_name = 'enviado_at'
  ) then
    alter table public.documentos_lote add column enviado_at timestamptz;
    -- Solo al crear la columna: lo que ya existía se había enviado al subirse.
    -- Dentro del if para que correr esto otra vez no marque como enviados
    -- archivos que quedaron pendientes.
    update public.documentos_lote set enviado_at = created_at where enviado_at is null;
  end if;
end $$;

-- Para el aviso de "cargados sin enviar" y para el envío: buscan por lote
-- solo las filas pendientes.
create index if not exists documentos_lote_pendientes_idx
  on public.documentos_lote (application_id)
  where enviado_at is null;

comment on column public.documentos_lote.enviado_at is
  'Cuándo se mandó este archivo al webhook de traducción. NULL = cargado pero sin enviar.';
