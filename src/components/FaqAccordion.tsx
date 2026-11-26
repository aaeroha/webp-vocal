import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_CONTENT } from '../data/content';
import { useReveal } from '../hooks/useReveal';

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(FAQ_CONTENT.items[0]?.id ?? null);
  const { ref, isVisible } = useReveal();

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="relative z-10 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-left sm:text-center">
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
                    : 'border-zinc-900/10 bg-[#F2EDE6]/75 hover:border-[#B45309]/25 dark:border-white/10 dark:bg-[#16151C]/90 dark:hover:border-[#E2A856]/30'
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
                    <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:px-6 sm:pb-6 sm:text-base">
                      {item.answer}
                    </p>
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
