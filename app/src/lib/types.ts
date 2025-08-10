// アプリ全体で使うデータの方を定義します
export type TimeEntry = {
  id: number;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  note: string | null;
  // 編集済みマークのためのフィールド
  is_edited?: boolean;
  edited_at?: string;
  // タイマー情報
  timer_title?: string;
  timer_color?: string;
};
