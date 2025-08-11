'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseActionClient } from './client'

export async function addTimeEntry(formData: FormData) {
  const note = String(formData.get('note'))
  const startTime = Number(formData.get('startTime'))
  const endTime = Number(formData.get('endTime'))
  const durationSeconds = Math.round((endTime - startTime) / 1000)
  const timerTitle = String(formData.get('timerTitle') || '')
  const timerColor = String(formData.get('timerColor') || '#3B82F6')

  const supabase = createSupabaseActionClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: '認証されていません。' }
  }

  const entry = {
    user_id: user.id,
    start_time: new Date(startTime).toISOString(),
    end_time: new Date(endTime).toISOString(),
    duration_seconds: durationSeconds,
    note: note,
    timer_title: timerTitle,
    timer_color: timerColor,
  }

  const { error } = await supabase.from('time_entries').insert(entry)

  if (error) {
    console.error('Error inserting time entry:', error)
    return { error: 'データの保存に失敗しました。' }
  }

  revalidatePath('/daily')
  revalidatePath('/monthly')
  return { success: true }
}

export async function updateTimeEntry(formData: FormData) {
  const id = Number(formData.get('id'))
  const note = String(formData.get('note'))
  const startTime = Number(formData.get('startTime'))
  const endTime = Number(formData.get('endTime'))
  const durationSeconds = Math.round((endTime - startTime) / 1000)

  const supabase = createSupabaseActionClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: '認証されていません。' }
  }

  const { error } = await supabase
    .from('time_entries')
    .update({
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      duration_seconds: durationSeconds,
      note: note,
      is_edited: true,
      edited_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating time entry:', error)
    return { error: 'データの更新に失敗しました。' }
  }

  revalidatePath('/daily')
  revalidatePath('/monthly')
  return { success: true }
}

export async function deleteTimeEntry(formData: FormData) {
  const id = Number(formData.get('id'))

  const supabase = createSupabaseActionClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: '認証されていません。' }
  }

  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting time entry:', error)
    return { error: 'データの削除に失敗しました。' }
  }

  revalidatePath('/daily')
  revalidatePath('/monthly')
  return { success: true }
} 