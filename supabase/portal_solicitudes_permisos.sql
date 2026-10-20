-- Portal del cliente: cierra la escritura de `solicitudes` desde el navegador.
-- Lo corre el dueño a mano en el SQL Editor de Supabase. Idempotente.
--
-- La política de UPDATE (user_id = auth.uid()) deja que el cliente edite
-- CUALQUIER columna de su propia fila con la anon key: estado, activada_at,
-- token, pais... (probado en tests/portal-rls.test.ts). Toda escritura del
-- portal va por el servidor con la service key, así que el navegador no
-- necesita UPDATE. Se quita el permiso a nivel de tabla; la lectura con RLS
-- sigue igual y la service key (admin, webhook, n8n) no se ve afectada.

revoke insert, update, delete on table public.solicitudes from anon, authenticated;
