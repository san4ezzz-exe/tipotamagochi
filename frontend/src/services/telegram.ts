// Telegram WebApp SDK Wrapper with Haptic Feedback and Mock Mode for Dev

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        expand: () => void;
        ready: () => void;
        close: () => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        themeParams: Record<string, string>;
      };
    };
  }
}

export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
};

export const getTelegramInitData = (): string => {
  if (isTelegramWebApp()) {
    return window.Telegram!.WebApp.initData;
  }
  return '';
};

export const getTelegramUser = () => {
  if (isTelegramWebApp() && window.Telegram?.WebApp.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  // Mock user for local development in desktop browser
  return {
    id: 1337420,
    first_name: 'Alex (Dev)',
    username: 'alex_dev',
  };
};

export const initTelegramApp = () => {
  if (isTelegramWebApp()) {
    try {
      window.Telegram!.WebApp.ready();
      window.Telegram!.WebApp.expand();
    } catch (e) {
      console.warn('Failed to expand Telegram WebApp', e);
    }
  }
};

export const hapticImpact = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    } else if ('vibrate' in navigator) {
      // Fallback for normal browser
      navigator.vibrate(style === 'heavy' ? 40 : 15);
    }
  } catch (e) {
    // Ignore haptic errors on unsupported devices
  }
};

export const hapticNotification = (type: 'error' | 'success' | 'warning') => {
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    } else if ('vibrate' in navigator) {
      navigator.vibrate(type === 'error' ? [30, 50, 30] : [20, 20]);
    }
  } catch (e) {
    // Ignore
  }
};
