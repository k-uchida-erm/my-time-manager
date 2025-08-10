import { ErrorBoundary, LoadingState } from "@/components/atoms/feedback";
import { DailyReportClient } from "./DailyReportClient";
import { getDailyData } from "@/lib/services/dailyService";

export default async function DailyReportPage() {
  try {
    const { timeEntries, today } = await getDailyData();

    return (
      <ErrorBoundary>
        <DailyReportClient 
          initialTimeEntries={timeEntries}
          today={today}
        />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Failed to load daily data:', error);
    
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="text-red-500">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">データの読み込みに失敗しました</h2>
            <p className="text-muted-foreground">ページを再読み込みしてください</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
} 