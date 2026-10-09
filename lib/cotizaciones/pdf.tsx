// PDF de la cotización: fondos de Canva a página completa + solo los datos
// dinámicos encima. Requisitos, Tiempos y Bonos ya vienen en los fondos.
// Todas las posiciones están en ./pdf-layout-canada.ts.

import fs from 'node:fs'
import path from 'node:path'
import React from 'react'
import sharp from 'sharp'
import QRCode from 'qrcode'

// @react-pdf/renderer se carga con un import nativo que webpack ignora:
// - empaquetado en la capa de servidor de Next usaría el React "react-server"
//   (sin Component) y falla al renderizar;
// - como externo normal es ESM con top-level await y vuelve "async" a los
//   módulos que lo usan, lo que rompe el build de producción.
// Así Node lo carga desde node_modules con el React completo.
type ReactPdf = typeof import('@react-pdf/renderer')
let RP: ReactPdf

async function cargarReactPdf(): Promise<ReactPdf> {
  RP ??= (await import(/* webpackIgnore: true */ '@react-pdf/renderer')) as ReactPdf
  return RP
}
import { desglosePrecios, formatFecha, formatMoney, linkPago, type Cotizacion } from '.'
import { getContenido } from './contenido'
import { traduccionPorPersonaDe } from './tarifas'
import { COLORES, PAGINA_1, PAGINA_2, PAGINA_3, PNG_ALTO, PNG_ANCHO, RETOQUES } from './pdf-layout-canada'

const A4 = { ancho: 595.28, alto: 841.89 }
const K = A4.ancho / PNG_ANCHO // px del PNG -> pt
const pt = (px: number) => px * K
const MM = 72 / 25.4

const DIR_FONDOS = path.join(process.cwd(), 'public', 'cotizacion', 'canada')
const DIR_FUENTES = path.join(process.cwd(), 'public', 'fonts')

// ── Fuentes ────────────────────────────────────────────────────────────────
// Si falta un archivo se usa Helvetica (y queda en el log).
const FUENTES = {
  funnel: [
    { file: 'Funnel_Display/static/FunnelDisplay-Medium.ttf', fontWeight: 500 },
    { file: 'Funnel_Display/static/FunnelDisplay-SemiBold.ttf', fontWeight: 600 },
    { file: 'Funnel_Display/static/FunnelDisplay-Bold.ttf', fontWeight: 700 },
  ],
  monument: [{ file: 'PPMonument/PPMonumentExtended-Black.otf', fontWeight: 900 }],
}

let familias: { cuerpo: string; display: string } | null = null

function registrarFuentes() {
  if (familias) return familias
  const registrar = (familia: string, archivos: { file: string; fontWeight: number }[]) => {
    const faltan = archivos.filter((a) => !fs.existsSync(path.join(DIR_FUENTES, a.file)))
    if (faltan.length) {
      console.warn(`[PDF] Faltan fuentes (${faltan.map((f) => f.file).join(', ')}); se usa Helvetica.`)
      return false
    }
    RP.Font.register({
      family: familia,
      fonts: archivos.map((a) => ({ src: path.join(DIR_FUENTES, a.file), fontWeight: a.fontWeight })),
    })
    return true
  }
  const funnel = registrar('FunnelDisplay', FUENTES.funnel)
  const monument = registrar('PPMonumentExtended', FUENTES.monument)
  // Sin guiones automáticos: cortan palabras en español de forma rara.
  RP.Font.registerHyphenationCallback((palabra) => [palabra])
  familias = {
    cuerpo: funnel ? 'FunnelDisplay' : 'Helvetica',
    display: monument ? 'PPMonumentExtended' : funnel ? 'FunnelDisplay' : 'Helvetica-Bold',
  }
  return familias
}

// ── Fondos (con retoques) ──────────────────────────────────────────────────
type Rect = { x: number; y: number; ancho: number; alto: number }

interface Raw {
  data: Buffer
  ancho: number
  alto: number
}

async function cargarRaw(archivo: string): Promise<Raw> {
  const { data, info } = await sharp(archivo).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  if (info.width !== PNG_ANCHO || info.height !== PNG_ALTO) {
    throw new Error(`${archivo} mide ${info.width}x${info.height}; se esperaba ${PNG_ANCHO}x${PNG_ALTO}`)
  }
  return { data, ancho: info.width, alto: info.height }
}

// ── Parches sobre el fondo ──
// El papel de Canva tiene textura y un degradé suave (más claro/verde hacia
// los bordes), así que un parche se corrige color por celdas de 64 px
// (interpolando entre celdas) y se funde arriba y abajo para que no se note.
const CELDA = 64
const FUNDIDO = 24

const esPapel = (R: number, G: number, B: number) => (R + G + B) / 3 > 170 && Math.max(R, G, B) - Math.min(R, G, B) < 60

// Color medio del papel por celda en una región (ignora texto y líneas).
function mediasPorCelda(img: Raw, r: Rect) {
  const cols = Math.ceil(r.ancho / CELDA)
  const filas = Math.ceil(r.alto / CELDA)
  const suma = new Float64Array(cols * filas * 3)
  const n = new Float64Array(cols * filas)
  for (let y = 0; y < r.alto; y += 2) {
    for (let x = 0; x < r.ancho; x += 2) {
      const i = ((r.y + y) * img.ancho + (r.x + x)) * 3
      const R = img.data[i], G = img.data[i + 1], B = img.data[i + 2]
      if (!esPapel(R, G, B)) continue
      const c = Math.floor(y / CELDA) * cols + Math.floor(x / CELDA)
      suma[c * 3] += R; suma[c * 3 + 1] += G; suma[c * 3 + 2] += B
      n[c]++
    }
  }
  // Celdas sin papel (mucho texto): usan la media de toda la región.
  let tot = [0, 0, 0], totN = 0
  for (let c = 0; c < cols * filas; c++) { totN += n[c]; for (let k = 0; k < 3; k++) tot[k] += suma[c * 3 + k] }
  const global = tot.map((v) => (totN ? v / totN : 235))
  const medias = new Float64Array(cols * filas * 3)
  for (let c = 0; c < cols * filas; c++) for (let k = 0; k < 3; k++) medias[c * 3 + k] = n[c] > 20 ? suma[c * 3 + k] / n[c] : global[k]
  return { medias, cols, filas }
}

function interpolar(m: ReturnType<typeof mediasPorCelda>, x: number, y: number, k: number) {
  const fx = Math.min(Math.max(x / CELDA - 0.5, 0), m.cols - 1)
  const fy = Math.min(Math.max(y / CELDA - 0.5, 0), m.filas - 1)
  const x0 = Math.floor(fx), y0 = Math.floor(fy)
  const x1 = Math.min(x0 + 1, m.cols - 1), y1 = Math.min(y0 + 1, m.filas - 1)
  const tx = fx - x0, ty = fy - y0
  const v = (cx: number, cy: number) => m.medias[(cy * m.cols + cx) * 3 + k]
  return (v(x0, y0) * (1 - tx) + v(x1, y0) * tx) * (1 - ty) + (v(x0, y1) * (1 - tx) + v(x1, y1) * tx) * ty
}

/**
 * Copia `origen` (tomado de `fuente`) sobre `destino` en `lienzo`.
 * - corregir: ajusta el color al papel que había en el destino.
 * - fundirArriba/fundirAbajo: mezcla las primeras/últimas filas con lo que ya
 *   había. Solo en bordes que caen sobre papel: si debajo hay texto, se verían
 *   letras fantasma.
 */
function pegar(
  lienzo: Raw,
  fuente: Raw,
  origen: Rect,
  destino: { x: number; y: number },
  opciones: { corregir?: boolean; fundirArriba?: boolean; fundirAbajo?: boolean; fundirLados?: boolean } = {},
) {
  const mo = opciones.corregir ? mediasPorCelda(fuente, origen) : null
  const md = opciones.corregir ? mediasPorCelda(fuente, { ...destino, ancho: origen.ancho, alto: origen.alto }) : null
  const copia = Buffer.from(lienzo.data)
  for (let y = 0; y < origen.alto; y++) {
    const alfa = Math.min(
      1,
      opciones.fundirArriba ? (y + 1) / FUNDIDO : 1,
      opciones.fundirAbajo ? (origen.alto - y) / FUNDIDO : 1,
    )
    for (let x = 0; x < origen.ancho; x++) {
      const a = opciones.fundirLados ? Math.min(alfa, (x + 1) / FUNDIDO, (origen.ancho - x) / FUNDIDO) : alfa
      const i = ((origen.y + y) * fuente.ancho + (origen.x + x)) * 3
      const j = ((destino.y + y) * lienzo.ancho + (destino.x + x)) * 3
      for (let k = 0; k < 3; k++) {
        let v = fuente.data[i + k]
        if (mo && md) v += interpolar(md, x, y, k) - interpolar(mo, x, y, k)
        v = a * v + (1 - a) * copia[j + k]
        lienzo.data[j + k] = Math.max(0, Math.min(255, Math.round(v)))
      }
    }
  }
}

function clonar(img: Raw): Raw {
  return { ...img, data: Buffer.from(img.data) }
}

async function aJpeg(img: Raw): Promise<Buffer> {
  return sharp(img.data, { raw: { width: img.ancho, height: img.alto, channels: 3 } })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()
}

async function fondoPagina1(tieneVisaUsa: boolean): Promise<Buffer> {
  const r = RETOQUES.pagina1
  const original = await cargarRaw(path.join(DIR_FONDOS, 'pagina-1.png'))
  const img = clonar(original)

  if (!tieneVisaUsa) {
    const f = r.fraseVisaUsa
    pegar(img, original, { x: f.x, y: r.franjaRelleno.y, ancho: f.ancho, alto: f.alto }, { x: f.x, y: f.y }, { corregir: true })
  }

  // Bajar el bloque de Requisitos (ya sin la frase, si aplica) y rellenar el hueco.
  const b = r.bloqueRequisitos
  const conFrase = clonar(img)
  // El relleno se funde solo arriba (papel); abajo lo cubre el bloque.
  pegar(img, original, { x: 0, y: r.franjaRelleno.y, ancho: img.ancho, alto: r.hueco.alto }, { x: 0, y: r.hueco.y }, { corregir: true, fundirArriba: true })
  // El bloque se corrige al color del papel de su nuevo lugar, sin fundir.
  pegar(img, conFrase, { x: 0, y: b.y, ancho: img.ancho, alto: b.alto }, { x: 0, y: b.y + r.desplazamiento }, { corregir: true })
  return aJpeg(img)
}

async function fondoPagina2(): Promise<Buffer> {
  const r = RETOQUES.pagina2
  const original = await cargarRaw(path.join(DIR_FONDOS, 'pagina-2.png'))
  const img = clonar(original)
  // Se rellena en franjas; solo el borde superior e inferior del área se funden.
  for (let dy = 0; dy < r.tabla.alto; dy += r.franjaRelleno.alto) {
    const alto = Math.min(r.franjaRelleno.alto, r.tabla.alto - dy)
    pegar(
      img,
      original,
      { x: r.tabla.x, y: r.franjaRelleno.y, ancho: r.tabla.ancho, alto },
      { x: r.tabla.x, y: r.tabla.y + dy },
      { corregir: true, fundirArriba: dy === 0, fundirAbajo: dy + alto >= r.tabla.alto, fundirLados: true },
    )
  }
  return aJpeg(img)
}

async function fondoPagina3(): Promise<Buffer> {
  return aJpeg(await cargarRaw(path.join(DIR_FONDOS, 'pagina-3.png')))
}

// Los fondos no cambian entre cotizaciones: se preparan una vez por proceso.
const cacheFondos = new Map<string, Promise<Buffer>>()
function fondo(clave: string, crear: () => Promise<Buffer>) {
  if (!cacheFondos.has(clave)) {
    const p = crear()
    p.catch(() => cacheFondos.delete(clave))
    cacheFondos.set(clave, p)
  }
  return cacheFondos.get(clave)!
}

// ── Documento ──────────────────────────────────────────────────────────────
function Fondo({ src }: { src: Buffer }) {
  const { Image } = RP
  // Anclado con top/left/right/bottom (no con width/height): un alto explícito
  // de página completa hace que react-pdf mande lo demás a otra página.
  return <Image fixed src={{ data: src, format: 'jpg' }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
}

function Abs({
  x,
  y,
  ancho,
  children,
  style,
}: {
  x: number
  y: number
  ancho?: number
  children: React.ReactNode
  style?: Record<string, unknown>
}) {
  const { Text } = RP
  return (
    <Text style={{ position: 'absolute', left: pt(x), top: pt(y), ...(ancho ? { width: pt(ancho) } : {}), color: COLORES.tinta, ...style }}>
      {children}
    </Text>
  )
}

interface DatosPdf {
  cot: Cotizacion
  fondos: [Buffer, Buffer, Buffer]
  qr: string
  traduccionPorPersona: number | null
}

function CotizacionPdf({ cot, fondos, qr, traduccionPorPersona }: DatosPdf) {
  const { Document, Image, Link, Page, Text, View } = RP
  const f = registrarFuentes()
  const contenido = getContenido(cot.tipo_visa, cot.pais_destino, cot.pais_origen)
  const d = desglosePrecios(cot, traduccionPorPersona)
  const fmt = (n: number) => formatMoney(n, cot.moneda)
  // "7 DE OCTUBRE, 2026", como en el diseño de Canva.
  const fecha = (iso: string) => formatFecha(iso).toUpperCase().replace(/ DE (\d{4})$/, ', $1')
  const link = linkPago(cot.token)
  const p1 = PAGINA_1
  const t = PAGINA_2.tabla
  const [c0, c1, c2, c3] = t.columnas
  const anchoCol = [c1 - c0, c2 - c1, c3 - c2]
  const borde = `${pt(2)} solid ${COLORES.borde}`
  const conTinta = { fontFamily: f.cuerpo, color: COLORES.tinta }

  type Celda = { texto: string; neon?: boolean; tipo: 'concepto' | 'monto' | 'cuando' | 'encabezado' | 'grande' }
  const filas: { alto: number; celdas: [Celda, Celda, Celda] }[] = [
    {
      alto: t.altoEncabezado,
      celdas: [
        { texto: 'Qué pagan', neon: true, tipo: 'encabezado' },
        { texto: `Total para los ${cot.personas}`, neon: true, tipo: 'encabezado' },
        { texto: 'Cuándo se paga', neon: true, tipo: 'encabezado' },
      ],
    },
    {
      alto: t.altoFila,
      celdas: [
        { texto: `${contenido?.precios.asesoria ?? 'Asesoría LATAM VISA'} (${fmt(d.asesoriaPorPersona)} por persona)`, tipo: 'concepto' },
        { texto: fmt(cot.asesoria_total), tipo: 'monto' },
        { texto: contenido?.precios.alIniciar ?? 'Al iniciar', tipo: 'cuando' },
      ],
    },
    {
      alto: t.altoFila,
      celdas: [
        {
          texto:
            (contenido?.precios.traducciones ?? 'Traducciones') +
            (d.traduccionAntes != null ? ` (antes ${fmt(d.traduccionAntes)}, ¡ahorran ${fmt(d.ahorroTraduccion)}!)` : ''),
          tipo: 'concepto',
        },
        { texto: fmt(cot.traducciones_total), tipo: 'monto' },
        { texto: contenido?.precios.alIniciar ?? 'Al iniciar', tipo: 'cuando' },
      ],
    },
    {
      alto: t.altoFila,
      celdas: [
        { texto: contenido?.precios.gobierno ?? 'Derechos del gobierno (estimado)', tipo: 'concepto' },
        { texto: fmt(cot.gobierno_estimado), tipo: 'monto' },
        { texto: contenido?.precios.alEnviar ?? 'Al enviar la solicitud', tipo: 'cuando' },
      ],
    },
    {
      alto: t.altoFila,
      celdas: [
        { texto: 'TOTAL', neon: true, tipo: 'encabezado' },
        { texto: fmt(d.totalConGobierno), neon: true, tipo: 'monto' },
        { texto: '', tipo: 'cuando' },
      ],
    },
    {
      alto: t.altoFila,
      celdas: [
        { texto: 'Valor real por persona', tipo: 'grande' },
        { texto: '', tipo: 'monto' },
        { texto: fmt(d.valorRealPorPersona), neon: true, tipo: 'monto' },
      ],
    },
  ]

  const estiloCelda = (c: Celda, col: number) => {
    const alineaDerecha = col > 0
    const size =
      c.tipo === 'encabezado' || c.tipo === 'grande'
        ? t.sizeEncabezado
        : c.tipo === 'monto'
          ? t.sizeMonto
          : c.tipo === 'cuando'
            ? t.sizeCuando
            : t.sizeConcepto
    return {
      ...conTinta,
      fontSize: size,
      fontWeight: c.tipo === 'concepto' || c.tipo === 'cuando' ? 600 : 700,
      textAlign: (alineaDerecha ? 'right' : 'left') as 'right' | 'left',
      lineHeight: 1.25,
    }
  }

  return (
    <Document title={`Cotización ${cot.numero} - LATAM VISA`} author="LATAM VISA">
      {/* ── Página 1 ── */}
      <Page size="A4" style={{ position: 'relative' }}>
        <Fondo src={fondos[0]} />
        <Text
          style={{
            position: 'absolute',
            left: 0,
            width: pt(p1.numero.right),
            top: pt(p1.numero.y),
            textAlign: 'right',
            fontFamily: f.display,
            fontWeight: 900,
            fontSize: p1.numero.size,
            color: COLORES.tinta,
          }}
        >
          {cot.numero}
        </Text>
        <Abs x={p1.grupo.x} y={p1.grupo.y} style={{ ...conTinta, fontWeight: 700, fontSize: p1.grupo.size, textDecoration: 'underline' }}>
          {`GRUPO DE ${cot.personas} ${cot.personas === 1 ? 'PERSONA' : 'PERSONAS'}`}
        </Abs>
        <Abs x={p1.fechas.x} y={p1.fechas.y} style={{ ...conTinta, fontWeight: 700, fontSize: p1.fechas.size }}>
          {`Fecha: ${fecha(cot.created_at)}   ·   Válida hasta: ${fecha(cot.vence_el)}`}
        </Abs>
        {cot.cliente_nombre ? (
          <Abs x={p1.cliente.x} y={p1.cliente.y} ancho={1150} style={{ ...conTinta, fontWeight: 600, fontSize: p1.cliente.size }}>
            {`Para: ${cot.cliente_nombre}`}
          </Abs>
        ) : null}
        {contenido ? (
          <Abs
         
            x={p1.viabilidad.x}
            y={p1.viabilidad.y}
            ancho={p1.viabilidad.ancho}
            style={{ ...conTinta, fontWeight: 600, fontSize: p1.viabilidad.size, lineHeight: p1.viabilidad.interlineado }}
          >
            {contenido.viabilidad(cot.tiene_visa_usa)}
          </Abs>
        ) : null}
        {!cot.tiene_visa_usa ? (
          <Abs x={p1.puntoSinVisa.x} y={p1.puntoSinVisa.y} style={{ ...conTinta, fontWeight: 700, fontSize: p1.puntoSinVisa.size }}>
            .
          </Abs>
        ) : null}
      </Page>

      {/* ── Página 2 ── */}
      <Page size="A4" style={{ position: 'relative' }}>
        <Fondo src={fondos[1]} />
        <View style={{ position: 'absolute', left: pt(c0), top: pt(t.y), width: pt(c3 - c0), borderTop: borde, borderLeft: borde }}>
          {filas.map((fila, i) => (
            <View key={i} style={{ flexDirection: 'row', height: pt(fila.alto) }}>
              {fila.celdas.map((celda, col) => (
                <View
                  key={col}
                  style={{
                    width: pt(anchoCol[col]),
                    height: pt(fila.alto),
                    borderRight: borde,
                    borderBottom: borde,
                    backgroundColor: celda.neon ? COLORES.neon : undefined,
                    justifyContent: 'center',
                    paddingHorizontal: pt(t.padding),
                  }}
                >
                  {celda.texto ? <Text style={estiloCelda(celda, col)}>{celda.texto}</Text> : null}
                </View>
              ))}
            </View>
          ))}
        </View>
        <Abs x={PAGINA_2.paraEmpezar.x} y={PAGINA_2.paraEmpezar.y} style={{ ...conTinta, fontWeight: 700, fontSize: PAGINA_2.paraEmpezar.size }}>
          {`${fmt(cot.monto)} (Asesoría + traducciones)`}
        </Abs>
        <Abs
         
          x={PAGINA_2.pagosDespues.x}
          y={PAGINA_2.pagosDespues.y}
          ancho={PAGINA_2.pagosDespues.ancho}
          style={{ ...conTinta, fontWeight: 600, fontSize: PAGINA_2.pagosDespues.size, lineHeight: PAGINA_2.pagosDespues.interlineado }}
        >
          {contenido?.precios.pagosDespues(cot.gobierno_estimado, cot.moneda) ??
            `Los pagos al gobierno (${fmt(cot.gobierno_estimado)}) se hacen después, cuando enviemos la solicitud.`}
        </Abs>
      </Page>

      {/* ── Página 3 ── */}
      <Page size="A4" style={{ position: 'relative' }}>
        <Fondo src={fondos[2]} />
        <Abs x={PAGINA_3.titulo.x} y={PAGINA_3.titulo.y} style={{ fontFamily: f.display, fontWeight: 900, fontSize: PAGINA_3.titulo.size }}>
          ¿CÓMO EMPEZAR?
        </Abs>
        <Abs
         
          x={PAGINA_3.texto.x}
          y={PAGINA_3.texto.y}
          ancho={PAGINA_3.texto.ancho}
          style={{ ...conTinta, fontWeight: 600, fontSize: PAGINA_3.texto.size, lineHeight: PAGINA_3.texto.interlineado }}
        >
          {`Paguen ${fmt(cot.monto)} (asesoría + traducciones) desde este enlace seguro y empezamos a preparar su solicitud:`}
        </Abs>
        <View style={{ position: 'absolute', left: pt(PAGINA_3.link.x), top: pt(PAGINA_3.link.y), width: pt(PAGINA_3.link.ancho) }}>
          <Link src={link} style={{ ...conTinta, fontWeight: 700, fontSize: PAGINA_3.link.size, textDecoration: 'underline' }}>
            {link}
          </Link>
        </View>
        <Image
          src={qr}
          style={{
            position: 'absolute',
            left: pt(PAGINA_3.qr.x),
            top: pt(PAGINA_3.qr.y),
            width: PAGINA_3.qr.mm * MM,
            height: PAGINA_3.qr.mm * MM,
          }}
        />
        <Abs
         
          x={PAGINA_3.notaQr.x}
          y={PAGINA_3.notaQr.y}
          ancho={PAGINA_3.notaQr.ancho}
          style={{ ...conTinta, fontWeight: 600, fontSize: PAGINA_3.notaQr.size, lineHeight: 1.35 }}
        >
          {`Escaneen el código con la cámara del celular para abrir la cotización ${cot.numero} y pagar.\n\nVálida hasta el ${formatFecha(cot.vence_el)}.`}
        </Abs>
      </Page>
    </Document>
  )
}

export async function generarPdfCotizacion(cot: Cotizacion): Promise<Buffer> {
  const conVisa = Boolean(cot.tiene_visa_usa)
  const [fondos, qr, traduccionPorPersona] = await Promise.all([
    Promise.all([
      fondo(`p1-${conVisa ? 'visa' : 'sinvisa'}`, () => fondoPagina1(conVisa)),
      fondo('p2', fondoPagina2),
      fondo('p3', fondoPagina3),
    ]),
    QRCode.toDataURL(linkPago(cot.token), { margin: 1, width: 600, color: { dark: '#000000', light: '#FFFFFF' } }),
    traduccionPorPersonaDe(cot),
  ])
  const { renderToBuffer } = await cargarReactPdf()
  return renderToBuffer(<CotizacionPdf cot={cot} fondos={fondos as [Buffer, Buffer, Buffer]} qr={qr} traduccionPorPersona={traduccionPorPersona} />)
}
