// Definición de campos de cada tipo de dato (onboarding y Ajustes los comparten).

import { dinero, fechaCorta } from '@/lib/finanzas/formato'
import type { Campo } from './EditorFilas'
import { FRECUENCIA_LABEL } from './ui'

const frecuencias = (lista: string[]) => lista.map((v) => ({ valor: v, label: FRECUENCIA_LABEL[v] }))
const RECURRENTES = frecuencias(['semanal', 'quincenal', 'mensual', 'trimestral', 'anual'])

export const CAMPOS_INGRESO: Campo[] = [
  { tipo: 'texto', nombre: 'name', label: 'Nombre', requerido: true, placeholder: 'Ej. Sueldo' },
  {
    tipo: 'chips',
    nombre: 'type',
    label: '¿Cómo te pagan?',
    requerido: true,
    opciones: [
      { valor: 'empleo_tfn', label: 'Empleo (TFN)' },
      { valor: 'contrato_abn', label: 'Contrato (ABN)' },
      { valor: 'negocio', label: 'Negocio' },
    ],
    ayuda: 'Por ABN normalmente no te retienen impuestos: esa parte te toca separarla a ti.',
  },
  { tipo: 'monto', nombre: 'amount', label: 'Lo mínimo que te entra cada vez', requerido: true },
  { tipo: 'chips', nombre: 'frequency', label: '¿Cada cuánto?', requerido: true, opciones: frecuencias(['semanal', 'quincenal', 'mensual']) },
  { tipo: 'fecha', nombre: 'next_date', label: 'Próximo pago', ayuda: 'El día que te llega la plata.' },
  { tipo: 'si_no', nombre: 'tax_withheld', label: '¿Te retienen impuestos?' },
]

export const resumenIngreso = (f: any) => ({
  titulo: f.name,
  detalle: `${dinero(Number(f.amount))} · ${FRECUENCIA_LABEL[f.frequency]}${f.next_date ? ` · próximo ${fechaCorta(f.next_date)}` : ''}`,
})

export const CAMPOS_GASTO: Campo[] = [
  { tipo: 'texto', nombre: 'name', label: 'Nombre', requerido: true },
  { tipo: 'monto', nombre: 'amount', label: 'Monto', requerido: true },
  // Sin valor por defecto: nunca se asume semanal.
  { tipo: 'chips', nombre: 'frequency', label: '¿Cada cuánto?', requerido: true, opciones: RECURRENTES },
  { tipo: 'fecha', nombre: 'next_due', label: 'Próximo pago (opcional)', ayuda: 'Si tiene fecha fija (arriendo, bills), ponla. Comida o transporte pueden ir sin fecha.' },
]

export const PRESETS_GASTO = [
  { label: 'Arriendo', valores: { name: 'Arriendo', category: 'arriendo' } },
  { label: 'Bills', valores: { name: 'Bills (luz, agua, internet)', category: 'bills' } },
  { label: 'Comida', valores: { name: 'Comida', category: 'comida' } },
  { label: 'Transporte', valores: { name: 'Transporte', category: 'transporte' } },
  { label: 'Gym', valores: { name: 'Gym', category: 'gym' } },
  { label: 'Celular', valores: { name: 'Celular', category: 'celular' } },
  { label: 'Suscripciones', valores: { name: 'Suscripciones', category: 'suscripciones' } },
]

export const CAMPOS_PAGO_GRANDE: Campo[] = [
  { tipo: 'texto', nombre: 'name', label: '¿Qué es?', requerido: true, placeholder: 'Ej. Matrícula' },
  { tipo: 'monto', nombre: 'amount', label: 'Monto', requerido: true },
  { tipo: 'fecha', nombre: 'next_due', label: 'Fecha exacta', requerido: true },
  { tipo: 'chips', nombre: 'frequency', label: '¿Se repite?', requerido: true, opciones: frecuencias(['unico', 'trimestral', 'anual']) },
]

export const PRESETS_PAGO_GRANDE = [
  { label: 'Estudio', valores: { name: 'Estudio', category: 'estudio' } },
  { label: 'Impuestos', valores: { name: 'Impuestos', category: 'impuestos' } },
  { label: 'Seguro', valores: { name: 'Seguro', category: 'seguros' } },
]

export const resumenGasto = (f: any) => ({
  titulo: f.name,
  detalle: `${dinero(Number(f.amount))} · ${FRECUENCIA_LABEL[f.frequency]}${f.next_due ? ` · ${fechaCorta(f.next_due)}` : ''}`,
})

export const CAMPOS_CUENTA: Campo[] = [
  { tipo: 'texto', nombre: 'name', label: 'Nombre de la cuenta', requerido: true, placeholder: 'Ej. Everyday' },
  {
    tipo: 'chips',
    nombre: 'kind',
    label: 'Tipo',
    requerido: true,
    opciones: [
      { valor: 'personal', label: 'Personal' },
      { valor: 'negocio', label: 'Negocio' },
      { valor: 'tarjeta', label: 'Tarjeta' },
      { valor: 'bnpl', label: 'BNPL' },
    ],
  },
  { tipo: 'monto', nombre: 'balance', label: 'Saldo hoy', requerido: true },
  { tipo: 'monto', nombre: 'available', label: 'Disponible (si es distinto)' },
  { tipo: 'fecha', nombre: 'as_of', label: 'Saldo al día', requerido: true },
  { tipo: 'si_no', nombre: 'is_untouchable', label: '¿Es plata que no quieres tocar?', ayuda: 'No la contamos como disponible; solo aparece como último recurso.' },
]

export const resumenCuenta = (f: any) => ({
  titulo: `${f.name}${f.is_untouchable ? ' · intocable' : ''}`,
  detalle: `${dinero(Number(f.balance))} al ${fechaCorta(f.as_of)}`,
})

export const CAMPOS_META: Campo[] = [
  { tipo: 'texto', nombre: 'name', label: 'Meta', requerido: true, placeholder: 'Ej. Viaje a Colombia' },
  { tipo: 'monto', nombre: 'target_amount', label: 'Monto', requerido: true },
  { tipo: 'fecha', nombre: 'target_date', label: 'Para cuándo' },
]

export const resumenMeta = (f: any) => ({
  titulo: f.name,
  detalle: `${dinero(Number(f.target_amount))}${f.target_date ? ` para el ${fechaCorta(f.target_date)}` : ''}`,
})
