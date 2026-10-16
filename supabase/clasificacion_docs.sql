-- Clasificación manual de documentos en carpetas de ImmiAccount.
-- Lo corre el dueño a mano en el SQL Editor de Supabase. Idempotente.
--
-- `carpeta`         la escribe n8n (nodo "Asignar Carpetas"). No se toca.
-- `carpeta_manual`  la escribe el admin con "Mover a…". Si tiene valor,
--                   siempre gana sobre `carpeta` y sobre el mapeo por
--                   palabras clave (lib/docs/categorias.ts).
-- NULL en ambas = se clasifica al mostrar, sin escribir nada en la base.

alter table public.documentos_traducidos
  add column if not exists carpeta_manual text;

comment on column public.documentos_traducidos.carpeta_manual is
  'Carpeta de ImmiAccount elegida a mano en el admin ("Mover a…"). Gana sobre carpeta (n8n) y sobre el mapeo automático. NULL = automático.';
