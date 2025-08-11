'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseActionClient } from './client'

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

  const { data, error } = await supabase
    .from('custom_timers')
    .insert(timer)
    .select()
    .single()

  if (error || !data) {
    console.error('Error inserting custom timer:', error)
    return { error: 'タイマーの保存に失敗しました。' }
  }

  revalidatePath('/')

  return {
    success: true,
    timer: {
      id: data.id,
      title: data.title,
      type: data.type,
      duration: data.duration,
      workDuration: data.work_duration,
      breakDuration: data.break_duration,
      color: data.color,
      hasMemo: data.has_memo,
      enableNotifications: data.enable_notifications
    }
  }
}

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

  const { data, error } = await supabase
    .from('custom_timers')
    .update(timer)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !data) {
    console.error('Error updating custom timer:', error)
    return { error: 'タイマーの更新に失敗しました。' }
  }

  revalidatePath('/')

  return {
    success: true,
    timer: {
      id: data.id,
      title: data.title,
      type: data.type,
      duration: data.duration,
      workDuration: data.work_duration,
      breakDuration: data.break_duration,
      color: data.color,
      hasMemo: data.has_memo,
      enableNotifications: data.enable_notifications
    }
  }
}

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