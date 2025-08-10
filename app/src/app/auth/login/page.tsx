'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // ログイン済みなら日次レポートへリダイレクト
        router.push('/daily') 
      }
    }
    getSession()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Time Manager</h1>
            <p className="text-muted-foreground mt-2">時間を効率的に管理しましょう</p>
          </div>
        </div>

        {/* ログインフォーム */}
        <div className="bg-card border rounded-xl p-8 shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'var(--primary)',
                    brandAccent: 'var(--accent)',
                    brandButtonText: 'var(--primary-foreground)',
                    defaultButtonBackground: 'var(--secondary)',
                    defaultButtonBackgroundHover: 'var(--secondary/80)',
                    defaultButtonBorder: 'var(--border)',
                    defaultButtonText: 'var(--secondary-foreground)',
                    dividerBackground: 'var(--border)',
                    inputBackground: 'var(--input)',
                    inputBorder: 'var(--border)',
                    inputBorderHover: 'var(--ring)',
                    inputBorderFocus: 'var(--ring)',
                    inputLabelText: 'var(--foreground)',
                    inputPlaceholder: 'var(--muted-foreground)',
                    messageText: 'var(--foreground)',
                    messageTextDanger: '#ef4444',
                    anchorTextColor: 'var(--primary)',
                    anchorTextHoverColor: 'var(--primary/80)',
                  },
                  space: {
                    inputPadding: '12px',
                    buttonPadding: '12px 24px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '14px',
                    baseButtonSize: '14px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
            }}
            theme="light"
            providers={['google']}
            redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
          />
        </div>

        {/* フッター */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            ログインすることで、<a href="#" className="text-primary hover:underline">利用規約</a>と
            <a href="#" className="text-primary hover:underline">プライバシーポリシー</a>に同意したことになります
          </p>
        </div>
      </div>
    </div>
  )
}
