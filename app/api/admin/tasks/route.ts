import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const VALID_STATUSES = ['idea', 'por_hacer', 'en_progreso', 'hecho']
const VALID_PRIORITIES = ['alta', 'media', 'baja']

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_tasks')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      console.error('[ADMIN_TASKS_GET_ERROR]', error)
      return NextResponse.json({ error: 'Error al cargar las tareas' }, { status: 500 })
    }

    return NextResponse.json({ success: true, tasks: data })
  } catch (err: any) {
    console.error('[ADMIN_TASKS_GET_ERROR]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const title = (body.title || '').trim()

    if (!title) {
      return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
    }

    const status = VALID_STATUSES.includes(body.status) ? body.status : 'idea'
    const priority = VALID_PRIORITIES.includes(body.priority) ? body.priority : 'media'
    const category = (body.category || '').trim() || 'General'
    const description = (body.description || '').trim() || null

    const { data: lastInColumn } = await supabaseAdmin
      .from('admin_tasks')
      .select('position')
      .eq('status', status)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()

    const position = lastInColumn ? lastInColumn.position + 1 : 0

    const { data, error } = await supabaseAdmin
      .from('admin_tasks')
      .insert({ title, description, category, status, priority, position })
      .select()
      .single()

    if (error) {
      console.error('[ADMIN_TASKS_POST_ERROR]', error)
      return NextResponse.json({ error: 'Error al crear la tarea' }, { status: 500 })
    }

    return NextResponse.json({ success: true, task: data })
  } catch (err: any) {
    console.error('[ADMIN_TASKS_POST_ERROR]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
