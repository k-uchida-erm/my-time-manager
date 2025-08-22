'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session) {
        router.push('/');
      }
    }
    getSession();
  }, [router, supabase]);

  // セッションチェック中は何も表示しないか、ローディング表示を出す
  if (user) {
    return <div>リダイレクト中...</div>;
  }

  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: 'auto', paddingTop: '100px' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        providers={['google']}
        redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
      />
    </div>
  );
} 