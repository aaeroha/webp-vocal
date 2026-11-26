import { Award, Camera, FileCheck2, Mic2, ZoomIn } from 'lucide-react';

interface ImagePlaceholderProps {
  label: string;
  note: string;
  variant?: 'portrait' | 'stage' | 'certificate';
  aspectClass?: string;
  badge?: string;
  onClick?: () => void;
}

export function ImagePlaceholder({
  label,
  note,
  variant = 'portrait',
  aspectClass = 'aspect-[4/5]',
  badge,
  onClick,
}: ImagePlaceholderProps) {
  const Icon =
    variant === 'certificate'
      ? FileCheck2
      : variant === 'stage'
        ? Mic2
        : Camera;

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={`group relative w-full overflow-hidden rounded-2xl border border-dashed border-[#B45309]/30 bg-gradient-to-br from-[#F2EDE6] via-[#FAF8F5] to-[#EAE2D6] text-left transition-all duration-300 dark:border-[#E2A856]/30 dark:from-[#1B1922] dark:via-[#16151C] dark:to-[#121117] ${aspectClass} ${
        onClick
          ? 'cursor-pointer hover:-translate-y-1 hover:border-[#B45309]/60 hover:shadow-lg dark:hover:border-[#E2A856]/60 dark:gold-glow-hover'
          : ''
      }`}
    >
      {/* Decorative subtle soundwave / musical corner lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-25"
      >
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-[#B45309]/25 dark:border-[#E2A856]/25" />
        <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full border border-[#B45309]/15 dark:border-[#E2A856]/15" />
        <div className="absolute bottom-4 left-4 flex items-end gap-1 opacity-50">
          <span className="h-3 w-0.5 rounded-full bg-[#B45309] dark:bg-[#E2A856] animate-sound-bar" />
          <span
            className="h-5 w-0.5 rounded-full bg-[#B45309] dark:bg-[#E2A856] animate-sound-bar"
            style={{ animationDelay: '0.25s' }}
          />
          <span
            className="h-4 w-0.5 rounded-full bg-[#B45309] dark:bg-[#E2A856] animate-sound-bar"
            style={{ animationDelay: '0.5s' }}
          />
          <span
            className="h-6 w-0.5 rounded-full bg-[#B45309] dark:bg-[#E2A856] animate-sound-bar"
            style={{ animationDelay: '0.75s' }}
          />
        </div>
      </div>

      {/* Center placeholder content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-5 text-center sm:p-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#B45309]/25 bg-[#FAF8F5]/85 text-[#B45309] shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-[#E2A856]/30 dark:bg-[#0D0C10]/80 dark:text-[#E2A856]">
          <Icon className="h-5 w-5" />
        </div>

        <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#B45309]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#B45309] dark:bg-[#E2A856]/15 dark:text-[#E2A856]">
          {variant === 'certificate' ? (
            <>
              <Award className="h-3 w-3" />
              Документ / плейсхолдер
            </>
          ) : (
            'Временный плейсхолдер'
          )}
        </span>

        <p className="font-serif text-lg font-semibold leading-snug text-zinc-900 dark:text-[#F5F3EF] sm:text-xl">
          {label}
        </p>

        <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {note}
        </p>

        {onClick && (
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#B45309] opacity-85 transition-opacity group-hover:opacity-100 dark:text-[#E2A856]">
            <ZoomIn className="h-3.5 w-3.5" />
            Открыть превью
          </span>
        )}
      </div>

      {/* Optional bottom overlay badge */}
      {badge && (
        <div className="absolute inset-x-3 bottom-3 z-20 rounded-xl border border-zinc-900/10 bg-[#FAF8F5]/92 px-3.5 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-[#0D0C10]/88">
          <p className="text-xs font-medium leading-snug text-zinc-800 dark:text-[#F5F3EF]">
            {badge}
          </p>
        </div>
      )}
    </Wrapper>
  );
}
