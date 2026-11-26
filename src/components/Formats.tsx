import { Check, Send } from 'lucide-react';
import { LESSON_FLOW_CONTENT, SITE_CONFIG } from '../data/content';
import { useReveal } from '../hooks/useReveal';

export function Formats() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="formats" className="relative z-10 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
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

        {/* 1 col mobile, 2 cols tablet, 4 cols desktop */}
        <div
          ref={ref}
          className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-10 lg:grid-cols-4"
        >
          {LESSON_FLOW_CONTENT.items.map((item, idx) => (
            <article
              key={item.id}
              style={{ transitionDelay: `${idx * 80}ms` }}
              className={`reveal-item flex flex-col justify-between rounded-2xl border border-zinc-900/10 bg-[#F2EDE6]/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B45309]/35 dark:border-white/10 dark:bg-[#16151C]/95 dark:hover:border-[#E2A856]/40 dark:gold-glow-hover ${
                isVisible ? 'is-visible' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-serif text-3xl font-semibold text-[#B45309]/70 dark:text-[#E2A856]/80">
                    {item.step}
                  </span>
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
          <a
            href={SITE_CONFIG.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sheen inline-flex items-center gap-2.5 rounded-full bg-[#B45309] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#EBB86E] dark:gold-glow"
          >
            <Send className="h-4 w-4" />
            <span>Обсудить график и записаться</span>
          </a>
        </div>
      </div>
    </section>
  );
}
