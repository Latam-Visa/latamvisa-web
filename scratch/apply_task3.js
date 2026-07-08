const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '../app/aplicar/turismo-australia/_schemas/index.ts')
let content = fs.readFileSync(file, 'utf8')

// Step 3
content = content.replace(/has_national_id: booleanRadio,/, 'has_national_id: booleanRadio.optional(),\n  doc_national_id_url: z.string().optional(),')
content = content.replace(/other_names_list: z.array\(z.object\(\{\n    family_name: z.string\(\), given_names: z.string\(\)\n  \}\)\).optional(),/, 'other_names_details: z.string().optional(),')
content = content.replace(/other_citizenships: z.array\(z.any\(\)\).optional(),/, 'other_citizenships_details: z.string().optional(),')
content = content.replace(/previous_travel_australia: booleanRadio,/, 'previous_travel_australia: booleanRadio,\n  previous_travel_details: z.string().optional(),')

// Step 4
content = content.replace(/department_office: z.string\(\).min\(1, "Requerido"\),/, 'department_office: z.string().optional(),')

// Step 5
content = content.replace(/travelling_companions: z.array\(z.any\(\)\).optional(),/, 'travelling_companions_details: z.string().optional(),')

// Step 6
content = content.replace(/non_accompanying_family: z.array\(z.any\(\)\).optional(),/, 'non_accompanying_family_details: z.string().optional(),')

// Step 10
content = content.replace(/has_tb: booleanRadio,/, 'has_tb: booleanRadio.optional(),')
if (!content.includes('health_details')) {
  content = content.replace(/health_declarations: z.object\(\{/, 'health_details: z.string().optional(),\n  health_declarations: z.object({')
}

// Step 11
if (!content.includes('character_details')) {
  content = content.replace(/character_declarations: z.object\(\{/, 'character_details: z.string().optional(),\n  character_declarations: z.object({')
}

// Step 14
const step14Replace = `export const step14Schema = z.object({
  doc_housing_letter: z.array(z.string()).optional(),
  doc_work_cert: z.array(z.string()).optional(),
  doc_studies: z.array(z.string()).optional(),
  doc_properties: z.array(z.string()).optional(),
  doc_vehicle: z.array(z.string()).optional(),
  doc_civil_registries: z.array(z.string()).optional(),
  doc_bank_statements: z.array(z.string()).optional(),
  doc_pension: z.array(z.string()).optional(),
  doc_sponsor_letter: z.array(z.string()).optional(),
  doc_sponsor_address: z.array(z.string()).optional(),
  doc_sponsor_relationship: z.array(z.string()).optional(),
  doc_sponsor_payslips: z.array(z.string()).optional(),
  doc_sponsor_employment: z.array(z.string()).optional(),
  doc_sponsor_bank: z.array(z.string()).optional(),
  doc_sponsor_accommodation: z.array(z.string()).optional(),
  doc_itinerary: z.array(z.string()).optional(),
  doc_passport_stamps: z.array(z.string()).optional(),
  doc_previous_visas: z.array(z.string()).optional(),
});`

content = content.replace(/export const step14Schema = z.object\(\{[\s\S]*?\}\);/, step14Replace)

fs.writeFileSync(file, content)
console.log('Schema updated.')
