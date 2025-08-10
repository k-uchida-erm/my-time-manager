import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TimeEntry } from "@/lib/types";

export interface DailyData {
  timeEntries: TimeEntry[];
  today: Date;
}

export async function getDailyData(): Promise<DailyData> {
  const supabase = createSupabaseServerClient();
  
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

  // 今日の時間記録を取得
  const { data: time_entries, error } = await supabase
    .from('time_entries')
    .select('*')
    .gte('start_time', todayStart)
    .lte('start_time', todayEnd)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Failed to fetch daily data:', error);
    throw new Error('データの取得に失敗しました');
  }

  return {
    timeEntries: (time_entries as TimeEntry[]) || [],
    today
  };
} 