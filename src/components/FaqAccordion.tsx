import { useState, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_CONTENT } from '../data/content';
import { useReveal } from '../hooks/useReveal';

const FLOATING_QUESTIONS = [
  // Outer edges
  { top: '6%', left: '4%', size: 'text-7xl sm:text-8xl', dur: '6.2s', delay: '0s', anim: 'animate-question-mirror' },
  { top: '14%', right: '5%', size: 'text-8xl sm:text-9xl', dur: '8.4s', delay: '1.1s', anim: 'animate-question-orbit' },
  { top: '34%', left: '3%', size: 'text-6xl sm:text-7xl', dur: '7.1s', delay: '0.5s', anim: 'animate-question-tilt' },
  { top: '48%', right: '4%', size: 'text-7xl sm:text-8xl', dur: '6.8s', delay: '1.9s', anim: 'animate-question-mirror' },
  { top: '66%', left: '6%', size: 'text-8xl sm:text-9xl', dur: '9.0s', delay: '1.4s', anim: 'animate-question-orbit' },
  { top: '76%', right: '6%', size: 'text-6xl sm:text-7xl', dur: '5.8s', delay: '0.7s', anim: 'animate-question-tilt' },
  // Closer to middle & center zone
  { top: '10%', left: '26%', size: 'text-6xl sm:text-7xl', dur: '7.4s', delay: '0.9s', anim: 'animate-question-orbit' },
  { top: '24%', left: '54%', size: 'text-7xl sm:text-8xl', dur: '6.6s', delay: '2.1s', anim: 'animate-question-mirror' },
  { top: '39%', left: '34%', size: 'text-8xl sm:text-9xl', dur: '8.2s', delay: '0.4s', anim: 'animate-question-tilt' },
  { top: '53%', left: '62%', size: 'text-7xl sm:text-8xl', dur: '7.8s', delay: '1.7s', anim: 'animate-question-mirror' },
  { top: '69%', left: '44%', size: 'text-6xl sm:text-8xl', dur: '6.4s', delay: '1.2s', anim: 'animate-question-orbit' },
  { top: '83%', left: '24%', size: 'text-7xl sm:text-8xl', dur: '8.8s', delay: '2.5s', anim: 'animate-question-tilt' },
  { top: '86%', left: '68%', size: 'text-6xl sm:text-7xl', dur: '7.0s', delay: '0.3s', anim: 'animate-question-mirror' },
];

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(FAQ_CONTENT.items[0]?.id ?? null);
  const { ref: headerRef, isVisible: headerVisible } = useReveal({ threshold: 0.1 });
  const { ref, isVisible } = useReveal({ threshold: 0.06 });

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="relative z-10 overflow-hidden py-14 sm:py-20 lg:py-24">
      {/* Floating & Mirror-Flipping Question Marks in Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none text-[#B45309] dark:text-[#E2A856]"
      >
        {FLOATING_QUESTIONS.map((q, idx) => (
          <span
            key={idx}
            className={`${q.anim} absolute font-serif font-bold ${q.size}`}
            style={
              {
                top: q.top,
                left: q.left,
                right: q.right,
                animationDelay: q.delay,
                '--q-dur': q.dur,
              } as CSSProperties
            }
          >
            ?
          </span>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          className={`reveal-item text-left sm:text-center ${headerVisible ? 'is-visible' : ''}`}
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
            {FAQ_CONTENT.eyebrow}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-4xl lg:text-[2.85rem]">
            {FAQ_CONTENT.title}
          </h2>
        </div>

        <div ref={ref} className="mt-8 space-y-3 sm:mt-10">
          {FAQ_CONTENT.items.map((item, idx) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                style={{ transitionDelay: `${idx * 60}ms` }}
                className={`reveal-item overflow-hidden rounded-2xl border transition-colors duration-300 ${
                  isOpen
                    ? 'border-[#B45309]/40 bg-[#F2EDE6] dark:border-[#E2A856]/45 dark:bg-[#191722]'
                    : 'border-zinc-900/10 bg-[#F2EDE6]/80 hover:border-[#B45309]/25 dark:border-white/10 dark:bg-[#16151C]/90 dark:hover:border-[#E2A856]/30'
                } ${isVisible ? 'is-visible' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5 cursor-pointer"
                >
                  <span className="font-serif text-xl font-semibold leading-snug text-zinc-900 dark:text-[#F5F3EF] sm:text-2xl">
                    {item.question}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-900/10 bg-[#FAF8F5] text-[#B45309] transition-transform duration-300 dark:border-white/10 dark:bg-[#0D0C10] dark:text-[#E2A856] ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 sm:px-6 sm:pb-6 sm:text-base whitespace-pre-line">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
