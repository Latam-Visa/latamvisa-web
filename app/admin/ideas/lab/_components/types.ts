/* Tipos del Laboratorio de Ideas (/admin/ideas/lab).
   Un "reporte" es el resultado de simular un panel de personas reaccionando a
   una idea de negocio de LATAM VISA Travel. */

export type Voto = 'sí' | 'no' | 'quizás'
export type Nivel = 'alto' | 'medio' | 'bajo'
export type Confianza = 'alta' | 'media' | 'baja'

export interface Persona {
  nombre: string
  perfil: string          // p.ej. "Mujer, 34, Sídney, ingeniera, sin hijos"
  voto: Voto
  razon: string
  objecion?: string
  queLoConvenceria?: string
}

export interface Segmento {
  nombre: string
  interes: Nivel
  nota: string
}

export interface Reporte {
  veredicto: string        // una línea
  confianza: Confianza
  adopcionPct: number      // 0-100: cuántos lo considerarían en serio
  conversionPct: number    // 0-100: cuántos realmente comprarían
  resumen: string
  personas: Persona[]
  segmentos: Segmento[]
  objeciones: string[]
  sensibilidadPrecio: string
  mensajes: string[]       // ángulos de mensaje que mejor convierten
  riesgos: string[]
}

export interface IdeaRow {
  id: string
  titulo: string
  descripcion: string
  publico: string | null
  precio: string | null
  resultado: Reporte | null
  veredicto: string | null
  adopcion: number | null
  created_at: string
}

export interface SimularInput {
  titulo: string
  descripcion: string
  publico: string
  precio: string
  nPersonas?: number
}
