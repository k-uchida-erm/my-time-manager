// 通知機能のユーティリティ

export interface NotificationOptions {
  title: string;
  message: string;
  sound?: boolean;
}

// 通知権限をリクエスト
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('このブラウザは通知をサポートしていません');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('通知が拒否されています');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// 通知を送信
export async function sendNotification(options: NotificationOptions): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    console.warn('通知権限がありません');
    return;
  }
  
  try {
    // ブラウザ通知を送信
    const notification = new Notification(options.title, {
      body: options.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'timer-notification',
      requireInteraction: false, // 自動で消えるように変更
      silent: false, // ブラウザデフォルトの通知音を使用
    });

    // 通知のクリックイベント
    notification.onclick = () => {
      window.focus(); // アプリにフォーカス
      notification.close();
    };

    // 通知のエラーイベント
    notification.onerror = (error) => {
      console.error('Notification error:', error);
    };

    // 通知を自動的に閉じる（10秒後に延長）
    setTimeout(() => {
      notification.close();
    }, 10000);
    
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

// タイマー完了時の通知
export async function sendTimerCompletionNotification(
  timerTitle: string,
  message: string = 'タイマーが完了しました',
  sound: boolean = true
): Promise<void> {
  await sendNotification({
    title: `${timerTitle} - 完了`,
    message,
    sound,
  });
}

// テスト用通知（デバッグ用）
export async function sendTestNotification(): Promise<void> {
  await sendNotification({
    title: 'テスト通知',
    message: '通知機能が正常に動作しています',
    sound: true,
  });
} 