import { useEffect } from 'react';

export function useWakeLock() {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const request = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch {
        // Silent fail — unsupported or denied
      }
    };

    request();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        request();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLock?.release();
    };
  }, []);
}
