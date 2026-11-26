import { useEffect, useState } from 'react';
import { AudioWaveform, Mic, X } from 'lucide-react';

interface VoiceTestTriggerProps {
  onOpen: () => void;
}

/**
 * Appears gracefully in the bottom-left corner after scrolling past 1-2 blocks (~750px),
 * inviting the visitor to take the interactive Voice Type & Pitch Test modal.
 */
export function VoiceTestTrigger({ onOpen }: VoiceTestTriggerProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 750) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 transition-all duration-500 ease-out ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-8 opacity-0 pointer-events-none'
      }`}
    >
      <div className="group relative flex items-center">
        <button
          type="button"
          onClick={onOpen}
          aria-label="Пройти тест на вокальные способности"
          className="btn-sheen flex items-center gap-2.5 rounded-full border border-[#B45309]/40 bg-[#FAF8F5]/95 pl-2.5 pr-4 py-2 text-left shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B45309] hover:shadow-amber-500/20 dark:border-[#E2A856]/40 dark:bg-[#16151C]/95 dark:hover:border-[#E2A856] dark:gold-glow cursor-pointer"
        >
          {/* Animated pulsing mic icon */}
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B45309] to-[#D97706] text-white shadow-sm dark:from-[#E2A856] dark:to-[#F3C884] dark:text-[#0D0C10]">
            <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/45 opacity-75" />
            <Mic className="relative h-4 w-4" />
          </span>

          <div className="leading-tight">
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-[#F5F3EF] sm:text-sm">
              <span>Тест голоса</span>
              <AudioWaveform className="h-3.5 w-3.5 text-[#B45309] dark:text-[#E2A856] animate-pulse" />
            </span>
            <span className="hidden text-[11px] text-zinc-500 dark:text-zinc-400 sm:block">
              Узнайте ваш тембр за 10 сек
            </span>
          </div>
        </button>

        {/* Subtle close/hide button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Скрыть приглашение на тест голоса"
          className="ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-900/10 bg-[#FAF8F5]/90 text-zinc-500 opacity-75 shadow-sm transition hover:opacity-100 hover:text-zinc-900 dark:border-white/15 dark:bg-[#16151C]/90 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
