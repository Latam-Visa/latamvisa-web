import { supabaseAdmin } from '../lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'

const dummyFlat = {
  id: uuidv4(),
  status: 'pending',
  // Step 1
  email: 'test@test.com',
  full_name: 'Test',
  current_visa_type: 'Student',
  current_visa_other: '',
  current_country: 'Colombia',
  current_city: 'Bogota',
  current_address: 'Calle 1',
  current_postcode: '11001',
  whatsapp: '1234567890',
  social_media: '',
  
  // Step 2
  gender: 'Hombre',
  marital_status: 'Single',
  date_of_birth: '2000-01-01',
  city_of_birth: 'Bogota',
  state_of_birth: 'Bogota',
  nationality: 'Colombian',
  identification_number: '123',
  
  // Step 3
  passport_number: 'P123',
  passport_issue_date: '2020-01-01',
  passport_expiry_date: '2030-01-01',
  passport_issue_country: 'Colombia',
  passport_lost_stolen: false,
  passport_lost_details: '',
  // passport_photo_file: '',
  
  // Step 4
  usa_visa_type: 'B1/B2',
  arrival_date: '2027-01-01',
  departure_date: '2027-02-01',
  cities_to_visit: ['Miami'],
  accommodation: [],
  trip_paid_by: 'Self',
  trip_payer_details: '',
  travel_companions: [],
  
  // Step 5
  visa_denied_before: false,
  visa_denied_details: '',
  had_previous_usa_visa: false,
  previous_visa_details: '',
  // previous_visa_photo_file: '',
  
  // Step 6
  father_full_name: 'Father',
  father_nationality: 'Colombian',
  father_date_of_birth: '1970-01-01',
  mother_full_name: 'Mother',
  mother_nationality: 'Colombian',
  mother_date_of_birth: '1975-01-01',
  family_in_usa: false,
  family_in_usa_details: [],
  
  // Step 7
  occupation: 'Engineer',
  current_employer: 'Company',
  monthly_salary_usd: '1000',
  current_job_responsibilities: 'Work',
  previous_employer: '',
  highest_education: 'Bachelor',
  education_details: [],
  languages: ['Spanish'],
  // countries_visited_5_years: [],
  organizations_membership: '',
  
  // Step 8
  military_service: false,
  criminal_record: false,
  medical_conditions: false,
  deportation_history: false,
  // visa_photo_file: '',
}

async function check() {
  const { error } = await supabaseAdmin.from('visa_applications_usa').insert(dummyFlat)
  console.log('Error:', error)
  if (!error) {
    await supabaseAdmin.from('visa_applications_usa').delete().eq('id', dummyFlat.id)
  }
}

check().catch(console.error)
