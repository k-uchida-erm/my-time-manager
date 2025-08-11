'use server'

import {
  addTimeEntry as addTimeEntryImpl,
  updateTimeEntry as updateTimeEntryImpl,
  deleteTimeEntry as deleteTimeEntryImpl,
} from './actions/timeEntries'

import {
  saveCustomTimer as saveCustomTimerImpl,
  updateCustomTimer as updateCustomTimerImpl,
  deleteCustomTimer as deleteCustomTimerImpl,
  getCustomTimers as getCustomTimersImpl,
} from './actions/customTimers'

import {
  saveTimerEvent as saveTimerEventImpl,
  getTimerEvents as getTimerEventsImpl,
} from './actions/timerEvents'

export async function addTimeEntry(formData: FormData) {
  return addTimeEntryImpl(formData)
}

export async function updateTimeEntry(formData: FormData) {
  return updateTimeEntryImpl(formData)
}

export async function deleteTimeEntry(formData: FormData) {
  return deleteTimeEntryImpl(formData)
}

export async function saveCustomTimer(formData: FormData) {
  return saveCustomTimerImpl(formData)
}

export async function updateCustomTimer(formData: FormData) {
  return updateCustomTimerImpl(formData)
}

export async function deleteCustomTimer(formData: FormData) {
  return deleteCustomTimerImpl(formData)
}

export async function getCustomTimers() {
  return getCustomTimersImpl()
}

export async function saveTimerEvent(formData: FormData) {
  return saveTimerEventImpl(formData)
}

export async function getTimerEvents(timerId: string) {
  return getTimerEventsImpl(timerId)
}
