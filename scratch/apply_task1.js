const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '../app/aplicar/turismo-australia')
const apiDir = path.join(__dirname, '../app/api/parse-passport')
const componentsDir = path.join(dir, '_components')
const sharedModalPath = path.join(dir, 'components/PassportConfirmModal.tsx')

// 1. Update PassportConfirmModal for voseo and add 'sex'
let modalContent = fs.readFileSync(sharedModalPath, 'utf8')
modalContent = modalContent.replace(/sex\?: string \| null/g, '')
modalContent = modalContent.replace(/export interface PassportData \{/, 'export interface PassportData {\n  sex?: string | null')
modalContent = modalContent.replace(/document_type: 'Tipo de documento'/, "document_type: 'Tipo de documento',\n  sex: 'Sexo (M/F)'")
modalContent = modalContent.replace(/date_of_expiry: data\.date_of_expiry \|\| '',/, "date_of_expiry: data.date_of_expiry || '',\n    sex: data.sex || '',")
modalContent = modalContent.replace(/'issuing_country'/, "'issuing_country', 'sex'")
modalContent = modalContent.replace(/Revisá cada campo\. Podés editar lo que esté mal\./, 'Revisa cada campo. Puedes editar lo que esté mal.')
modalContent = modalContent.replace(/escribí aquí/, 'escribe aquí')
fs.writeFileSync(sharedModalPath, modalContent)

// 2. Update /api/parse-passport to extract sex
let apiContent = fs.readFileSync(path.join(apiDir, 'route.ts'), 'utf8')
apiContent = apiContent.replace(/"date_of_expiry": "string \(DD\/MM\/YYYY\) or null"/, '"date_of_expiry": "string (DD/MM/YYYY) or null",\n  "sex": "string (M or F) or null"')
apiContent = apiContent.replace(/date_of_issue: null,/, 'date_of_issue: null,\n      sex: null,')
apiContent = apiContent.replace(/if \(f\.expirationDate\)/, "if (f.sex) { merged.sex = f.sex.replace('<',''); sources.sex = 'mrz' }\n      if (f.expirationDate)")
apiContent = apiContent.replace(/'nationality', 'date_of_birth', 'date_of_expiry'/, "'nationality', 'date_of_birth', 'date_of_expiry', 'sex'")
fs.writeFileSync(path.join(apiDir, 'route.ts'), apiContent)

// 3. Update page.tsx
let pageContent = fs.readFileSync(path.join(dir, 'page.tsx'), 'utf8')
// Add sex mapping
pageContent = pageContent.replace(/if \(confirmed\.date_of_expiry\) setValue\('step2\.passport_expiry_date' as any, confirmed\.date_of_expiry\)/, `if (confirmed.date_of_expiry) setValue('step2.passport_expiry_date' as any, confirmed.date_of_expiry)
              
              if (confirmed.sex) {
                let mappedSex = 'Other';
                if (confirmed.sex.toUpperCase().startsWith('M')) mappedSex = 'Male';
                if (confirmed.sex.toUpperCase().startsWith('F')) mappedSex = 'Female';
                setValue('step2.sex' as any, mappedSex);
              }`)
fs.writeFileSync(path.join(dir, 'page.tsx'), pageContent)

console.log('Task 1 completed.')
