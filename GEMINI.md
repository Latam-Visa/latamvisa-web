# LATAM VISA — Implementation Blueprint Prompt
## Para usar en Antigravity / Claude Code / Cursor

---

**ACTÚA COMO:** Un Desarrollador Creativo de clase mundial e Ingeniero Full-Stack Senior, especializado en experiencias web cinematográficas y premium usando Next.js, Tailwind CSS y Framer Motion. Tienes experiencia en sitios de servicios migratorios y agencias de alto valor.

---

## LA TAREA

Construye el sitio web completo de **LATAM VISA** — una agencia de asesoría migratoria premium para latinoamericanos que desean viajar, estudiar o trabajar en Australia. La página debe combinar impacto visual cinematográfico con claridad profesional y confianza institucional.

**Referencia de estructura y calidad visual:** jeskojets.com  
**NO copies sus animaciones de secuencia de avión/globo. SÍ toma su estructura, tipografía, espaciado y sensación premium.**

---

## ASSETS DISPONIBLES

Tienes estos archivos ya generados. Úsalos exactamente así:

1. **Hero — Secuencia de Sydney:**  
   Imágenes JPEG en `/public/sea1/`  
   Son frames extraídos del video de una cámara que vuela hacia Sydney, Australia.  
   Úsalas para un efecto scrollytelling: al hacer scroll, la cámara "aterriza" en Sydney.

2. **NO hay más secuencias de video para otras secciones.**  
   El resto del sitio usa diseño estático premium con animaciones suaves de Framer Motion.

---

## STACK TECNOLÓGICO

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Animaciones:** Framer Motion
- **Scroll suave:** Lenis (@studio-freight/lenis)
- **Íconos:** Lucide React
- **Fuentes:** Geist (títulos) + DM Sans (cuerpo) — via next/font

---

## DIRECCIÓN VISUAL Y DE MARCA

### Paleta de colores
```css
--bg-primary: #050505         /* Negro profundo — fondo principal (igual que el logo) */
--bg-secondary: #0D0D0D       /* Negro ligeramente elevado para cards y secciones alternas */
--accent-neon: #C8FF00        /* Verde neón — color de acento principal LATAM VISA (del logo) */
--accent-neon-dim: #A8D900    /* Verde neón atenuado para hovers y estados secundarios */
--accent-neon-glow: rgba(200, 255, 0, 0.15)  /* Verde neón con transparencia para glows y bordes */
--text-primary: #FFFFFF       /* Blanco puro */
--text-secondary: #8A8A8A     /* Gris para subtextos */
--border-subtle: #1A1A1A      /* Bordes muy sutiles */
--border-neon: rgba(200, 255, 0, 0.3)  /* Borde verde neón semitransparente */
--success-green: #C8FF00      /* Verde neón para checkmarks (mismo acento) */
```

### Tipografía
- Títulos grandes: Geist, peso 300-400, espaciado amplio (tracking-widest)
- Subtítulos: DM Sans, peso 400
- Texto cuerpo: DM Sans, peso 300, line-height relajado
- Labels/tags: Geist Mono, uppercase, tracking extremo

### Estética
- Modo oscuro de alto contraste con acentos verde neón (#C8FF00) — tomado directamente del logo
- Negro puro como base, verde neón como único color de acento (sin mezclar con dorado ni azul)
- Minimalista pero con profundidad: fondos con gradientes sutiles y noise texture
- Líneas divisoras delgadas (1px) en verde neón con opacidad baja (0.2–0.3)
- Números grandes en verde neón como elementos decorativos
- Banderas de países como elementos visuales (emojis o SVGs)
- El verde neón se usa con moderación para mantener impacto: solo en acentos, bordes activos, CTAs y highlights — nunca como fondo de sección completa

---

## ESTRUCTURA DE PÁGINAS Y SECCIONES

### 1. NAVBAR
```
[LATAM VISA]              [Servicios] [Proceso] [Países] [Contacto]    [Evalúa tu Perfil →]
```
- Fondo transparente que se vuelve negro al scroll
- Logo: usar `logo.png` de `/public/logo.png` — el logo ya tiene el color correcto
- CTA button: borde verde neón (#C8FF00), texto verde neón, hover → fondo verde neón (#C8FF00) texto negro
- Sticky, blur backdrop al hacer scroll

---

### 2. HERO SECTION — `HeroScroll.tsx`
**Efecto scrollytelling con la secuencia de Sydney**

```
Lógica del Canvas:
- Contenedor sticky: h-[500vh]
- Carga frames desde /public/sea1/ (frame_001.jpg → frame_XXX.jpg)
- Mapea scroll progress (0→1) al índice de frame
- Al llegar al último frame: Sydney aparece completamente
- Overlay de texto aparece con fade-in cuando scroll > 80%
```

**Texto sobre el Hero (aparece al final del scroll):**
```
[tag pequeño] ASESORÍA MIGRATORIA PREMIUM

Tu puerta de entrada
a Australia

Ayudamos a latinoamericanos a cumplir el sueño
de estudiar, trabajar y vivir en Australia —
con acompañamiento experto en cada paso.

[Evalúa tu perfil gratis →]     [Ver nuestros servicios ↓]
```

**Elementos flotantes sobre el hero:**
- Esquina superior derecha: Badge animado "🇦🇺 Australia"
- Esquina inferior izquierda: Texto pequeño "est. 2026 — LATAM VISA®"

---

### 3. SECCIÓN ABOUT / INTRO — `AboutSection.tsx`
**Estructura similar a la sección de párrafo grande de Jesko Jets**

Texto grande centrado:
```
LATAM VISA® es una agencia de asesoría migratoria 
especializada en visas de estudio y turismo para Australia, 
con clientes en más de 12 países de Latinoamérica.
```

Luego 4 columnas con propuestas de valor:
```
[01]                    [02]                   [03]                   [04]
Acceso Directo         Tu Tiempo Vale          Claridad Total         Red de Escuelas
a Expertos             Cada Minuto             en Cada Paso           en Australia

Trabajamos contigo     Procesos ágiles y       Sin letra pequeña.     Convenios directos
desde la primera       organizados para        Sabes exactamente      con instituciones
consulta hasta         que tu aplicación       qué necesitas,         en Brisbane,
la aprobación.         avance rápido.          cuándo y cómo.         Sydney y Melbourne.
```

---

### 4. SERVICIOS — `ServicesSection.tsx`
**Cards premium con hover effect — NO carrusel**

Título de sección:
```
Nuestros
Servicios
```

3 cards principales en layout horizontal:

**Card 1 — Visa de Estudiante 🎓**
```
Visa Estudiante
Australia (Subclass 500)

Para quienes quieren estudiar inglés, 
cursos VET o pathway universitario 
con permiso de trabajo incluido.

• Evaluación de perfil
• Estrategia de aplicación  
• Gestión documental
• Acompañamiento completo

[Ver detalles →]
```

**Card 2 — Visa de Turismo ✈️**
```
Visa Turismo
Australia (Subclass 600)

Para visitar Australia, conectar 
con familia o explorar el país 
antes de tomar decisiones mayores.

• Evaluación de elegibilidad
• Checklist de documentos
• Revisión de formularios
• Preparación de entrevista

[Ver detalles →]
```

**Card 3 — Visa USA desde Australia 🇺🇸**
```
Visa de No Inmigrante
Estados Unidos (B1/B2)

Asesoría para aplicar visa 
americana estando en Australia,
nuestro servicio inaugural.

• Estrategia narrativa
• Preparación consular
• Documentación completa
• Seguimiento post-aplicación

[Ver detalles →]
```

---

### 5. PROCESO — `ProcessSection.tsx`
**Timeline horizontal o vertical, estilo premium**

Título:
```
Así funciona
nuestro proceso
```

5 pasos con números grandes en dorado:

```
01              02              03              04              05
Evaluación      Estrategia      Documentos      Aplicación      Seguimiento
de Perfil       Personalizada   y Checklist     y Envío         y Respuesta

Analizamos      Definimos la    Te guiamos en   Enviamos tu     Estamos contigo
tu situación,   mejor ruta      cada documento  aplicación y    hasta la
país, edad y    migratoria      que necesitas   monitoreamos    respuesta final.
objetivos.      para ti.        conseguir.      el proceso.
```

---

### 6. PAÍSES DE ORIGEN — `CountriesSection.tsx`
**Ticker/marquee animado horizontal — similar al de ciudades de Jesko Jets**

Título:
```
Atendemos clientes en todo
Latinoamérica
```

Ticker con banderas y países:
```
🇨🇴 Colombia  •  🇲🇽 México  •  🇵🇪 Perú  •  🇧🇴 Bolivia  •  🇦🇷 Argentina  
•  🇪🇨 Ecuador  •  🇻🇪 Venezuela  •  🇨🇱 Chile  •  🇵🇾 Paraguay  •  🇺🇾 Uruguay  
•  🇧🇷 Brasil  •  🇬🇹 Guatemala  •  🇨🇷 Costa Rica  •  🇩🇴 Rep. Dominicana  •
```
(loop infinito, dos velocidades en dirección opuesta)

Estadísticas debajo:
```
12+              500+            3               #1
Países           Clientes        Ciudades en     Agencia LATAM
Atendidos        Asesorados      Australia       en Brisbane
```

---

### 7. FORMULARIO DE EVALUACIÓN — `EvaluationForm.tsx`
**Esta es la sección MÁS IMPORTANTE del sitio**

Título:
```
Evalúa tu perfil
gratuitamente

En menos de 2 minutos sabrás si calificas 
y recibirás un plan personalizado en tu correo.
```

Formulario de 7 preguntas en pasos (wizard step-by-step):

**Step 1:** ¿Cuál es tu país de origen?  
→ Dropdown con países de LATAM

**Step 2:** ¿Cuántos años tienes?  
→ Input número

**Step 3:** ¿Cuál es tu objetivo principal?  
→ Radio buttons: Estudiar inglés / Estudiar curso técnico (VET) / Turismo / Trabajar y estudiar

**Step 4:** ¿Cuál es tu nivel de inglés actual?  
→ Radio buttons: Básico / Intermedio / Avanzado / No sé exactamente

**Step 5:** ¿Cuánto tiempo planeas quedarte en Australia?  
→ Radio buttons: 1-3 meses / 3-6 meses / 6-12 meses / Más de 1 año

**Step 6:** ¿Cuál es tu presupuesto mensual aproximado (USD)?  
→ Radio buttons: Menos de $1,500 / $1,500 - $2,500 / $2,500 - $4,000 / Más de $4,000

**Step 7:** Tu correo electrónico  
→ Input email + checkbox "Acepto recibir información de LATAM VISA"

**Al enviar:**
- Spinner animado con texto: "Analizando tu perfil..."
- Luego mensaje de éxito: "¡Listo! Revisa tu correo en los próximos minutos 📩"
- POST a webhook n8n: `https://[tu-n8n-url]/webhook/latam-visa-evaluation`

**Diseño del formulario:**
- Fondo: card con borde dorado sutil, glassmorphism
- Progress bar dorada en la parte superior
- Botones "Siguiente" con fondo dorado
- Animación de transición entre steps con Framer Motion (slide)

---

### 8. TESTIMONIOS — `TestimonialsSection.tsx`

Título:
```
Lo que dicen
nuestros clientes
```

3 cards de testimonios:

```
"Pensé que era imposible conseguir la visa 
de estudiante con mi perfil. LATAM VISA 
me ayudó a organizar todo y la aprobaron."

— Valentina M., Colombia
Visa Estudiante Subclass 500 ✅
```

```
"El proceso fue claro desde el día uno.
Sabía exactamente qué documentos necesitaba
y cuándo presentarlos. 100% recomendado."

— Carlos R., Perú  
Visa de Turismo Subclass 600 ✅
```

```
"Estaba en Australia y quería sacar la visa
americana. Me guiaron en todo y la obtuve
en menos de lo esperado."

— Daniela F., México
Visa USA B1/B2 ✅
```

---

### 9. CIUDADES EN AUSTRALIA — `AustraliaCities.tsx`

Título:
```
Operamos en las
principales ciudades
de Australia
```

3 cards con imagen o gradiente representativo:

```
🏙️ Brisbane          🌉 Sydney           🏛️ Melbourne
Nuestra sede         La ciudad más       Capital cultural
principal.           grande y            y educativa.
Convenios con        cosmopolita.        Amplia oferta
escuelas locales.    Escuelas top.       de cursos VET.
```

---

### 10. FOOTER — `Footer.tsx`

```
LATAM            Servicios          Proceso           Legal
VISA®            
                 Visa Estudiante    Evaluación         Términos de uso
Asesoría         Visa Turismo       Estrategia         Política de privacidad
migratoria       Visa USA           Documentación      Disclaimer: No garantizamos
premium para     Consulta inicial   Aplicación         aprobación de visas.
latinoamérica.   
                 
Brisbane, AU     📧 future@latamvisas.com.au
                 📱 WhatsApp: +61 426 779 731

© 2026 LATAM VISA® — Todos los derechos reservados
```

---

## LÓGICA DEL HERO SCROLLYTELLING

```typescript
// HeroScroll.tsx
// Misma lógica que el blueprint original pero con sea1/

const TOTAL_FRAMES = 120 // ajusta según cuántos frames tiene /public/sea1/
const FRAME_PREFIX = '/sea1/frame_'
const FRAME_EXT = '.jpg'

// Hook de precarga
function useImagePreloader(totalFrames: number) {
  const images = useRef<HTMLImageElement[]>([])
  useEffect(() => {
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image()
      img.src = `${FRAME_PREFIX}${String(i).padStart(4, '0')}${FRAME_EXT}`
      images.current.push(img)
    }
  }, [])
  return images
}

// En el componente:
// - Sticky container h-[500vh]
// - Canvas fullscreen
// - useScroll() de Framer Motion para leer scrollYProgress
// - Mapear progress → frameIndex
// - drawImage en el canvas
// - Overlay de texto con opacity basada en scroll > 0.7
```

---

## ANIMACIONES ESPECÍFICAS (sin secuencias de video adicionales)

### Elementos con Framer Motion:
```typescript
// Fade up al entrar en viewport (para todas las secciones)
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}

// Cards con hover
const cardHover = {
  rest: { borderColor: 'rgba(200, 255, 0, 0.2)' },
  hover: { borderColor: 'rgba(200, 255, 0, 0.8)', y: -4 }
}

// Contador de estadísticas (animación de números)
// Usar framer-motion animate con from: 0 to: valor cuando entra en viewport

// Ticker/marquee de países
// CSS animation: infinite scroll horizontal con keyframes
```

### Cursor personalizado:
```css
/* Cursor verde neón circular */
cursor: none;
/* Custom cursor div que sigue el mouse con spring animation */
/* Color: #C8FF00 — Al hover de links: se expande y cambia a "Ver →" */
```

---

## WEBHOOK DE n8n

El formulario envía POST a n8n con este payload:
```json
{
  "pais_origen": "Colombia",
  "edad": 26,
  "objetivo": "Estudiar inglés",
  "nivel_ingles": "Intermedio",
  "duracion": "6-12 meses",
  "presupuesto": "$1,500 - $2,500",
  "email": "cliente@email.com",
  "fecha": "2026-03-14T10:30:00Z",
  "fuente": "latamvisa.com — Formulario Hero"
}
```

---

## ENTREGABLE FINAL

Genera los siguientes archivos:

```
/
├── app/
│   ├── layout.tsx          # Fuentes, Lenis scroll, metadata
│   ├── page.tsx            # Composición de todas las secciones
│   └── globals.css         # Variables CSS, estilos base, cursor
├── components/
│   ├── Navbar.tsx
│   ├── HeroScroll.tsx      # Canvas + secuencia sea1
│   ├── AboutSection.tsx
│   ├── ServicesSection.tsx
│   ├── ProcessSection.tsx
│   ├── CountriesSection.tsx
│   ├── EvaluationForm.tsx  # Wizard + POST a n8n
│   ├── TestimonialsSection.tsx
│   ├── AustraliaCities.tsx
│   └── Footer.tsx
├── hooks/
│   ├── useImagePreloader.ts
│   └── useSmoothScroll.ts
├── lib/
│   └── constants.ts        # URLs, textos, configuración
├── public/
│   └── sea1/              # Frames del video (ya existentes)
├── implementation_plan.md  # Plan detallado paso a paso
└── package.json
```

---

## NOTAS CRÍTICAS PARA EL AGENTE

1. **El hero usa SOLO la carpeta sea1** — no hay sequence-2 ni globe video. No los inventes.
2. **El formulario ES el elemento más importante** — debe funcionar y conectarse al webhook.
3. **El tono es serio y profesional** — NO es una agencia de turismo playful. Es una agencia migratoria premium.
4. **Disclaimer visible** — en el footer y en el formulario: "LATAM VISA no garantiza la aprobación de visas. Brindamos asesoría y acompañamiento profesional."
5. **Mobile-first** — el formulario wizard especialmente debe ser perfecto en móvil.
6. **Rendimiento** — precargar los frames del hero sin bloquear el render inicial.
7. **Textos en español** — todo el contenido del sitio va en español latinoamericano.