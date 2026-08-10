import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const VALID_STATUSES = ['idea', 'por_hacer', 'en_progreso', 'hecho']
const VALID_PRIORITIES = ['alta', 'media', 'baja']

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()

    const updateData: Record<string, any> = {}

    if (body.title !== undefined) {
      const title = (body.title || '').trim()
      if (!title) {
        return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
      }
      updateData.title = title
    }
    if (body.description !== undefined) updateData.description = (body.description || '').trim() || null
    if (body.category !== undefined) updateData.category = (body.category || '').trim() || 'General'
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
      }
      updateData.status = body.status
    }
    if (body.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(body.priority)) {
        return NextResponse.json({ error: 'Prioridad inválida' }, { status: 400 })
      }
      updateData.priority = body.priority
    }
    if (body.position !== undefined) updateData.position = body.position

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('admin_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[ADMIN_TASKS_PATCH_ERROR]', error)
      return NextResponse.json({ error: 'Error al actualizar la tarea' }, { status: 500 })
    }

    return NextResponse.json({ success: true, task: data })
  } catch (err: any) {
    console.error('[ADMIN_TASKS_PATCH_ERROR]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { error } = await supabaseAdmin
      .from('admin_tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[ADMIN_TASKS_DELETE_ERROR]', error)
      return NextResponse.json({ error: 'Error al eliminar la tarea' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[ADMIN_TASKS_DELETE_ERROR]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
