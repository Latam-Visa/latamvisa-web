import { submitUsaApplication } from '../app/aplicar/turismo-usa/_actions/submit-application'

const dummyForm = {
  step1Contact: { email: 'test@test.com', fullName: 'Test' },
  step2Personal: {},
  step3Passport: {},
  step4Travel: { usaVisaType: 'B1/B2' },
  step5VisaHistory: {},
  step6Family: {},
  step7Work: {},
  step8Additional: {}
}

const dummyPhotos = {
  visaPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...' // valid minimal base64 needed? No, just a small 1x1 image
}

async function run() {
  console.log('[1] Start:', Date.now())
  const res = await submitUsaApplication(dummyForm, dummyPhotos)
  console.log('[2] End:', Date.now(), res)
}

run().catch(console.error)
