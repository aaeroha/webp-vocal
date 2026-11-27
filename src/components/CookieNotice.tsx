import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'vocal-studio-cookie-notice-v1';

/**
 * Unobtrusive notice explaining that the studio page only stores theme preference
 * locally and embeds third-party Yandex Maps widget cookies.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (!accepted) {
        const timer = window.setTimeout(() => setVisible(true), 1200);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const accept = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore storage errors
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Уведомление о cookie и локальных данных"
      className="fixed bottom-3 left-1/2 z-50 w-[min(94vw,540px)] -translate-x-1/2 animate-modal-enter sm:bottom-5"
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-900/12 bg-[#FAF8F5]/95 px-4 py-3 text-xs shadow-2xl backdrop-blur-md dark:border-white/15 dark:bg-[#16151C]/96">
        <div className="flex items-start gap-2.5 text-zinc-700 dark:text-zinc-300">
          <Cookie className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309] dark:text-[#E2A856]" />
          <p className="leading-relaxed">
            Сайт сохраняет выбранную тему в браузере, а встроенный виджет Яндекс Карт может использовать технические cookie.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-[#B45309] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#F3C884] cursor-pointer"
          >
            Понятно
          </button>
          <button
            type="button"
            onClick={accept}
            aria-label="Закрыть уведомление"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-black/5 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
