-- custom_timersテーブルを作成
CREATE TABLE IF NOT EXISTS custom_timers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('countdown', 'stopwatch', 'pomodoro')),
  duration INTEGER, -- カウントダウン用（分）
  work_duration INTEGER, -- ポモドーロ用（分）
  break_duration INTEGER, -- ポモドーロ用（分）
  color TEXT NOT NULL,
  has_memo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_custom_timers_user_id ON custom_timers(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_timers_created_at ON custom_timers(created_at);

-- RLS（Row Level Security）を有効化
ALTER TABLE custom_timers ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view own custom timers" ON custom_timers;
DROP POLICY IF EXISTS "Users can insert own custom timers" ON custom_timers;
DROP POLICY IF EXISTS "Users can update own custom timers" ON custom_timers;
DROP POLICY IF EXISTS "Users can delete own custom timers" ON custom_timers;

-- ユーザーは自分のタイマーのみアクセス可能
CREATE POLICY "Users can view own custom timers" ON custom_timers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom timers" ON custom_timers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom timers" ON custom_timers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom timers" ON custom_timers
  FOR DELETE USING (auth.uid() = user_id);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 既存のトリガーを削除（存在する場合）
DROP TRIGGER IF EXISTS update_custom_timers_updated_at ON custom_timers;

CREATE TRIGGER update_custom_timers_updated_at
  BEFORE UPDATE ON custom_timers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- タグ関連のテーブルとカラムを削除
-- time_entriesテーブルからtag_idカラムを削除
ALTER TABLE time_entries DROP COLUMN IF EXISTS tag_id;

-- tagsテーブルを削除（存在する場合）
DROP TABLE IF EXISTS tags CASCADE;

-- タイマー情報のカラムを追加
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS timer_title TEXT;
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS timer_color TEXT;

-- 通知設定用のカラムを追加
ALTER TABLE custom_timers ADD COLUMN IF NOT EXISTS enable_notifications BOOLEAN DEFAULT false;

-- 不要な通知設定カラムを削除
ALTER TABLE custom_timers DROP COLUMN IF EXISTS notification_sound;
ALTER TABLE custom_timers DROP COLUMN IF EXISTS notification_message;

-- タイマーイベントテーブルを作成
CREATE TABLE IF NOT EXISTS timer_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timer_id UUID NOT NULL REFERENCES custom_timers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('start', 'pause', 'resume', 'complete', 'reset')),
  event_time TIMESTAMP WITH TIME ZONE NOT NULL,
  elapsed_seconds INTEGER DEFAULT 0, -- イベント時点での経過秒数
  note TEXT, -- 完了時のメモ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_timer_events_user_id ON timer_events(user_id);
CREATE INDEX IF NOT EXISTS idx_timer_events_timer_id ON timer_events(timer_id);
CREATE INDEX IF NOT EXISTS idx_timer_events_event_time ON timer_events(event_time);

-- RLS（Row Level Security）を有効化
ALTER TABLE timer_events ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のタイマーイベントのみアクセス可能
CREATE POLICY "Users can view own timer events" ON timer_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timer events" ON timer_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timer events" ON timer_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timer events" ON timer_events
  FOR DELETE USING (auth.uid() = user_id); 