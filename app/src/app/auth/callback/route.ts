import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 認証成功後は日次レポートにリダイレクト（現在のオリジンを使用）
  const redirectUrl = new URL('/daily', request.url)
  return NextResponse.redirect(redirectUrl)
}
