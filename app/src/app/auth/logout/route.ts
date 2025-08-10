import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // ログアウト処理
  await supabase.auth.signOut()
  
  // ログイン画面にリダイレクト（現在のオリジンを使用）
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
