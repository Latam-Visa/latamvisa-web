import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#333' },
  header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#C8FF00', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#050505' },
  subtitle: { fontSize: 12, color: '#707070', marginTop: 4 },
  section: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', backgroundColor: '#F0F0F0', padding: 5, marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { width: '40%', fontWeight: 'bold', color: '#555' },
  value: { width: '60%' },
  photoNote: { fontSize: 10, color: '#888', fontStyle: 'italic', marginTop: 4 },
})

interface UsaApplicationPDFProps {
  data: any
  photoUrls?: Record<string, string>
}

export function UsaApplicationPDF({ data }: UsaApplicationPDFProps) {
  const { step1Contact, step2Personal, step3Passport, step4Travel, step5VisaHistory, step6Family, step7Work, step8Additional } = data

  const renderRow = (label: string, value: string | boolean | undefined) => {
    if (value === undefined || value === '') return null
    return (
      <View style={styles.row}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>{typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}</Text>
      </View>
    )
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Solicitud de Visa USA</Text>
          <Text style={styles.subtitle}>Aplicante: {step1Contact?.fullName} | Email: {step1Contact?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Información de Contacto</Text>
          {renderRow('Nombre completo', step1Contact?.fullName)}
          {renderRow('Email', step1Contact?.email)}
          {renderRow('WhatsApp', step1Contact?.whatsapp)}
          {renderRow('País residencia', step1Contact?.currentCountry)}
          {renderRow('Ciudad', step1Contact?.currentCity)}
          {renderRow('Dirección', step1Contact?.currentAddress)}
          {renderRow('Visa actual', step1Contact?.currentVisaType)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Información Personal</Text>
          {renderRow('Género', step2Personal?.gender)}
          {renderRow('Estado civil', step2Personal?.maritalStatus)}
          {renderRow('Fecha de nacimiento', step2Personal?.dateOfBirth)}
          {renderRow('Ciudad de nacimiento', step2Personal?.cityOfBirth)}
          {renderRow('Nacionalidad', step2Personal?.nationality)}
          {renderRow('Identificación', step2Personal?.identificationNumber)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Pasaporte</Text>
          {renderRow('Número', step3Passport?.passportNumber)}
          {renderRow('Emisión', step3Passport?.passportIssueDate)}
          {renderRow('Expiración', step3Passport?.passportExpiryDate)}
          {renderRow('País de emisión', step3Passport?.passportIssueCountry)}
          {renderRow('¿Perdido/Robado?', step3Passport?.passportLostStolen)}
          <Text style={styles.photoNote}>📸 Foto del pasaporte: solicitada por WhatsApp</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Viaje</Text>
          {renderRow('Tipo de visa', step4Travel?.usaVisaType)}
          {renderRow('Llegada estimada', step4Travel?.arrivalDate)}
          {renderRow('Salida estimada', step4Travel?.departureDate)}
          {renderRow('¿Quién paga?', step4Travel?.tripPaidBy)}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Historial de Visas</Text>
          {renderRow('¿Negada antes?', step5VisaHistory?.visaDeniedBefore)}
          {renderRow('¿Visa previa?', step5VisaHistory?.hadPreviousUsaVisa)}
          {(step5VisaHistory?.hadPreviousUsaVisa === 'true' || step5VisaHistory?.hadPreviousUsaVisa === true) && (
            <>
              {renderRow('Detalles visa previa', step5VisaHistory?.previousVisaDetails)}
              {renderRow('Número visa previa', step5VisaHistory?.previousVisaNumber)}
              {renderRow('Emisión visa previa', step5VisaHistory?.previousVisaIssueDate)}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Familia</Text>
          {renderRow('Padre', step6Family?.fatherFullName)}
          {renderRow('Nacimiento Padre', step6Family?.fatherDateOfBirth)}
          {renderRow('Madre', step6Family?.motherFullName)}
          {renderRow('¿Familia en USA?', step6Family?.familyInUsa)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Trabajo y Educación</Text>
          {renderRow('Ocupación', step7Work?.occupation)}
          {renderRow('Empresa actual', step7Work?.currentEmployer)}
          {renderRow('Salario USD', step7Work?.monthlySalaryUsd ? `USD ${step7Work.monthlySalaryUsd}` : '')}
          {renderRow('Educación más alta', step7Work?.highestEducation)}
          {renderRow('Idiomas', step7Work?.languages)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Información Adicional</Text>
          {renderRow('Servicio militar', step8Additional?.militaryService)}
          {renderRow('Antecedentes penales', step8Additional?.criminalRecord)}
          {renderRow('Condiciones médicas', step8Additional?.medicalConditions)}
          {renderRow('Deportación', step8Additional?.deportationHistory)}
          <Text style={styles.photoNote}>📸 Foto tipo visa: solicitada por WhatsApp</Text>
        </View>
      </Page>
    </Document>
  )
}
