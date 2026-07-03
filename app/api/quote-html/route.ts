import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { FONT_FACE_CSS, LOGO_NEON_DATA_URI } from '@/lib/pdf-assets';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, studentType, cotizacion, stages } = body;

    const templatePath = path.join(process.cwd(), 'templates', 'quote_template.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    // Fallbacks
    const nombre = profile?.nombre || 'Estudiante';
    const edad = profile?.edad || '';
    const pais = profile?.pais || 'LATAM';
    const nivelIngles = profile?.nivelIngles || 'No especificado';
    const pasaporte = profile?.pasaporte || 'No especificado';
    const ciudadLlegada = profile?.ciudadLlegada || 'Australia';

    // 1. Head (Fonts & Logos)
    html = html.replace('<style>', `<style>\n${FONT_FACE_CSS}`);
    html = html.replace(/body\s*\{font-family:"Poppins"/, 'body{font-family:"Funnel"');
    html = html.replace(/\.htitle\s*\{[^\}]*\}/, ".htitle{font-family:'Monument';font-size:15px;font-weight:900;letter-spacing:-.3px;line-height:1.1;}");
    html = html.replace(/\.total\s*\{([^\}]*)\}/, (match, p1) => {
      let newRules = p1.replace(/font-weight:\s*800;?/, "font-weight:900;")
                       .replace(/font-size:\s*18px;?/, "font-size:15px;");
      return `.total{font-family:'Monument';${newRules}}`;
    });
    html = html.replace(/\.rhead h1\s*\{[^\}]*\}/, ".rhead h1{font-family:'Monument';font-size:26px;font-weight:900;color:#0d2b0d;letter-spacing:-.5px;line-height:1.05;}");
    html = html.replace(/\.logo\s*\{[^\}]*\}/, ".logo{height:34px;width:auto;}");
    html = html.replace(/<img class="logo" src="[^"]*"/, `<img class="logo" src="${LOGO_NEON_DATA_URI}"`);
    html = html.replace(/<img class="rlogo" src="[^"]*"/, `<img class="rlogo" src="${LOGO_NEON_DATA_URI}"`);

    // 2. Header
    html = html.replace(/Preparado para <b>.*?<\/b> · Ruta de estudio en Australia/, `Preparado para <b>${nombre}</b> · Ruta de estudio en Australia`);
    html = html.replace(/<span class="htag">.*?<\/span>/, `<span class="htag">PLAN A · DESDE ${pais.toUpperCase()} · ${ciudadLlegada.toUpperCase()}</span>`);

    // 3. Chips
    const chipsHtml = `
      <span class="chip"><b>Nombre:</b> ${nombre}</span>
      <span class="chip"><b>Edad:</b> ${edad} años</span>
      <span class="chip"><b>País:</b> ${pais}</span>
      <span class="chip"><b>Inglés:</b> ${nivelIngles}</span>
      <span class="chip"><b>Pasaporte:</b> ${pasaporte}</span>
      <span class="chip"><b>Llegada:</b> ${ciudadLlegada}</span>
    `;
    html = html.replace(/<div class="chips">.*?<\/div>/s, `<div class="chips">${chipsHtml}</div>`);

    // 4. Tu ruta
    const idxRutaStart = html.indexOf('<div class="h2">Tu ruta');
    const idxInviertesStart = html.indexOf('<div class="h2" style="margin-top:10px;">Lo que inviertes</div>');

    let stagesHtml = (stages || []).map((s: any, i: number) => `
      <div class="stage">
        <div class="stag">Etapa ${i + 1} · ${s.tag}</div>
        <div class="sname">${s.name}</div>
        <div class="smeta">CRICOS ${s.cricos || 'N/A'} · ${s.duration} · ${s.extra || ''}</div>
      </div>
    `).join('');

    const schoolName = cotizacion?.course?.school || 'Australia';
    const newRuta = `<div class="h2">Tu ruta — Plan A · ${schoolName} (${ciudadLlegada})</div>\n      ` + stagesHtml + '\n\n      ';

    html = html.substring(0, idxRutaStart) + newRuta + html.substring(idxInviertesStart);

    // 5. Lo que inviertes
    const idxInviertes = html.indexOf('<div class="h2" style="margin-top:10px;">Lo que inviertes</div>');
    const idxColR = html.indexOf('<div class="col-r">');

    const materialText = cotizacion.blockA.material > 0 ? `AUD ${cotizacion.blockA.material.toLocaleString('de-DE')}` : 'Incluido';
    const durationText = stages && stages.length > 0 ? ` (${stages[0].duration})` : '';

    const inviertesHtml = `
      <div class="itable">
        <div class="irow"><span>Matrícula${durationText}</span><span class="amt">AUD ${cotizacion.blockA.tuition.toLocaleString('de-DE')}</span></div>
        <div class="irow"><span>Materiales</span><span class="amt">${materialText}</span></div>
        <div class="irow"><span>Inscripción / admin</span><span class="amt">AUD ${cotizacion.blockA.enrolment.toLocaleString('de-DE')}</span></div>
        <div class="irow"><span>OSHC · seguro médico</span><span class="amt">AUD ${cotizacion.blockA.oshcTotal.toLocaleString('de-DE')}</span></div>
        <div class="irow"><span>Visa Subclass 500 (incl. recargo)</span><span class="amt">AUD ${cotizacion.blockA.visaTotal.toLocaleString('de-DE')}</span></div>
        ${studentType === 'onshore' && cotizacion.blockA.medicalOnshoreAUD ? `<div class="irow"><span>Examen Médico (Australia)</span><span class="amt">AUD ${cotizacion.blockA.medicalOnshoreAUD.toLocaleString('de-DE')}</span></div>` : ''}
      </div>
      <div class="total"><span>TOTAL</span><span>AUD ${cotizacion.blockA.subtotalAUD.toLocaleString('de-DE')}</span></div>
      ${studentType === 'offshore' && cotizacion.localCostsCOP ? `<div class="cop">+ Costos locales en ${pais} (aparte): Biometría VFS ~COP ${cotizacion.localCostsCOP.biometrics.toLocaleString('es-CO')} · Examen médico ~COP ${cotizacion.localCostsCOP.medical.toLocaleString('es-CO')}</div>` : ''}
    `;

    html = html.substring(0, idxInviertes) + '<div class="h2" style="margin-top:10px;">Lo que inviertes</div>\n      ' + inviertesHtml + '\n    </div>\n\n    ' + html.substring(idxColR);

    // 6. Plan de pagos
    const idxPagosStart = html.indexOf('<table class="ptable">');
    const idxPagosEnd = html.indexOf('</table>') + 8;

    const tuitionMaterial = cotizacion.blockA.tuition + cotizacion.blockA.material;
    const hoy = cotizacion.blockA.enrolment;
    const plus5 = cotizacion.blockA.visaTotal + (studentType === 'onshore' ? (cotizacion.blockA.medicalOnshoreAUD || 0) : 0);
    const plus10 = cotizacion.blockA.oshcTotal;
    
    let plus15 = tuitionMaterial;
    let cuota6 = 0, cuota9 = 0, cuota12 = 0, cuota15 = 0;
    const hasCuotas = stages && stages.length > 1;

    if (hasCuotas) {
        plus15 = Math.round((tuitionMaterial * 0.38) / 100) * 100;
        const remaining = tuitionMaterial - plus15;
        const baseCuota = Math.round((remaining / 4) / 100) * 100;
        cuota6 = baseCuota;
        cuota9 = baseCuota;
        cuota12 = baseCuota;
        cuota15 = remaining - (baseCuota * 3);
    }

    let pagosHtml = `
      <table class="ptable">
        <thead><tr><th>Cuándo</th><th>Concepto</th><th>Monto</th></tr></thead>
        <tbody>
          <tr><td class="pw">Hoy</td><td>Reserva de cupo + inscripción</td><td class="amt">AUD ${hoy.toLocaleString('de-DE')}</td></tr>
          <tr><td class="pw">+5 días</td><td>Visa Subclass 500${studentType === 'onshore' && cotizacion.blockA.medicalOnshoreAUD ? ' + Examen Médico' : ''}</td><td class="amt">AUD ${plus5.toLocaleString('de-DE')}</td></tr>
          <tr><td class="pw">+10 días</td><td>OSHC · seguro médico</td><td class="amt">AUD ${plus10.toLocaleString('de-DE')}</td></tr>
          <tr><td class="pw">+15 días</td><td>${hasCuotas ? 'Matrícula Etapa 1' : 'Matrícula completa + materiales'}</td><td class="amt">AUD ${plus15.toLocaleString('de-DE')}</td></tr>
    `;

    if (hasCuotas) {
      pagosHtml += `
          <tr><td class="pw">Mes 6</td><td>Etapa 2 · cuota 1</td><td class="amt">AUD ${cuota6.toLocaleString('de-DE')}</td></tr>
          <tr><td class="pw">Mes 9</td><td>Etapa 2 · cuota 2</td><td class="amt">AUD ${cuota9.toLocaleString('de-DE')}</td></tr>
          <tr><td class="pw">Mes 12</td><td>Etapa 2 · cuota 3</td><td class="amt">AUD ${cuota12.toLocaleString('de-DE')}</td></tr>
          <tr><td class="pw">Mes 15</td><td>Etapa 2 · cuota final</td><td class="amt">AUD ${cuota15.toLocaleString('de-DE')}</td></tr>
      `;
    }
    pagosHtml += `</tbody></table>`;

    html = html.substring(0, idxPagosStart) + pagosHtml + html.substring(idxPagosEnd);

    // 7. Solvencia blockB replace
    if (cotizacion.blockB?.subtotalAUD) {
      html = html.replace('~AUD 29.710 de manutención (12 meses) + matrícula del primer año + tiquete aéreo de ida.', `~AUD ${cotizacion.blockB.subtotalAUD.toLocaleString('de-DE')} (fondos de manutención + estudios + tiquete).`);
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error('Error generating quote HTML:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
