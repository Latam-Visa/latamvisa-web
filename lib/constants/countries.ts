export interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

export const LATAM_COUNTRIES: Country[] = [
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', phoneCode: '+57' },
  { code: 'MX', name: 'México', flag: '🇲🇽', phoneCode: '+52' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', phoneCode: '+54' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', phoneCode: '+56' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', phoneCode: '+51' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', phoneCode: '+58' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', phoneCode: '+593' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', phoneCode: '+591' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', phoneCode: '+595' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', phoneCode: '+598' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', phoneCode: '+506' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦', phoneCode: '+507' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', phoneCode: '+502' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', phoneCode: '+504' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', phoneCode: '+503' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', phoneCode: '+505' },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴', phoneCode: '+1-809' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', phoneCode: '+53' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', phoneCode: '+1-787' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', phoneCode: '+55' },
];

export const ALL_COUNTRIES: Country[] = [
  ...LATAM_COUNTRIES,
  { code: 'US', name: 'USA', flag: '🇺🇸', phoneCode: '+1' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', phoneCode: '+1' },
  { code: 'ES', name: 'España', flag: '🇪🇸', phoneCode: '+34' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phoneCode: '+61' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', phoneCode: '+39' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', phoneCode: '+33' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪', phoneCode: '+49' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', phoneCode: '+351' },
  { code: 'JP', name: 'Japón', flag: '🇯🇵', phoneCode: '+81' },
  { code: 'NZ', name: 'Nueva Zelanda', flag: '🇳🇿', phoneCode: '+64' },
];
