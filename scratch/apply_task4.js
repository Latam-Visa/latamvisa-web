const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '../app/admin/applications/[id]/_components/AustraliaDetailsClient.tsx')
let content = fs.readFileSync(file, 'utf8')

const replacement = `
            <SectionCard title="Identidad Adicional (ID Nacional)">
              <Row label="Nombres (ID)" value={val(s.nid_given_names)} />
              <Row label="Apellidos (ID)" value={val(s.nid_family_name)} />
              <Row label="Número ID" value={val(s.nid_number)} />
              <Row label="País Emisión" value={val(s.nid_country_of_issue)} />
              <Row label="Emisión" value={fmtDate(s.nid_issue_date)} />
              <Row label="Expiración" value={fmtDate(s.nid_expiry_date)} />
            </SectionCard>

            <SectionCard title="Documentos - Grupo 1: Arraigo">
              <DocumentLink url={signedPhotoUrls.doc_housing_letter} label="Carta de vivienda" />
              <DocumentLink url={signedPhotoUrls.doc_work_cert} label="Certificado laboral" />
              <DocumentLink url={signedPhotoUrls.doc_studies} label="Prueba de estudios" />
              <DocumentLink url={signedPhotoUrls.doc_properties} label="Certificados de propiedad" />
              <DocumentLink url={signedPhotoUrls.doc_vehicle} label="Tarjeta propiedad vehículo" />
              <DocumentLink url={signedPhotoUrls.doc_civil_registries} label="Registros civiles" />
            </SectionCard>

            <SectionCard title="Documentos - Grupo 2: Fondos y Financiación">
              <DocumentLink url={signedPhotoUrls.doc_bank_statements} label="Extractos Bancarios" />
              <DocumentLink url={signedPhotoUrls.doc_pension} label="Prueba de pensión/ingresos" />
              <DocumentLink url={signedPhotoUrls.doc_sponsor_letter} label="Carta Sponsor" />
              <DocumentLink url={signedPhotoUrls.doc_sponsor_address} label="Dirección Sponsor" />
              <DocumentLink url={signedPhotoUrls.doc_sponsor_relationship} label="Relación Sponsor" />
              <DocumentLink url={signedPhotoUrls.doc_sponsor_payslips} label="Payslips Sponsor" />
              <DocumentLink url={signedPhotoUrls.doc_sponsor_employment} label="Carta laboral Sponsor" />
              <DocumentLink url={signedPhotoUrls.doc_sponsor_bank} label="Banco Sponsor" />
              <DocumentLink url={signedPhotoUrls.doc_sponsor_accommodation} label="Hospedaje Sponsor" />
              <DocumentLink url={signedPhotoUrls.doc_itinerary} label="Itinerario" />
            </SectionCard>

            <SectionCard title="Documentos - Grupo 3: Viajes y otros">
              <DocumentLink url={signedPhotoUrls.doc_passport_current} label="Pasaporte Actual" />
              <DocumentLink url={signedPhotoUrls.doc_passport_stamps} label="Sellos Pasaporte" />
              <DocumentLink url={signedPhotoUrls.doc_previous_visas} label="Visas Anteriores" />
              <DocumentLink url={signedPhotoUrls.doc_national_id_url} label="Documento Nacional (ID)" />
            </SectionCard>
          </>
`
content = content.replace(/<SectionCard title="Documentos Subidos">[\s\S]*?<\/SectionCard>\s*<\/>/, replacement)
fs.writeFileSync(file, content)
console.log('Admin UI updated.')
