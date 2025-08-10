import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TimeEntry } from "@/lib/types";
import { mockTimeEntries, getMockChartData, getMockCalendarEntries, getMockDailyEntries } from "@/lib/mockData";
import { MonthlyReportClient } from "./MonthlyReportClient";

export const dynamic = 'force-dynamic'

export default async function MonthlyReportPage() {
  const supabase = createSupabaseServerClient();
  
  // 今月の日付範囲を計算
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStart = new Date(year, month, 1).toISOString();
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

  // モックデータを使用するかどうかのフラグ（開発用）
  const useMockData = process.env.NODE_ENV === 'development' && false; // 必要に応じてtrueに変更

  let entries: TimeEntry[] = [];
  let customTimers: Array<{ id: string; title: string; color: string }> = [];

  if (useMockData) {
    // モックデータを使用
    entries = mockTimeEntries;
    customTimers = [
      { id: '1', title: '勉強', color: '#3B82F6' },
      { id: '2', title: '運動', color: '#10B981' },
      { id: '3', title: '読書', color: '#F59E0B' }
    ];
  } else {
    // 実際のデータベースから取得
    const { data: dbEntries } = await supabase
      .from('time_entries')
      .select('*')
      .gte('start_time', monthStart)
      .lte('start_time', monthEnd)
      .order('start_time', { ascending: true });

    entries = dbEntries || [];

    // カスタムタイマーの一覧を取得
    const { data: dbCustomTimers } = await supabase
      .from('custom_timers')
      .select('id, title, color')
      .order('created_at', { ascending: true });

    customTimers = dbCustomTimers || [];
  }

  // 今月の日数を取得
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <MonthlyReportClient 
          entries={entries}
          customTimers={customTimers}
          daysInMonth={daysInMonth}
          currentMonth={month + 1}
          currentYear={year}
        />
      </div>
    </div>
  );
} 