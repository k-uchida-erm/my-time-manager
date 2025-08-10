-- ポモドーロタイマー用のイベントタイプを追加するマイグレーション

-- 既存のチェック制約を削除
ALTER TABLE timer_events DROP CONSTRAINT IF EXISTS timer_events_event_type_check;

-- 新しいイベントタイプを含むチェック制約を追加
ALTER TABLE timer_events ADD CONSTRAINT timer_events_event_type_check 
  CHECK (event_type IN ('start', 'pause', 'resume', 'complete', 'reset', 'pomodoro_complete', 'break_complete'));

-- 制約が正常に追加されたか確認
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'timer_events_event_type_check'; 