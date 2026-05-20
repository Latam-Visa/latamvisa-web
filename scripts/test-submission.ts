import { submitUsaApplication } from '../app/aplicar/turismo-usa/_actions/submit-application'

// Helper to create a 1x1 solid red base64 JPEG (~400 bytes)
const dummyBase64Jpeg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='

const dummyFormData = {
  step1Contact: {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    country: 'Test Country'
  },
  step2Personal: {
    gender: 'M',
    dateOfBirth: '1990-01-01',
    cityOfBirth: 'Test City',
    countryOfBirth: 'Test Country',
    maritalStatus: 'Soltero/a',
    otherNationalities: 'false'
  },
  step3Passport: {
    passportNumber: 'A12345678',
    passportIssueCountry: 'Test Country',
    passportIssueCity: 'Test City',
    passportIssueDate: '2020-01-01',
    passportExpiryDate: '2030-01-01',
    lostPassport: 'false',
    passportPhotoFile: dummyBase64Jpeg
  },
  step4Travel: {
    tripPurpose: 'Turismo',
    usaVisaType: 'B1/B2 Turismo y Negocios',
    arrivalDate: '2027-01-01',
    departureDate: '2027-01-15',
    citiesToVisit: ['Test City'],
    accommodation: [{ type: 'Hotel', name: 'Test Hotel', address: 'Test Address' }],
    tripPaidBy: 'Yo mismo',
    travelCompanions: []
  },
  step5VisaHistory: {
    hadPreviousUsaVisa: 'false',
    visaDeniedBefore: 'false',
    fingerprintedBefore: 'false'
  },
  step6Family: {
    fatherFullName: 'Father Test',
    fatherNationality: 'Test Country',
    fatherDateOfBirth: '1960-01-01',
    motherFullName: 'Mother Test',
    motherNationality: 'Test Country',
    motherDateOfBirth: '1960-01-01',
    hasFamilyInUsa: 'false',
    familyInUsaDetails: []
  },
  step7Work: {
    primaryOccupation: 'Engineer',
    currentEmployer: 'Test Corp',
    currentEmployerAddress: 'Test Address',
    currentEmployerPhone: '1234567890',
    monthlySalaryUsd: '5000',
    currentJobResponsibilities: 'Testing the system thoroughly.',
    hadPreviousJob: 'false',
    educationLevel: 'University',
    institutionName: 'Test University',
    institutionAddress: 'Test Address',
    courseOfStudy: 'Computer Science',
    educationStartDate: '2010-01-01',
    educationEndDate: '2014-01-01'
  },
  step8Additional: {
    languages: ['Spanish', 'English'],
    traveledCountries5Years: 'None',
    belongsToClanOrTribe: 'false',
    specialSkills: 'false',
    militaryService: 'false',
    visaPhotoFile: dummyBase64Jpeg
  }
}

async function runTest() {
  console.log('--- Starting Test Submission ---')
  const photos = {
    passport: dummyBase64Jpeg,
    visaPhoto: dummyBase64Jpeg
  }
  
  const formData = new FormData()
  formData.append('data', JSON.stringify(dummyFormData))
  const result = await submitUsaApplication(formData)
  console.log('--- Test Submission Result ---')
  console.log(result)
}

runTest().catch(console.error)
