'use server'

import { revalidatePath } from 'next/cache'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { TimeEntry } from '@/lib/types'

// Next.js 15対応のSupabaseクライアント作成ヘルパー
function createSupabaseActionClient() {
  return createServerActionClient({ cookies });
}

// 新しい時間記録を追加するサーバーアクション
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



  revalidatePath('/daily') // 日次ページのデータを再読み込み
  revalidatePath('/monthly') // 月毎ビューのデータも再読み込み
  return { success: true }
}

// 時間記録を更新するサーバーアクション
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

// 時間記録を削除するサーバーアクション
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

// カスタムタイマーを保存するサーバーアクション
export async function saveCustomTimer(formData: FormData) {
  const title = String(formData.get('title'))
  const type = String(formData.get('type'))
  const duration = Number(formData.get('duration'))
  const workDuration = Number(formData.get('workDuration'))
  const breakDuration = Number(formData.get('breakDuration'))
  const color = String(formData.get('color'))
  const hasMemo = formData.get('hasMemo') === 'true'
  const enableNotifications = formData.get('enableNotifications') === 'true'

  const supabase = createSupabaseActionClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: '認証されていません。' }
  }

  const timer = {
    user_id: user.id,
    title: title,
    type: type,
    duration: type === 'countdown' ? duration : null,
    work_duration: type === 'pomodoro' ? workDuration : null,
    break_duration: type === 'pomodoro' ? breakDuration : null,
    color: color,
    has_memo: hasMemo,
    enable_notifications: enableNotifications,
  }

  const { error } = await supabase.from('custom_timers').insert(timer)

  if (error) {
    console.error('Error inserting custom timer:', error)
    return { error: 'タイマーの保存に失敗しました。' }
  }

  revalidatePath('/')
  return { success: true }
}

// カスタムタイマーを更新するサーバーアクション
export async function updateCustomTimer(formData: FormData) {
  const id = String(formData.get('id'))
  const title = String(formData.get('title'))
  const type = String(formData.get('type'))
  const duration = Number(formData.get('duration'))
  const workDuration = Number(formData.get('workDuration'))
  const breakDuration = Number(formData.get('breakDuration'))
  const color = String(formData.get('color'))
  const hasMemo = formData.get('hasMemo') === 'true'
  const enableNotifications = formData.get('enableNotifications') === 'true'

  const supabase = createSupabaseActionClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: '認証されていません。' }
  }

  const timer = {
    title: title,
    type: type,
    duration: type === 'countdown' ? duration : null,
    work_duration: type === 'pomodoro' ? workDuration : null,
    break_duration: type === 'pomodoro' ? breakDuration : null,
    color: color,
    has_memo: hasMemo,
    enable_notifications: enableNotifications,
  }

  const { error } = await supabase
    .from('custom_timers')
    .update(timer)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating custom timer:', error)
    return { error: 'タイマーの更新に失敗しました。' }
  }

  revalidatePath('/')
  return { success: true }
}

// カスタムタイマーを削除するサーバーアクション
export async function deleteCustomTimer(formData: FormData) {
  const id = String(formData.get('id'))



  const supabase = createSupabaseActionClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: '認証されていません。' }
  }

  const { error } = await supabase
    .from('custom_timers')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting custom timer:', error)
    return { error: 'タイマーの削除に失敗しました。' }
  }



  revalidatePath('/')
  return { success: true }
}

// カスタムタイマーを取得するサーバーアクション
export async function getCustomTimers() {
  const supabase = createSupabaseActionClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: '認証されていません。' }
  }

  const { data, error } = await supabase
    .from('custom_timers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching custom timers:', error)
    return { error: 'タイマーの取得に失敗しました。' }
  }

  return { data }
}

// タイマーイベントを保存するサーバーアクション
export async function saveTimerEvent(formData: FormData) {
  const timerId = String(formData.get('timerId'))
  const eventType = String(formData.get('eventType'))
  const eventTime = Number(formData.get('eventTime'))
  const elapsedSeconds = Number(formData.get('elapsedSeconds') || 0)
  const note = String(formData.get('note') || '')

  console.log('saveTimerEvent called with:', { timerId, eventType, eventTime, elapsedSeconds, note })

  const supabase = createSupabaseActionClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: '認証されていません。' }
  }

  console.log('User authenticated:', user.id)

  const event = {
    user_id: user.id,
    timer_id: timerId,
    event_type: eventType,
    event_time: new Date(eventTime).toISOString(),
    elapsed_seconds: elapsedSeconds,
    note: note || null,
  }

  console.log('Inserting event:', event)

  const { error } = await supabase.from('timer_events').insert(event)

  if (error) {
    console.error('Error inserting timer event:', error)
    console.error('Event data:', event)
    return { error: 'イベントの保存に失敗しました。' }
  }

  return { success: true }
}

// タイマーイベントを取得するサーバーアクション
export async function getTimerEvents(timerId: string) {
  const supabase = createSupabaseActionClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: '認証されていません。' }
  }

  const { data, error } = await supabase
    .from('timer_events')
    .select('*')
    .eq('timer_id', timerId)
    .eq('user_id', user.id)
    .order('event_time', { ascending: true })

  if (error) {
    console.error('Error fetching timer events:', error)
    return { error: 'イベントの取得に失敗しました。' }
  }

  return { data }
}
