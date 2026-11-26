import { useEffect, useState } from 'react';
import { AudioWaveform, Mic, X } from 'lucide-react';

interface VoiceTestTriggerProps {
  onOpen: () => void;
}

/**
 * Larger, luminous Voice Test pill in the bottom-left corner with theme-matched
 * sound ripples radiating outward from the ENTIRE pill capsule.
 */
export function VoiceTestTrigger({ onOpen }: VoiceTestTriggerProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 360);
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
          : 'translate-y-10 opacity-0 pointer-events-none'
      }`}
    >
      <div className="animate-badge-float relative flex items-center">
        {/* Dual radiating theme-colored capsule ripples expanding from the ENTIRE pill */}
        <span
          aria-hidden="true"
          className="animate-voice-ripple pointer-events-none absolute inset-0 rounded-full border-2 border-[#B45309]/70 dark:border-[#E2A856]/75"
        />
        <span
          aria-hidden="true"
          className="animate-voice-ripple-delayed pointer-events-none absolute inset-0 rounded-full border-2 border-[#D97706]/55 dark:border-[#FACC15]/60"
        />

        <div className="relative flex items-center rounded-full border-2 border-[#D97706] bg-gradient-to-r from-[#B45309] via-[#C26D3A] to-[#D97706] p-1.5 pr-2.5 text-white shadow-[0_12px_34px_rgba(180,83,9,0.5)] transition-all duration-300 hover:scale-[1.03] dark:border-[#FACC15]/85 dark:from-[#E2A856] dark:via-[#EBB86E] dark:to-[#F3C884] dark:text-[#0D0C10] dark:shadow-[0_12px_36px_rgba(226,168,86,0.48)]">
          <button
            type="button"
            onClick={onOpen}
            aria-label="Пройти тест на вокальные способности"
            className="flex items-center gap-3 pl-1 pr-2.5 py-1 text-left cursor-pointer focus:outline-none"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#B45309] shadow-sm dark:bg-[#0D0C10] dark:text-[#FACC15] sm:h-12 sm:w-12">
              <Mic className="h-5 w-5" />
            </span>

            <div className="leading-tight">
              <span className="flex items-center gap-1.5 text-sm font-bold sm:text-[15px]">
                <span>Проверь свой голос</span>
                <AudioWaveform className="h-4 w-4 animate-pulse" />
              </span>
              <span className="mt-0.5 block text-[11px] font-semibold opacity-95 sm:text-xs">
                Спой и узнай свой тембр
              </span>
            </div>
          </button>

          {/* Integrated dismiss X cleanly inside the capsule */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            aria-label="Скрыть приглашение на тест голоса"
            className="ml-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/15 text-white/95 transition-colors hover:bg-black/30 hover:text-white dark:bg-black/15 dark:text-[#0D0C10]/80 dark:hover:bg-black/25 dark:hover:text-[#0D0C10] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
