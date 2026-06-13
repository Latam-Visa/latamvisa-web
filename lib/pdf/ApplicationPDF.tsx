import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

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
  photoLabel: { fontSize: 10, fontWeight: 'bold', color: '#555', marginTop: 12, marginBottom: 4 },
  photo: { width: 200, height: 140, marginTop: 4, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 4 },
})

interface ApplicationPDFProps {
  title: string
  subtitle: string
  sections: {
    title: string
    rows: { label: string; value: string | boolean | undefined | null }[]
  }[]
  photos: {
    label: string
    dataUri?: string
    hasPhotoField?: boolean
  }[]
}

export function ApplicationPDF({ title, subtitle, sections, photos }: ApplicationPDFProps) {
  const renderRow = (label: string, value: string | boolean | undefined | null) => {
    if (value === undefined || value === null || value === '') return null
    let displayValue = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)
    return (
      <View style={styles.row}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>{displayValue}</Text>
      </View>
    )
  }

  const renderPhoto = (label: string, dataUri: string | undefined, hasPhotoField?: boolean) => {
    if (dataUri) {
      return (
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.photoLabel}>📸 {label}</Text>
          <Image src={dataUri} style={styles.photo} />
        </View>
      )
    }
    if (hasPhotoField) {
      return <Text style={styles.photoNote}>📸 {label}: Recibida correctamente</Text>
    }
    return null
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {sections.map((sec, idx) => {
          // Solamente renderizamos secciones que tienen datos válidos
          const validRows = sec.rows.filter(r => r.value !== undefined && r.value !== null && r.value !== '')
          if (validRows.length === 0) return null

          return (
            <View key={idx} style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
              {validRows.map((row, rIdx) => (
                <React.Fragment key={rIdx}>
                  {renderRow(row.label, row.value)}
                </React.Fragment>
              ))}
            </View>
          )
        })}

        {photos.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Documentos y Fotos</Text>
            {photos.map((photo, idx) => (
              <React.Fragment key={idx}>
                {renderPhoto(photo.label, photo.dataUri, photo.hasPhotoField)}
              </React.Fragment>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
