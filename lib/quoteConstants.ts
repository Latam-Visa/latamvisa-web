export const QUOTE = {
  VISA_500_FEE_AUD: 2000,
  VISA_CARD_SURCHARGE_PCT: 1.4,
  LIVING_COST_AUD_YEAR: 29710,
  OSHC_AUD_YEAR_SINGLE: 600,
  MEDICAL_REQUIRED_MONTHS: 5,
  CO_MEDICAL_EXAM_COP: 350000,
  CO_BIOMETRICS_COP: 96338,
  MEDICAL_AUD_ONSHORE: 249,
};

export const DURATION_YEARS: Record<string, number> = {
  "6 meses": 0.5,
  "1 ano": 1, "1 año": 1,
  "1 ano 6 meses": 1.5, "1 año 6 meses": 1.5,
  "2 anos": 2, "2 años": 2,
  "2 anos 6 meses": 2.5, "2 años 6 meses": 2.5,
};

export function lexisElicosMaterialFee(weeks: number, isCambridge = false): number {
  if (isCambridge) return 325;
  if (weeks <= 8)  return 195;
  if (weeks <= 17) return 285;
  if (weeks <= 24) return 335;
  return 385;
}
