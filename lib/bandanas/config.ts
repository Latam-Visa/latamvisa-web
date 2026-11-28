// Ajustes de la tienda de bandanas.

/* Costo del envío (AUD, tarifa fija por pedido, solo Australia).
   `null` = todavía sin definir: la preventa queda CERRADA (no se puede pagar).
   Para abrir la venta, poner el monto, p. ej. 10. */
export const ENVIO_AUD: number | null = null

export const VENTA_ABIERTA = ENVIO_AUD !== null
export const MAX_CANTIDAD = 10
export const BANNER_PREVENTA = 'PREVENTA — Entrega estimada en 4–6 semanas. Si no se produce, te devolvemos el 100%.'
export const LEMA = 'Bandana latina para correr, tomar café y parchar.'

export interface Bandana {
  id: string
  slug: string
  name: string
  description: string
  price_aud: number
  images: string[]
}

export const precio = (n: number) => `$${Number.isInteger(Number(n)) ? Number(n) : Number(n).toFixed(2)} AUD`

/* Imágenes del anillo de la portada: 7 diseños (cada uno sale dos veces).
   `null` = cuadro de color sin imagen. Para poner una foto, guardarla en
   public/bandanas/rueda/ y escribir aquí su ruta, p. ej. '/bandanas/rueda/1.jpg'. */
export const RUEDA: (string | null)[] = [null, null, null, null, null, null, null]
