import { FinanzasTransaccion, FinanzasReporte, FinanzasRegla, FinanzasPerfil } from './types';

// Determinar reportes
export function computeReport(mes: string, transacciones: FinanzasTransaccion[], perfil: FinanzasPerfil): Omit<FinanzasReporte, 'narrativa'> {
  let total_ingreso_operativo = 0;
  let total_ingreso_hospitality = 0;
  let total_ingreso_otro = 0;
  let total_gasto_personal = 0;
  let total_gasto_negocio = 0;
  let total_reembolsos = 0;

  for (const t of transacciones) {
    if (t.tipo === 'transferencia_interna') continue;

    if (t.tipo === 'ingreso') {
      if (t.grupo === 'negocio' && (t.categoria.startsWith('Ingreso cliente') || t.categoria === 'Ingreso cliente LATAM VISA')) {
        total_ingreso_operativo += t.monto;
      } else if (t.categoria === 'Hospitality') {
        total_ingreso_hospitality += t.monto;
      } else {
        total_ingreso_otro += t.monto;
      }
    } else if (t.tipo === 'gasto') {
      const amt = Math.abs(t.monto);
      if (t.grupo === 'personal') {
        total_gasto_personal += amt;
      } else if (t.grupo === 'negocio') {
        total_gasto_negocio += amt;
      }
    } else if (t.tipo === 'reembolso') {
      total_reembolsos += Math.abs(t.monto);
    }
  }

  const ingreso_total_real = total_ingreso_operativo + total_ingreso_hospitality + total_ingreso_otro;
  const gasto_total = total_gasto_personal + total_gasto_negocio;
  const ahorro_real = ingreso_total_real - gasto_total;
  const ahorro_sugerido = Math.max(0, (ingreso_total_real - perfil.numero_supervivencia)) * (perfil.porcentaje_ahorro / 100);

  return {
    mes,
    total_ingreso_operativo,
    total_ingreso_hospitality,
    total_ingreso_otro,
    total_gasto_personal,
    total_gasto_negocio,
    total_reembolsos,
    ingreso_total_real,
    gasto_total,
    ahorro_real,
    ahorro_sugerido
  };
}

export function classifyDeterministically(
  descripcion: string,
  reglas: FinanzasRegla[]
): Pick<FinanzasTransaccion, 'categoria' | 'tipo' | 'grupo' | 'es_recurrente'> | null {
  const descUpper = descripcion.toUpperCase();
  for (const regla of reglas) {
    if (descUpper.includes(regla.patron.toUpperCase())) {
      return {
        categoria: regla.categoria,
        tipo: regla.tipo,
        grupo: regla.grupo,
        es_recurrente: regla.es_recurrente,
      };
    }
  }
  return null;
}
