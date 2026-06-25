import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// Revalidate every hour
export const revalidate = 3600;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentType = searchParams.get('studentType');

    const supabase = getServiceSupabase();

    // Query courses (NO price/commission info)
    let coursesQuery = supabase
      .from('courses')
      .select('id, school_code, name, field, qual_level, student_type, duration_label, cricos');

    if (studentType) {
      coursesQuery = coursesQuery.or(`student_type.eq.${studentType},student_type.eq.both`);
    }

    const { data: courses, error: coursesError } = await coursesQuery;
    if (coursesError) throw coursesError;

    // Query packages (NO price/commission info)
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('id, school_code, name, field');
    // If table doesn't exist yet, just return empty array
    if (packagesError && packagesError.code !== '42P01') {
      throw packagesError;
    }

    // Query schools
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('code, name, city');
    if (schoolsError && schoolsError.code !== '42P01') {
      throw schoolsError;
    }

    return NextResponse.json({
      courses: courses || [],
      packages: packages || [],
      schools: schools || []
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
