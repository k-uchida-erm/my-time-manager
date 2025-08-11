'use server'

import { createSupabaseActionClient } from './client'

export async function saveTimerEvent(formData: FormData) {
  const timerId = String(formData.get('timerId'))
  const eventType = String(formData.get('eventType'))
  const eventTime = Number(formData.get('eventTime'))
  const elapsedSeconds = Number(formData.get('elapsedSeconds') || 0)
  const note = String(formData.get('note') || '')

  if (!timerId || timerId === 'undefined') {
    console.error('Invalid timer ID:', timerId)
    return { error: 'タイマーIDが無効です。' }
  }

  if (!['start', 'pause', 'resume', 'complete', 'reset', 'pomodoro_complete', 'break_complete'].includes(eventType)) {
    console.error('Invalid event type:', eventType)
    return { error: 'イベントタイプが無効です。' }
  }

  if (!eventTime || isNaN(eventTime)) {
    console.error('Invalid event time:', eventTime)
    return { error: 'イベント時刻が無効です。' }
  }

  const supabase = createSupabaseActionClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: '認証されていません。' }
  }

  const { data: timerExists, error: timerCheckError } = await supabase
    .from('custom_timers')
    .select('id')
    .eq('id', timerId)
    .eq('user_id', user.id)
    .single()

  if (timerCheckError || !timerExists) {
    console.error('Timer not found or access denied:', { timerId, error: timerCheckError })
    return { error: 'タイマーが見つかりません。' }
  }

  const event = {
    user_id: user.id,
    timer_id: timerId,
    event_type: eventType,
    event_time: new Date(eventTime).toISOString(),
    elapsed_seconds: elapsedSeconds,
    note: note || null,
  }

  const { error } = await supabase.from('timer_events').insert(event)

  if (error) {
    console.error('Error inserting timer event:', error)
    console.error('Event data:', event)
    console.error('Supabase error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return { error: 'イベントの保存に失敗しました。' }
  }

  return { success: true }
}

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