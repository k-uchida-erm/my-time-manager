import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createSupabaseActionClient() {
  return createServerActionClient({ cookies });
} 