export interface FinanzasPerfil {
  id: number;
  onboarding_completo: boolean;
  meta_nombre: string;
  meta_monto_objetivo: number;
  meta_fecha: string;
  ingreso_mensual_aprox: number;
  gastos_fijos_aprox: number;
  numero_supervivencia: number;
  porcentaje_ahorro: number;
}

export interface FinanzasRegla {
  id: number;
  patron: string;
  categoria: string;
  tipo: 'ingreso' | 'gasto' | 'transferencia_interna' | 'reembolso';
  grupo: 'negocio' | 'personal' | 'na';
  es_recurrente: boolean;
  prioridad: number;
}

export interface FinanzasTransaccion {
  id: string;
  hash_dedupe: string;
  mes_origen: string;
  fecha: string;
  descripcion: string;
  monto: number;
  balance: number | null;
  categoria: string;
  tipo: 'ingreso' | 'gasto' | 'transferencia_interna' | 'reembolso';
  grupo: 'negocio' | 'personal' | 'na';
  es_recurrente: boolean;
  clasificado_por: 'regla' | 'ia' | 'manual';
}

export interface FinanzasReporte {
  mes: string;
  total_ingreso_operativo: number;
  total_ingreso_hospitality: number;
  total_ingreso_otro: number;
  total_gasto_personal: number;
  total_gasto_negocio: number;
  total_reembolsos: number;
  ingreso_total_real: number;
  gasto_total: number;
  ahorro_real: number;
  ahorro_sugerido: number;
  narrativa: string | null;
}
