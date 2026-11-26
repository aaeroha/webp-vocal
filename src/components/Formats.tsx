import { CalendarCheck, Check, Mic2, Music2, SlidersHorizontal, Wind } from 'lucide-react';
import { LESSON_FLOW_CONTENT, type LessonStepItem } from '../data/content';
import { useReveal } from '../hooks/useReveal';

interface FormatsProps {
  onOpenBooking: () => void;
}

function StepAnimatedIcon({ iconKey }: { iconKey: LessonStepItem['iconKey'] }) {
  if (iconKey === 'breath') {
    return (
      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#B45309]/20 bg-[#FAF8F5] text-[#B45309] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:border-[#0EA5E9]/50 group-hover:bg-[#0EA5E9]/15 group-hover:text-[#0284C7] dark:border-[#E2A856]/25 dark:bg-[#0D0C10] dark:text-[#E2A856] dark:group-hover:border-[#38BDF8]/50 dark:group-hover:bg-[#38BDF8]/20 dark:group-hover:text-[#38BDF8]">
        <Wind className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-rotate-6" />
      </div>
    );
  }
  if (iconKey === 'tuning') {
    return (
      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#B45309]/20 bg-[#FAF8F5] text-[#B45309] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:border-[#8B5CF6]/50 group-hover:bg-[#8B5CF6]/15 group-hover:text-[#7C3AED] dark:border-[#E2A856]/25 dark:bg-[#0D0C10] dark:text-[#E2A856] dark:group-hover:border-[#A78BFA]/50 dark:group-hover:bg-[#A78BFA]/20 dark:group-hover:text-[#A78BFA]">
        <SlidersHorizontal className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
      </div>
    );
  }
  if (iconKey === 'music') {
    return (
      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#B45309]/20 bg-[#FAF8F5] text-[#B45309] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:border-[#EC4899]/50 group-hover:bg-[#EC4899]/15 group-hover:text-[#DB2777] dark:border-[#E2A856]/25 dark:bg-[#0D0C10] dark:text-[#E2A856] dark:group-hover:border-[#F472B6]/50 dark:group-hover:bg-[#F472B6]/20 dark:group-hover:text-[#F472B6]">
        <Music2 className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
      </div>
    );
  }
  return (
    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#B45309]/20 bg-[#FAF8F5] text-[#B45309] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:border-[#F59E0B]/60 group-hover:bg-[#F59E0B]/15 group-hover:text-[#D97706] dark:border-[#E2A856]/25 dark:bg-[#0D0C10] dark:text-[#E2A856] dark:group-hover:border-[#FACC15]/60 dark:group-hover:bg-[#FACC15]/20 dark:group-hover:text-[#FACC15]">
      <Mic2 className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
    </div>
  );
}

export function Formats({ onOpenBooking }: FormatsProps) {
  const { ref: headerRef, isVisible: headerVisible } = useReveal({ threshold: 0.1 });
  const { ref, isVisible } = useReveal({ threshold: 0.08 });

  return (
    <section id="formats" className="relative z-10 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          className={`reveal-left max-w-2xl ${headerVisible ? 'is-visible' : ''}`}
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
            {LESSON_FLOW_CONTENT.eyebrow}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-4xl lg:text-[2.85rem]">
            {LESSON_FLOW_CONTENT.title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
            {LESSON_FLOW_CONTENT.subtitle}
          </p>
        </div>

        {/* 1 col mobile, 2 cols tablet, 4 cols desktop (with animated themed icons, no numbers) */}
        <div
          ref={ref}
          className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-10 lg:grid-cols-4"
        >
          {LESSON_FLOW_CONTENT.items.map((item, idx) => (
            <article
              key={item.id}
              style={{ transitionDelay: `${idx * 95}ms` }}
              className={`group reveal-item flex flex-col justify-between rounded-2xl border border-zinc-900/10 bg-[#F2EDE6]/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B45309]/35 dark:border-white/10 dark:bg-[#16151C]/95 dark:hover:border-[#E2A856]/40 dark:gold-glow-hover ${
                isVisible ? 'is-visible' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2.5">
                  <StepAnimatedIcon iconKey={item.iconKey} />
                  <span className="inline-flex rounded-full bg-[#B45309]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#B45309] dark:bg-[#E2A856]/15 dark:text-[#E2A856]">
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-2xl font-semibold leading-snug text-zinc-900 dark:text-[#F5F3EF]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {item.description}
                </p>

                <ul className="mt-5 space-y-2.5 border-t border-zinc-900/8 pt-4 dark:border-white/8">
                  {item.highlights.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-sm"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309] dark:text-[#E2A856]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-start sm:mt-10">
          <button
            type="button"
            onClick={onOpenBooking}
            className="btn-sheen inline-flex items-center gap-2.5 rounded-full bg-[#B45309] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#EBB86E] dark:gold-glow cursor-pointer"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Обсудить график и записаться</span>
          </button>
        </div>
      </div>
    </section>
  );
}
