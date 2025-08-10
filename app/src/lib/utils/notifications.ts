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

  // ブラウザ通知を送信
  const notification = new Notification(options.title, {
    body: options.message,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'timer-notification',
    requireInteraction: true,
  });

  // 通知音を再生（デフォルトで有効）
  if (options.sound !== false) {
    try {
      const audio = new Audio('/notification.mp3');
      await audio.play();
    } catch (error) {
      console.warn('通知音の再生に失敗しました:', error);
    }
  }

  // 通知を自動的に閉じる（5秒後）
  setTimeout(() => {
    notification.close();
  }, 5000);
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