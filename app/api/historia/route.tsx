import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const LINEAS = {
  latam_visa: {
    bg: 'bg-visa.png', zonaTop: 520, zonaHeight: 910, ctaTop: 1440,
    titulo: '#FFFFFF', resalteBg: '#C8FF00', resalteTxt: '#050505',
    kickerBg: 'transparent', kickerTxt: '#C8FF00', sub: '#FFFFFF',
    ctaTxt: '#FFFFFF', waTxt: '#C8FF00',
  },
  latam_travel: {
    bg: 'bg-travel.png', zonaTop: 420, zonaHeight: 830, ctaTop: 1318,
    titulo: '#FFFFFF', resalteBg: '#0B2A5B', resalteTxt: '#FFFFFF',
    kickerBg: 'transparent', kickerTxt: '#0B2A5B', sub: '#0B2A5B',
    ctaTxt: '#0B2A5B', waTxt: '#0B2A5B',
  },
} as const;

type Linea = keyof typeof LINEAS;

// El texto de una imagen no se puede tocar: mostramos el WhatsApp para que escriban directo.
const WA_NUMBER = '+61 426 779 734';
const WA_ICON = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z';

function parseWords(t: string) {
  const out: { w: string; hl: boolean }[] = [];
  t.split('*').forEach((chunk, i) => {
    chunk.split(/\s+/).filter(Boolean).forEach((w) => out.push({ w, hl: i % 2 === 1 }));
  });
  return out;
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (!process.env.HISTORIA_KEY || p.get('k') !== process.env.HISTORIA_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  const linea = (p.get('linea') ?? 'latam_visa') as Linea;
  const cfg = LINEAS[linea];
  if (!cfg) return new Response('Invalid linea', { status: 400 });

  const kicker = (p.get('kicker') ?? '').toUpperCase();
  const titulo = p.get('titulo') ?? '';
  const subtitulo = p.get('subtitulo') ?? '';
  const ctaRaw = p.get('cta') ?? '';
  const cta = /canal de whatsapp/i.test(ctaRaw) ? 'Escríbenos por WhatsApp' : ctaRaw;
  if (!titulo) return new Response('Missing titulo', { status: 400 });

  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/contenido-social/plantillas`;
  const [display, body] = await Promise.all([
    fetch(`${base}/fuente-display`).then((r) => r.arrayBuffer()),
    fetch(`${base}/fuente-body`).then((r) => r.arrayBuffer()),
  ]);

  const words = parseWords(titulo);
  const len = titulo.replace(/\*/g, '').length;
  const size = len <= 40 ? 62 : len <= 70 ? 54 : len <= 100 ? 46 : 40;
  const gap = '0.28em';

  return new ImageResponse(
    (
      <div style={{ width: 1080, height: 1920, display: 'flex', position: 'relative', fontFamily: 'Body' }}>
        <img src={`${base}/${cfg.bg}`} width={1080} height={1920} style={{ position: 'absolute', top: 0, left: 0 }} />

        <div style={{
          position: 'absolute', top: cfg.zonaTop, left: 110, width: 860, height: cfg.zonaHeight,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          {kicker ? (
            <div style={{
              display: 'flex', background: cfg.kickerBg, color: cfg.kickerTxt, fontFamily: 'Display',
              fontSize: 24, padding: 0, marginBottom: 32, letterSpacing: 7,
            }}>{kicker}</div>
          ) : null}

          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', fontFamily: 'Display',
            fontSize: size, lineHeight: 1.2, color: cfg.titulo, rowGap: Math.round(size * 0.12),
          }}>
            {words.map((x, i) => {
              const prevHl = i > 0 && words[i - 1].hl;
              const nextHl = i < words.length - 1 && words[i + 1].hl;
              if (!x.hl) return <div key={i} style={{ display: 'flex', marginRight: gap }}>{x.w}</div>;
              return (
                <div key={i} style={{
                  display: 'flex', background: cfg.resalteBg, color: cfg.resalteTxt,
                  paddingLeft: prevHl ? 0 : '0.14em', paddingRight: nextHl ? gap : '0.14em',
                  marginRight: nextHl ? 0 : gap,
                }}>{x.w}</div>
              );
            })}
          </div>

          {subtitulo ? (
            <div style={{
              display: 'flex', justifyContent: 'center', textAlign: 'center', marginTop: 36,
              fontSize: 32, lineHeight: 1.4, color: cfg.sub,
            }}>{subtitulo}</div>
          ) : null}
        </div>

        {cta ? (
          <div style={{ position: 'absolute', top: cfg.ctaTop, left: 0, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', color: cfg.ctaTxt, fontFamily: 'Body', fontSize: 32 }}>{cta}</div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 14, color: cfg.waTxt, fontFamily: 'Display', fontSize: 30, letterSpacing: 1 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" style={{ marginRight: 14 }}>
                <path d={WA_ICON} fill={cfg.waTxt} />
              </svg>
              {WA_NUMBER}
            </div>
          </div>
        ) : null}
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: 'Display', data: display, weight: 700, style: 'normal' },
        { name: 'Body', data: body, weight: 600, style: 'normal' },
      ],
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
  );
}
