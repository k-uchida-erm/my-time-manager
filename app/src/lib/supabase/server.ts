// サーバーコンポーネントやAPIルートで使うSupabaseクライアントを簡単に作成するためのファイル
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createSupabaseServerClient = () =>
  createServerComponentClient({ cookies });
