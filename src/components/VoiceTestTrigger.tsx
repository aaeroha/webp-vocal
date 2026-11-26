import { useEffect, useState } from 'react';
import { AudioWaveform, Mic, X } from 'lucide-react';

interface VoiceTestTriggerProps {
  onOpen: () => void;
}

/**
 * High-visibility floating Voice Test badge in the bottom-left corner.
 * Appears after scrolling past 1-2 blocks with concentric radiating audio ripples,
 * gentle floating motion, and a clean dismiss button integrated right inside the pill.
 */
export function VoiceTestTrigger({ onOpen }: VoiceTestTriggerProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420);
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
      <div className="animate-badge-float relative flex items-center rounded-full border-2 border-[#B45309] bg-gradient-to-r from-[#B45309] via-[#C26D3A] to-[#D97706] p-1 pr-2 text-white shadow-[0_10px_32px_rgba(180,83,9,0.45)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_14px_38px_rgba(217,119,6,0.55)] dark:border-[#FACC15]/80 dark:from-[#E2A856] dark:via-[#EBB86E] dark:to-[#F3C884] dark:text-[#0D0C10] dark:shadow-[0_10px_34px_rgba(226,168,86,0.42)]">
        <button
          type="button"
          onClick={onOpen}
          aria-label="Пройти тест на вокальные способности"
          className="flex items-center gap-2.5 pl-1 pr-2 py-0.5 text-left cursor-pointer focus:outline-none"
        >
          {/* Microphone orb with double radiating sound wave ripples */}
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#B45309] shadow-sm dark:bg-[#0D0C10] dark:text-[#FACC15]">
            <span className="animate-voice-ripple absolute inset-0 rounded-full border-2 border-white/80 dark:border-[#0D0C10]/70" />
            <span className="animate-voice-ripple-delayed absolute inset-0 rounded-full border-2 border-white/60 dark:border-[#0D0C10]/50" />
            <Mic className="relative h-4.5 w-4.5" />
          </span>

          <div className="leading-tight">
            <span className="flex items-center gap-1.5 text-xs font-bold sm:text-sm">
              <span>Проверь свой голос</span>
              <AudioWaveform className="h-3.5 w-3.5 animate-pulse" />
            </span>
            <span className="block text-[10.5px] font-semibold opacity-90 sm:text-[11px]">
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
          className="ml-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/15 text-white/90 transition-colors hover:bg-black/30 hover:text-white dark:bg-black/12 dark:text-[#0D0C10]/75 dark:hover:bg-black/25 dark:hover:text-[#0D0C10] cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
