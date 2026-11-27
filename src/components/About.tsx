import { AudioWaveform, HeartPulse, Mic2 } from 'lucide-react';
import { ABOUT_CONTENT, type PrincipleCard } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import { ImagePlaceholder } from './ImagePlaceholder';

function PrincipleAnimatedIcon({ iconKey }: { iconKey: PrincipleCard['iconKey'] }) {
  if (iconKey === 'physiology') {
    return (
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#10B981]/35 bg-[#10B981]/10 text-[#059669] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-[#10B981]/20 dark:border-[#34D399]/35 dark:bg-[#10B981]/14 dark:text-[#34D399]">
        <HeartPulse className="h-6 w-6 animate-icon-pulse transition-transform duration-300 group-hover:scale-110" />
      </div>
    );
  }
  if (iconKey === 'mechanics') {
    return (
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3B82F6]/35 bg-[#3B82F6]/10 text-[#2563EB] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-[#3B82F6]/20 dark:border-[#60A5FA]/35 dark:bg-[#3B82F6]/14 dark:text-[#60A5FA]">
        <AudioWaveform className="h-6 w-6 animate-icon-breathe transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
      </div>
    );
  }
  return (
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F59E0B]/40 bg-[#F59E0B]/12 text-[#D97706] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-[#F59E0B]/20 dark:border-[#FACC15]/40 dark:bg-[#FACC15]/14 dark:text-[#FACC15]">
      <Mic2 className="h-6 w-6 animate-icon-sway transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
    </div>
  );
}

export function About() {
  const { ref: mediaRef, isVisible: mediaVisible } = useReveal({ threshold: 0.1 });
  const { ref: textRef, isVisible: textVisible } = useReveal({ threshold: 0.1 });
  const { ref: cardsRef, isVisible: cardsVisible } = useReveal({ threshold: 0.08 });

  return (
    <section id="about" className="relative z-10 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-14">
          {/* Media placeholder with harmonious reveal from left */}
          <div
            ref={mediaRef}
            className={`reveal-left order-2 md:order-1 ${mediaVisible ? 'is-visible' : ''}`}
          >
            <ImagePlaceholder
              variant="stage"
              label={ABOUT_CONTENT.mediaPlaceholder.label}
              note={ABOUT_CONTENT.mediaPlaceholder.note}
              aspectClass="aspect-[4/3] md:aspect-[4/4.5] lg:aspect-[5/4]"
            />
          </div>

          {/* Story & philosophy with staggered reveal from right */}
          <div
            ref={textRef}
            style={{ transitionDelay: '120ms' }}
            className={`reveal-right order-1 md:order-2 ${textVisible ? 'is-visible' : ''}`}
          >
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
              {ABOUT_CONTENT.eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-4xl lg:text-[2.85rem]">
              {ABOUT_CONTENT.title}
            </h2>

            <div className="mt-5 space-y-4 text-[15px] leading-[1.7] text-zinc-700 dark:text-zinc-300 sm:text-base lg:text-[1.0625rem]">
              {ABOUT_CONTENT.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  style={{ transitionDelay: `${180 + idx * 100}ms` }}
                  className={`reveal-item ${textVisible ? 'is-visible' : ''}`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Principle cards with animated themed icons (no numbers!) */}
        <div
          ref={cardsRef}
          className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6"
        >
          {ABOUT_CONTENT.principles.map((card, idx) => (
            <article
              key={card.id}
              style={{ transitionDelay: `${idx * 120}ms` }}
              className={`group reveal-scale rounded-2xl border border-zinc-900/8 bg-[#F2EDE6]/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B45309]/35 dark:border-white/8 dark:bg-[#16151C]/95 dark:hover:border-[#E2A856]/40 dark:gold-glow-hover ${
                cardsVisible ? 'is-visible' : ''
              } ${idx === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <PrincipleAnimatedIcon iconKey={card.iconKey} />
              <h3 className="mt-4 font-serif text-2xl font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                {card.title}
              </h3>
              <p className="mt-2.5 text-[15px] leading-[1.65] text-zinc-700 dark:text-zinc-300">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
