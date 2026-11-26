import { useEffect } from 'react';
import { MapPin, MessageCircle, Navigation, Send, Sparkles, X } from 'lucide-react';
import { SITE_CONFIG } from '../data/content';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
      />

      {/* Unified Modal Card */}
      <div className="animate-modal-enter relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-zinc-900/12 bg-[#FAF8F5] p-6 shadow-2xl dark:border-white/15 dark:bg-[#16151C] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B45309]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#B45309] dark:bg-[#E2A856]/15 dark:text-[#E2A856]">
              <Sparkles className="h-3.5 w-3.5" />
              Запись на занятие
            </span>
            <h3
              id="booking-modal-title"
              className="mt-2.5 font-serif text-2xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-3xl"
            >
              Выберите удобный способ
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Отвечу лично, подберём удобное время очно в студии или онлайн.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно записи"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-700 transition-colors hover:border-[#B45309]/40 hover:text-[#B45309] dark:border-white/10 dark:bg-[#0D0C10] dark:text-zinc-300 dark:hover:text-[#E2A856] cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* All options styled uniformly */}
        <div className="mt-6 space-y-3">
          {/* WhatsApp */}
          <a
            href={SITE_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="group flex w-full items-center gap-3.5 rounded-2xl border border-zinc-900/10 bg-[#F2EDE6]/90 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#22C55E]/55 hover:bg-[#F2EDE6] hover:shadow-md dark:border-white/10 dark:bg-[#0D0C10]/85 dark:hover:border-[#22C55E]/55"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/15 text-[#16A34A] transition-transform duration-200 group-hover:scale-105 dark:bg-[#22C55E]/20 dark:text-[#4ADE80]">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                Написать в WhatsApp
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Быстрая переписка или голосовое сообщение
              </p>
            </div>
          </a>

          {/* Telegram */}
          <a
            href={SITE_CONFIG.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="group flex w-full items-center gap-3.5 rounded-2xl border border-zinc-900/10 bg-[#F2EDE6]/90 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#38BDF8]/55 hover:bg-[#F2EDE6] hover:shadow-md dark:border-white/10 dark:bg-[#0D0C10]/85 dark:hover:border-[#38BDF8]/55"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0EA5E9]/15 text-[#0284C7] transition-transform duration-200 group-hover:scale-105 dark:bg-[#38BDF8]/20 dark:text-[#38BDF8]">
              <Send className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                Написать в Telegram
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Уточнить график и подобрать формат урока
              </p>
            </div>
          </a>

          {/* Yandex Maps Route */}
          <a
            href={SITE_CONFIG.yandexMapRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="group flex w-full items-center gap-3.5 rounded-2xl border border-zinc-900/10 bg-[#F2EDE6]/90 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FC3F1D]/50 hover:bg-[#F2EDE6] hover:shadow-md dark:border-white/10 dark:bg-[#0D0C10]/85 dark:hover:border-[#FC3F1D]/55"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FC3F1D]/15 text-[#FC3F1D] transition-transform duration-200 group-hover:scale-105 dark:bg-[#FC3F1D]/20 dark:text-[#FF6448]">
              <Navigation className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                Построить маршрут в Яндекс Картах
              </p>
              <p className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>г. Москва, Ватутинки • Очно в студии</span>
              </p>
            </div>
          </a>
        </div>

        <p className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {SITE_CONFIG.schedule}
        </p>
      </div>
    </div>
  );
}
