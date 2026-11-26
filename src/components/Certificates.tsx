import { useEffect, useState, type CSSProperties } from 'react';
import { Award, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { CERTIFICATES_CONTENT } from '../data/content';
import { useReveal } from '../hooks/useReveal';

const GRADUATION_CAPS = [
  { left: '3%', delay: '0s', dur: '4.5s', dx1: '20px', dx2: '44px', r0: '-25deg', r1: '160deg', r2: '350deg', size: 64 },
  { left: '12%', delay: '1.6s', dur: '5.5s', dx1: '-26px', dx2: '-48px', r0: '15deg', r1: '-145deg', r2: '-315deg', size: 84 },
  { left: '22%', delay: '0.6s', dur: '4.9s', dx1: '28px', dx2: '52px', r0: '-18deg', r1: '185deg', r2: '370deg', size: 72 },
  { left: '33%', delay: '2.5s', dur: '4.3s', dx1: '-18px', dx2: '-36px', r0: '20deg', r1: '-165deg', r2: '-345deg', size: 58 },
  { left: '44%', delay: '1.0s', dur: '5.9s', dx1: '24px', dx2: '46px', r0: '-30deg', r1: '140deg', r2: '320deg', size: 90 },
  { left: '55%', delay: '2.1s', dur: '4.7s', dx1: '-30px', dx2: '-52px', r0: '12deg', r1: '-170deg', r2: '-355deg', size: 68 },
  { left: '66%', delay: '0.3s', dur: '5.2s', dx1: '22px', dx2: '40px', r0: '-22deg', r1: '175deg', r2: '360deg', size: 78 },
  { left: '77%', delay: '2.9s', dur: '4.6s', dx1: '-22px', dx2: '-42px', r0: '25deg', r1: '-150deg', r2: '-330deg', size: 62 },
  { left: '87%', delay: '1.2s', dur: '5.6s', dx1: '-24px', dx2: '-44px', r0: '-14deg', r1: '190deg', r2: '380deg', size: 86 },
];

function GraduationCapSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 7L37 15L20 23L3 15L20 7Z" fill="#18181B" stroke="#E2A856" strokeWidth="1.2" className="dark:fill-[#27272A]" />
      <path d="M11 19.2V26.5C11 28.8 15 30.8 20 30.8C25 30.8 29 28.8 29 26.5V19.2L20 23.6L11 19.2Z" fill="#27272A" stroke="#E2A856" strokeWidth="1" className="dark:fill-[#3F3F46]" />
      <path d="M20 15L32.5 20.5V28.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="15" r="1.4" fill="#FACC15" />
      <path d="M31 28.5H34L34.6 33H30.4L31 28.5Z" fill="#FACC15" />
    </svg>
  );
}

export function Certificates() {
  const items = CERTIFICATES_CONTENT.items;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { ref, isVisible } = useReveal({ threshold: 0.06 });

  const selected = selectedIndex !== null ? items[selectedIndex] : null;
  const isModalOpen = selectedIndex !== null;

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) =>
          prev !== null ? (prev - 1 + items.length) % items.length : null
        );
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedIndex, items.length]);

  const goPrev = () => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + items.length) % items.length : null
    );
  };

  const goNext = () => {
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
  };

  const trackItems = [...items, ...items];

  return (
    <section id="certificates" className="relative z-10 overflow-hidden py-14 sm:py-20 lg:py-24">
      {/* Giant Background Graduation Caps soaring to the top & falling infinitely */}
      {isVisible && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-60 dark:opacity-55"
        >
          {GRADUATION_CAPS.map((cap, idx) => (
            <div
              key={idx}
              className="animate-cap-toss absolute bottom-2"
              style={
                {
                  left: cap.left,
                  animationDelay: cap.delay,
                  '--cap-dur': cap.dur,
                  '--cap-dx1': cap.dx1,
                  '--cap-dx2': cap.dx2,
                  '--cap-r0': cap.r0,
                  '--cap-r1': cap.r1,
                  '--cap-r2': cap.r2,
                } as CSSProperties
              }
            >
              <GraduationCapSvg size={cap.size} />
            </div>
          ))}
        </div>
      )}

      <div
        ref={ref}
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className={`reveal-left max-w-2xl ${isVisible ? 'is-visible' : ''}`}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
            {CERTIFICATES_CONTENT.eyebrow}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-4xl lg:text-[2.85rem]">
            {CERTIFICATES_CONTENT.title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
            {CERTIFICATES_CONTENT.subtitle}
          </p>
        </div>

        {/* Infinite auto-scrolling carousel — pauses on hover AND when modal is open */}
        <div
          style={{ transitionDelay: '140ms' }}
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

          <div
            className="animate-cert-marquee gap-4 py-2 sm:gap-5"
            style={{
              animationPlayState: isModalOpen ? 'paused' : undefined,
            }}
          >
            {trackItems.map((cert, idx) => {
              const realIndex = idx % items.length;
              return (
                <button
                  key={`${cert.id}-${idx}`}
                  type="button"
                  onClick={() => setSelectedIndex(realIndex)}
                  className="group relative flex w-[220px] shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-900/10 bg-[#F2EDE6]/95 p-2.5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#B45309]/45 hover:shadow-lg dark:border-white/10 dark:bg-[#16151C]/95 dark:hover:border-[#E2A856]/50 dark:gold-glow-hover sm:w-[255px] lg:w-[275px] cursor-pointer"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-200/70 dark:bg-[#0D0C10]">
                    <img
                      src={cert.imageUrl}
                      alt={cert.title}
                      loading="lazy"
                      decoding="async"
                      width={275}
                      height={367}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/25">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF8F5]/95 px-3 py-1.5 text-xs font-semibold text-zinc-900 opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 dark:bg-[#0D0C10]/90 dark:text-[#E2A856]">
                        <ZoomIn className="h-3.5 w-3.5" />
                        Увеличить
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 px-1 pb-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#B45309] dark:text-[#E2A856]">
                      {cert.category}
                    </p>
                    <p className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-zinc-800 dark:text-[#F5F3EF]">
                      {cert.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selected && selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        >
          <div
            onClick={() => setSelectedIndex(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="animate-modal-enter relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#FAF8F5] p-4 shadow-2xl dark:bg-[#16151C] sm:p-6">
            <div className="flex items-start justify-between gap-4 pb-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B45309]/10 px-3 py-1 text-xs font-semibold text-[#B45309] dark:bg-[#E2A856]/15 dark:text-[#E2A856]">
                  <Award className="h-3.5 w-3.5" />
                  {selected.category} • {selectedIndex + 1} / {items.length}
                </span>
                <h3
                  id="cert-modal-title"
                  className="mt-2 font-serif text-xl font-semibold text-zinc-900 dark:text-[#F5F3EF] sm:text-2xl"
                >
                  {selected.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                aria-label="Закрыть окно просмотра"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-800 transition-colors hover:text-[#B45309] dark:border-white/10 dark:bg-[#0D0C10] dark:text-[#F5F3EF] dark:hover:text-[#E2A856] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-zinc-900/5 dark:bg-black/40">
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="max-h-[68vh] w-auto max-w-full rounded-xl object-contain"
              />

              <button
                type="button"
                onClick={goPrev}
                aria-label="Предыдущий документ"
                className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-xs transition hover:bg-black/75 sm:left-3 sm:h-11 sm:w-11 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Следующий документ"
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-xs transition hover:bg-black/75 sm:right-3 sm:h-11 sm:w-11 cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
