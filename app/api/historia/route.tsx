import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const LINEAS = {
  latam_visa: {
    bg: 'bg-visa.png', zonaTop: 520, zonaHeight: 910, ctaTop: 1498,
    titulo: '#FFFFFF', resalteBg: '#C8FF00', resalteTxt: '#050505',
    kickerBg: '#5B2BFF', kickerTxt: '#FFFFFF', sub: '#C9C9D6',
    ctaBg: 'transparent', ctaBorder: '3px solid #FFFFFF', ctaTxt: '#FFFFFF',
  },
  latam_travel: {
    bg: 'bg-travel.png', zonaTop: 420, zonaHeight: 830, ctaTop: 1318,
    titulo: '#FFFFFF', resalteBg: '#0B2A5B', resalteTxt: '#FFFFFF',
    kickerBg: '#FFFFFF', kickerTxt: '#1E88E5', sub: '#F2F8FF',
    ctaBg: '#0B2A5B', ctaBorder: '0px solid transparent', ctaTxt: '#FFFFFF',
  },
} as const;

type Linea = keyof typeof LINEAS;

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
  const cta = p.get('cta') ?? '';
  if (!titulo) return new Response('Missing titulo', { status: 400 });

  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/contenido-social/plantillas`;
  const [display, body] = await Promise.all([
    fetch(`${base}/fuente-display`).then((r) => r.arrayBuffer()),
    fetch(`${base}/fuente-body`).then((r) => r.arrayBuffer()),
  ]);

  const words = parseWords(titulo);
  const len = titulo.replace(/\*/g, '').length;
  const size = len <= 40 ? 84 : len <= 70 ? 72 : len <= 100 ? 62 : 54;
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
              fontSize: 26, padding: '10px 22px', borderRadius: 8, marginBottom: 40, letterSpacing: 1,
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
              display: 'flex', justifyContent: 'center', textAlign: 'center', marginTop: 44,
              fontSize: 42, lineHeight: 1.35, color: cfg.sub,
            }}>{subtitulo}</div>
          ) : null}
        </div>

        {cta ? (
          <div style={{ position: 'absolute', top: cfg.ctaTop, left: 0, width: 1080, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', background: cfg.ctaBg, border: cfg.ctaBorder,
              color: cfg.ctaTxt, borderRadius: 44, padding: '20px 44px', fontFamily: 'Body', fontSize: 34,
            }}>
              {cta}
              <svg width="34" height="34" viewBox="0 0 24 24" style={{ marginLeft: 18 }}>
                <path d="M4 12h15M13 6l6 6-6 6" stroke={cfg.ctaTxt} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
