import Link from 'next/link';
import { Button } from '@/components/atoms/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center space-y-8">
        {/* ヘッダー */}
        <div className="space-y-6">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
              My Time Manager
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              時間を効率的に管理し、生産性を最大化するためのシンプルで使いやすいタイムトラッキングツール
            </p>
          </div>
        </div>

        {/* 機能紹介 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">シンプルなタイマー</h3>
            <p className="text-muted-foreground">
              ワンクリックで開始・停止。作業時間を簡単に記録できます。
            </p>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">カテゴリ管理</h3>
            <p className="text-muted-foreground">
              タグを使って作業を分類し、効率的に管理できます。
            </p>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-secondary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">詳細なレポート</h3>
            <p className="text-muted-foreground">
              日次・月次のレポートで時間の使い方を分析できます。
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/daily">
              <Button size="lg" className="w-full sm:w-auto">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                時間管理を始める
              </Button>
            </Link>
            
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                ログイン
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            無料で始められます。今すぐ時間管理を始めましょう！
          </p>
        </div>
      </div>
    </div>
  );
} 