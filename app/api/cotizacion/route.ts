import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { QUOTE, DURATION_YEARS } from '@/lib/quoteConstants';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, courseIds, studentType = 'offshore' } = body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ error: 'courseIds is required and must be a non-empty array.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const options = [];

    for (const courseId of courseIds) {
      // 1. Fetch course details
      let { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
        return NextResponse.json({ error: `Course not found for ID: ${courseId}` }, { status: 400 });
      }

      // Check for studentType variant
      if (course.student_type && course.student_type !== studentType && course.student_type !== 'both') {
        const { data: variant } = await supabase
          .from('courses')
          .select('*')
          .eq('course_code', course.course_code)
          .eq('school_code', course.school_code)
          .eq('student_type', studentType)
          .single();
        if (variant) course = variant;
      }

      // 2. Fetch school details
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('code', course.school_code)
        .single();

      if (schoolError || !school) {
        return NextResponse.json({ error: `School not found for code: ${course.school_code}` }, { status: 400 });
      }

      // 3. Compute durationYears
      let durationYears = 0;
      if (course.duration_terms) {
        durationYears = course.duration_terms / 4;
      } else if (course.duration_label && DURATION_YEARS[course.duration_label]) {
        durationYears = DURATION_YEARS[course.duration_label];
      } else if (course.is_per_week) {
        const weeks = profile?.weeks ?? 20;
        durationYears = weeks / 52;
      } else if (course.duration_weeks) {
        durationYears = course.duration_weeks / 52;
      } else {
        return NextResponse.json({ error: `Cannot determine duration for course: ${courseId}` }, { status: 400 });
      }

      // 4. Compute block A (Paid)
      const weeks = profile?.weeks ?? 20;
      const tuitionTotal = course.is_per_week ? (course.tuition_fee ?? 0) * weeks : (course.tuition_fee ?? 0);
      
      const enrolment = school.enrolment_fee ?? 0;
      const material = course.material_included 
        ? 0 
        : (course.is_per_week ? (course.material_fee ?? 0) * weeks : (course.material_fee ?? 0));
      
      const oshcTotal = Math.round(QUOTE.OSHC_AUD_YEAR_SINGLE * durationYears);
      const visaBase = QUOTE.VISA_500_FEE_AUD;
      
      const needsMedical = (durationYears * 12) > QUOTE.MEDICAL_REQUIRED_MONTHS;
      
      let visaSurcharge = 0;
      let medicalOnshoreAUD = 0;
      let biometricsCOP = 0;
      let medicalCOP = 0;

      if (studentType === 'offshore') {
        visaSurcharge = Math.round(QUOTE.VISA_500_FEE_AUD * QUOTE.VISA_CARD_SURCHARGE_PCT / 100);
        biometricsCOP = QUOTE.CO_BIOMETRICS_COP;
        medicalCOP = needsMedical ? QUOTE.CO_MEDICAL_EXAM_COP : 0;
      } else {
        visaSurcharge = 0;
        medicalOnshoreAUD = needsMedical ? QUOTE.MEDICAL_AUD_ONSHORE : 0;
      }

      const visaTotal = visaBase + visaSurcharge;
      
      const blockASubtotalAUD = tuitionTotal + material + enrolment + oshcTotal + visaTotal + medicalOnshoreAUD;

      // 5. Compute local costs (COP)
      const localCostsCOP = {
        biometrics: biometricsCOP,
        medical: medicalCOP
      };

      // 6. Compute block B (Proof of Funds)
      const livingShow = Math.round(QUOTE.LIVING_COST_AUD_YEAR * Math.min(1, durationYears));
      const tuitionShow = durationYears >= 1 ? Math.round(tuitionTotal / durationYears) : tuitionTotal;
      const airfare = null; // null to be filled later
      
      const blockBSubtotalAUD = livingShow + tuitionShow + (airfare ?? 0);

      options.push({
        course: {
          id: course.id,
          name: course.name,
          school: school.name,
          qualLevel: course.qual_level,
          durationYears: durationYears,
          durationLabel: course.duration_label
        },
        blockA: {
          tuition: tuitionTotal,
          material: material,
          enrolment: enrolment,
          oshcTotal: oshcTotal,
          visaBase: visaBase,
          visaSurcharge: visaSurcharge,
          visaTotal: visaTotal,
          ...(studentType === 'onshore' && medicalOnshoreAUD > 0 ? { medicalOnshoreAUD } : {}),
          subtotalAUD: blockASubtotalAUD
        },
        localCostsCOP: localCostsCOP,
        blockB: {
          livingShow: livingShow,
          tuitionShow: tuitionShow,
          airfare: airfare,
          subtotalAUD: blockBSubtotalAUD
        }
      });
    }

    return NextResponse.json({ options });

  } catch (error: any) {
    console.error("Error in /api/cotizacion:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
