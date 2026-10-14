-- =============================================================================
-- Retiro de la versión vieja de Finanzas (single-tenant, /admin/finanzas).
--
-- EJECUTAR SOLO CUANDO:
--   1. /finanzas funcione de punta a punta para ti, y
--   2. hayas copiado tus 55 reglas a fin_rules con el snippet del final de
--      finanzas_v1.sql (verifica: select count(*) from fin_rules; -> 55), y
--   3. el código de /admin/finanzas y /api/finanzas/* ya esté retirado en main.
--
-- Esto borra datos para siempre. Haz un respaldo antes si lo necesitas:
--   select * from finanzas_reglas;  (copiar el resultado)
-- =============================================================================

begin;

drop table if exists public.finanzas_transacciones;
drop table if exists public.finanzas_reportes;
drop table if exists public.finanzas_reglas;
drop table if exists public.finanzas_perfil;

commit;
