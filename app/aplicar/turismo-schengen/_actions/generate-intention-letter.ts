"use server"

import { supabaseAdmin } from '@/lib/supabase/admin'

// Dummy logic for background generation (mirrors Canada/UK)
export async function generateIntentionLetterBg(applicationId: string) {
  try {
    // In a real implementation this would call an AI API like OpenAI or Claude.
    // For now we just update the status to completed and put a dummy text.
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const { error } = await supabaseAdmin
      .from('visa_applications_schengen')
      .update({
        ai_letter_status: 'completed',
        ai_intention_letter: 'Estimado Cónsul,\n\nPor la presente expongo los motivos de mi viaje a la zona Schengen...',
        ai_letter_generated_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (error) {
      console.error('[AI_LETTER] Error updating DB:', error)
      return { success: false, error: 'Database error' }
    }

    return { success: true, letter: 'Estimado Cónsul...' }
  } catch (error) {
    console.error('[AI_LETTER] Error generating:', error)
    return { success: false, error: 'Failed to generate' }
  }
}
