import Link from 'next/link';
import { Button } from '@/components/atoms/ui/Button';

export default function HomePage() {
  return (
    <div className="w-full">
      <section className="text-center space-y-8">
        {/* ロゴ/アイコン */}
        <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>

        {/* タイトル/サブタイトル */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">My Time Manager</h1>
          <p className="text-base md:text-lg text-muted-foreground">毎日の作業時間を賢く、シンプルに。ポモドーロ・カウントダウン・ストップウォッチに対応した時間管理ツール。</p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/daily">
            <Button size="lg" className="w-full sm:w-auto">時間管理を始める</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">ログイン</Button>
          </Link>
        </div>
      </section>

      {/* 3カラムの簡易特徴 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="border rounded-xl p-6 bg-white/70 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-2">直感的なタイマー</h3>
          <p className="text-sm text-muted-foreground">ワンクリックで開始・停止。進行中の状態は自動で復元されます。</p>
        </div>
        <div className="border rounded-xl p-6 bg-white/70 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-2">色とメモで整理</h3>
          <p className="text-sm text-muted-foreground">タイマーごとに色とメモを設定。タイムラインも色分け表示。</p>
        </div>
        <div className="border rounded-xl p-6 bg-white/70 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-2">日次・月次レポート</h3>
          <p className="text-sm text-muted-foreground">記録は自動保存。日次・月次で振り返りができます。</p>
        </div>
      </section>
    </div>
  );
} 