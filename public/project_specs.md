# project_specs.md

Documento vivo de especificaciones (regla 3 de `public/CLAUDE.md`).

---

## Feature actual: Hero cinematográfico de /viajes (3 videos)

### Qué hace y quién lo usa
Rehace el hero de `/viajes` con el estilo de las referencias en
`public/Latam Travel Website references/` (IMG_4922, IMG_4923): paneles de
video cinematográficos, grade oscuro/moody, texto editorial mínimo con
micro-etiquetas en las esquinas. Lo ven los clientes (Australia → Sudamérica
con escala en Europa) al entrar a `/viajes`.

### Fuentes (assets)
- Videos en `public/Barcelona/` y `public/Francia/` (.mov HEVC/4K, pesados).
  Se eligen **3** y se transcodifican a MP4 web (H.264 ~1080p, sin audio,
  faststart) + poster. Destino: `public/viajes/hero/`.

### Decisiones abiertas (requieren tu OK antes de programar)
1. **Alcance**: ¿solo el hero, o re-tematizar toda /viajes a este look oscuro?
   (Un hero oscuro sobre una página clara puede chocar.)
2. **Reglas CLAUDE.md vs /viajes**: ¿/viajes sigue siendo su propio sistema
   claro (excepción documentada) o alineamos todo (oscuro, sin emoji, sin
   inline styles)?
3. **Qué 3 videos**: ¿los elijo yo (te muestro opciones) o me los dices?
4. **Layout del hero**: CORREGIDO — la referencia IMG_4922 está rotada 90°; al
   enderezarla son **3 columnas VERTICALES lado a lado** (cada una un video
   recortado a vertical con object-cover), con el título grande cruzando por
   encima. Desktop: 3 columnas. Móvil (390px): 3 columnas son muy angostas →
   adaptar (p.ej. columnas más estrechas con el título encima, o 1 columna
   dominante). A resolver en el build.
   - Videos elegidos: Sagrada Família (Barcelona/IMG_5988), Torre Eiffel
     (Francia/IMG_5686), Atardecer Niza (Francia/IMG_5883). Los verticales
     (torre, catedral) quedan perfectos; el 3º es horizontal (muestra carretera
     al recortar) — candidato a cambiar por uno más vertical si el user quiere.

### Propuesta (borrador, sujeta a tu OK)
- Hero oscuro a pantalla completa, un video cinematográfico de fondo que
  **rota entre los 3** (crossfade) o 3 paneles apilados con scroll.
- Título grande (PP Monument Extended) + micro-etiquetas en esquinas
  (`1 VIAJE · 2 VACACIONES`, coordenadas del lugar, `2026`).
- CTA a `#cotiza`. Sin emojis. Tailwind (sin inline styles). Grade/overlay
  oscuro (no gradiente genérico: un scrim cinematográfico controlado).

### Archivos a crear/modificar
- `components/viajes/HeroViajes.tsx` (reescritura del hero).
- `app/globals.css` o clases Tailwind (según se decida el tema).
- `public/viajes/hero/*.mp4` + poster (videos transcodificados).
- Posiblemente `app/viajes/fonts.ts` si se usa PP Monument en /viajes.

### "Done" (cómo sé que quedó)
- Hero reproduce los 3 videos en loop, sin audio, con poster, en todos los
  navegadores (H.264). Sin scroll horizontal. 390px perfecto.
- Estilo fiel a las referencias (cinematográfico, oscuro, editorial).
- Build limpio, sin errores nuevos de tsc. Verificado con capturas
  desktop + móvil antes de desplegar.
- No se toca el hero del sitio principal (Sydney flyover, finalizado).

### Estado: ESPERANDO APROBACIÓN (no se ha escrito código del hero)
