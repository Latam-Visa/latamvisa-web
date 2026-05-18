export interface Step1Contact {
  email: string;
  fullName: string;
  currentVisaType?: string;
  currentVisaOther?: string;
  currentCountry: string;
  currentCity: string;
  currentAddress: string;
  currentPostcode: string;
  whatsapp: string;
  socialMedia?: string;
}

export interface Step2Personal {
  gender: string;
  maritalStatus: string;
  dateOfBirth: string;
  cityOfBirth: string;
  stateOfBirth: string;
  nationality: string;
  identificationNumber?: string;
}

export interface Step3Passport {
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  passportIssueCountry: string;
  passportLostStolen: boolean;
  passportLostDetails?: string;
  passportPhotoFile?: string;
}

export interface Accommodation {
  type: string;
  address: string;
}

export interface TravelCompanion {
  fullName: string;
  relationship: string;
}

export interface Step4Travel {
  usaVisaType: string;
  arrivalDate: string;
  departureDate: string;
  citiesToVisit: string[];
  accommodation: Accommodation[];
  tripPaidBy: string;
  tripPayerDetails?: string;
  travelCompanions: TravelCompanion[];
}

export interface Step5VisaHistory {
  visaDeniedBefore: boolean;
  visaDeniedDetails?: string;
  hadPreviousUsaVisa: boolean;
  previousVisaDetails?: string;
  previousVisaPhotoFile?: string;
}

export interface FamilyMember {
  fullName: string;
  relationship: string;
  statusInUsa: string;
}

export interface Step6Family {
  fatherFullName: string;
  fatherNationality: string;
  fatherDateOfBirth: string;
  motherFullName: string;
  motherNationality: string;
  motherDateOfBirth: string;
  familyInUsa: boolean;
  familyInUsaDetails?: FamilyMember[];
}

export interface EducationDetail {
  institution: string;
  courseOfStudy: string;
  startDate: string;
  endDate: string;
}

export interface Step7Work {
  occupation: string;
  currentEmployer: string;
  monthlySalaryUsd: string;
  currentJobResponsibilities: string;
  previousEmployer?: string;
  highestEducation: string;
  educationDetails: EducationDetail[];
  languages: string[];
  countriesVisited5Years: string[];
  organizationsMembership?: string;
}

export interface Step8Additional {
  militaryService: boolean;
  criminalRecord: boolean;
  medicalConditions: boolean;
  deportationHistory: boolean;
  visaPhotoFile?: string;
}

export interface UsaApplicationFormData {
  step1Contact: Step1Contact;
  step2Personal: Step2Personal;
  step3Passport: Step3Passport;
  step4Travel: Step4Travel;
  step5VisaHistory: Step5VisaHistory;
  step6Family: Step6Family;
  step7Work: Step7Work;
  step8Additional: Step8Additional;
}

export interface UsaApplicationRow {
  id: string;
  user_id?: string;
  status: string;
  data: UsaApplicationFormData;
  created_at: string;
  updated_at: string;
}
