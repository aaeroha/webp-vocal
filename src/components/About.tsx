import { ABOUT_CONTENT } from '../data/content';
import { useReveal } from '../hooks/useReveal';
import { ImagePlaceholder } from './ImagePlaceholder';

export function About() {
  const { ref: mediaRef, isVisible: mediaVisible } = useReveal(0.15);
  const { ref: textRef, isVisible: textVisible } = useReveal(0.15);
  const { ref: cardsRef, isVisible: cardsVisible } = useReveal(0.15);

  return (
    <section id="about" className="relative z-10 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-14">
          {/* Media placeholder with unhurried reveal */}
          <div
            ref={mediaRef}
            className={`reveal-item order-2 md:order-1 ${mediaVisible ? 'is-visible' : ''}`}
          >
            <ImagePlaceholder
              variant="stage"
              label={ABOUT_CONTENT.mediaPlaceholder.label}
              note={ABOUT_CONTENT.mediaPlaceholder.note}
              aspectClass="aspect-[4/3] md:aspect-[4/4.5] lg:aspect-[5/4]"
            />
          </div>

          {/* Story & philosophy with staggered reveal */}
          <div
            ref={textRef}
            style={{ transitionDelay: '140ms' }}
            className={`reveal-item order-1 md:order-2 ${textVisible ? 'is-visible' : ''}`}
          >
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
              {ABOUT_CONTENT.eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-4xl lg:text-[2.85rem]">
              {ABOUT_CONTENT.title}
            </h2>

            <div className="mt-5 space-y-4 text-[15px] leading-[1.7] text-zinc-700 dark:text-zinc-300 sm:text-base lg:text-[1.0625rem]">
              {ABOUT_CONTENT.paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Principle cards with cascade reveal */}
        <div
          ref={cardsRef}
          className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6"
        >
          {ABOUT_CONTENT.principles.map((card, idx) => (
            <article
              key={card.number}
              style={{ transitionDelay: `${idx * 130}ms` }}
              className={`reveal-item rounded-2xl border border-zinc-900/8 bg-[#F2EDE6]/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B45309]/35 dark:border-white/8 dark:bg-[#16151C]/95 dark:hover:border-[#E2A856]/40 dark:gold-glow-hover ${
                cardsVisible ? 'is-visible' : ''
              } ${idx === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <span className="font-serif text-3xl font-semibold text-[#B45309]/70 dark:text-[#E2A856]/80">
                {card.number}
              </span>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-zinc-900 dark:text-[#F5F3EF]">
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
