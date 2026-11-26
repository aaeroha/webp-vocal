import { Star } from 'lucide-react';
import { AVITO_REVIEWS_URL, REVIEWS_CONTENT, YANDEX_PROFILE_URL } from '../data/content';
import { useReveal } from '../hooks/useReveal';

function YandexLogo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7 shrink-0"
      fill="none"
    >
      <circle cx="12" cy="12" r="12" fill="#FC3F1D" />
      <path
        d="M13.56 6.2h-1.48c-2.25 0-3.44 1.15-3.44 2.86 0 1.4.62 2.2 1.88 3.04l1.04.7-2.98 5h-2.1l2.7-4.5c-1.56-1.12-2.42-2.28-2.42-4.14 0-2.74 1.94-4.56 5.26-4.56h3.48v13.2h-1.94V6.2z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function AvitoLogo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7 shrink-0"
      fill="none"
    >
      <circle cx="8.2" cy="15.8" r="5" fill="#04E061" />
      <circle cx="15.8" cy="7.5" r="3.9" fill="#00AAFF" />
      <circle cx="6.8" cy="7.2" r="2.6" fill="#965EEB" />
      <circle cx="16.5" cy="16.2" r="2.9" fill="#FF4053" />
    </svg>
  );
}

export function Reviews() {
  const { ref: sectionRef, isVisible } = useReveal({ threshold: 0.08 });
  const trackItems = [...REVIEWS_CONTENT.items, ...REVIEWS_CONTENT.items];

  return (
    <section id="reviews" className="relative z-10 py-14 sm:py-20 lg:py-24">
      <div
        ref={sectionRef}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className={`reveal-left max-w-2xl ${isVisible ? 'is-visible' : ''}`}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
              {REVIEWS_CONTENT.eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-4xl lg:text-[2.85rem]">
              {REVIEWS_CONTENT.title}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
              {REVIEWS_CONTENT.subtitle}
            </p>
          </div>

          {/* Twin 5.0 Profile Badges: Yandex & Avito (with green outline) */}
          <div
            style={{ transitionDelay: '120ms' }}
            className={`reveal-right flex flex-wrap items-stretch gap-3 ${isVisible ? 'is-visible' : ''}`}
          >
            <a
              href={YANDEX_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-[215px] items-center gap-3 rounded-2xl border border-[#B45309]/30 bg-[#F2EDE6]/95 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B45309]/60 hover:shadow-md dark:border-[#E2A856]/35 dark:bg-[#16151C] dark:hover:border-[#E2A856]/65 dark:gold-glow-hover"
            >
              <YandexLogo />
              <span className="font-serif text-3xl font-semibold leading-none text-[#B45309] dark:text-[#E2A856]">
                {REVIEWS_CONTENT.yandexRating}
              </span>
              <div className="leading-tight">
                <div className="flex items-center gap-0.5 text-[#D97706] dark:text-[#E2A856]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-1 text-xs font-semibold text-zinc-800 dark:text-[#F5F3EF]">
                  Оценка на Яндекс
                </p>
              </div>
            </a>

            <a
              href={AVITO_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-[215px] items-center gap-3 rounded-2xl border-2 border-[#04B44B]/60 bg-[#F2EDE6]/95 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#04B44B] hover:shadow-md hover:shadow-[#04B44B]/15 dark:border-[#04E061]/55 dark:bg-[#16151C] dark:hover:border-[#04E061] dark:hover:shadow-[#04E061]/20"
            >
              <AvitoLogo />
              <span className="font-serif text-3xl font-semibold leading-none text-[#049A40] dark:text-[#04E061]">
                {REVIEWS_CONTENT.avitoRating}
              </span>
              <div className="leading-tight">
                <div className="flex items-center gap-0.5 text-[#049A40] dark:text-[#04E061]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-1 text-xs font-semibold text-zinc-800 dark:text-[#F5F3EF]">
                  Оценка на Авито
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Infinite auto-scrolling carousel inside max-w-7xl */}
        <div
          style={{ transitionDelay: '180ms' }}
          className={`reveal-scale cert-marquee-wrap relative mt-8 overflow-hidden rounded-2xl sm:mt-10 ${
            isVisible ? 'is-visible' : ''
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#FAF8F5] to-transparent dark:from-[#0D0C10] sm:w-14"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#FAF8F5] to-transparent dark:from-[#0D0C10] sm:w-14"
          />

          <div className="animate-cert-marquee gap-4 py-2 sm:gap-5">
            {trackItems.map((review, idx) => (
              <a
                key={`${review.id}-${idx}`}
                href={review.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex w-[290px] shrink-0 flex-col rounded-2xl border bg-[#F2EDE6]/92 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-[#16151C]/95 dark:gold-glow-hover sm:w-[340px] sm:p-6 ${
                  review.platform === 'Авито'
                    ? 'border-[#04B44B]/30 hover:border-[#04B44B]/70 dark:border-[#04E061]/25 dark:hover:border-[#04E061]/65'
                    : 'border-zinc-900/10 hover:border-[#B45309]/40 dark:border-white/10 dark:hover:border-[#E2A856]/45'
                }`}
              >
                {/* Top: Author & Date + Platform badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF]">
                      {review.author}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {review.date}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      review.platform === 'Авито'
                        ? 'bg-[#04B44B]/12 text-[#049A40] dark:bg-[#04E061]/15 dark:text-[#04E061]'
                        : 'bg-[#B45309]/10 text-[#B45309] dark:bg-[#E2A856]/15 dark:text-[#E2A856]'
                    }`}
                  >
                    {review.platform}
                  </span>
                </div>

                {/* Middle: 5 stars */}
                <div className="mt-3 flex items-center gap-0.5 text-[#D97706] dark:text-[#E2A856]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                {/* Bottom: Review text */}
                <p className="mt-3 text-[14.5px] leading-[1.65] text-zinc-700 dark:text-zinc-300">
                  «{review.text}»
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
