import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Award, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
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
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const exactScrollRef = useRef(0);
  const dragStateRef = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });
  const modalSwipeRef = useRef({ active: false, startX: 0, startY: 0, swiped: false });
  const { ref, isVisible } = useReveal({ threshold: 0.02 });

  const selected = selectedIndex !== null ? items[selectedIndex] : null;
  const isModalOpen = selectedIndex !== null;

  useEffect(() => {
    setZoomLevel(1);
  }, [selectedIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isVisible) return;

    exactScrollRef.current = el.scrollLeft;
    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min(50, now - lastTime);
      lastTime = now;

      if (!isPaused && !isModalOpen && !dragStateRef.current.active && el.scrollWidth > el.clientWidth) {
        const half = el.scrollWidth / 2;
        exactScrollRef.current += (dt / 1000) * 32;
        if (exactScrollRef.current >= half) {
          exactScrollRef.current -= half;
        }
        el.scrollLeft = exactScrollRef.current;
      } else {
        exactScrollRef.current = el.scrollLeft;
      }
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [isVisible, isPaused, isModalOpen]);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  useEffect(() => {
    const onWinMouseMove = (e: globalThis.MouseEvent) => {
      const el = scrollRef.current;
      if (!el || !dragStateRef.current.active) return;
      const dx = e.clientX - dragStateRef.current.startX;
      if (Math.abs(dx) > 4) dragStateRef.current.moved = true;
      let nextLeft = dragStateRef.current.startScrollLeft - dx;
      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (nextLeft >= half) {
          nextLeft -= half;
          dragStateRef.current.startScrollLeft -= half;
        } else if (nextLeft < 0) {
          nextLeft += half;
          dragStateRef.current.startScrollLeft += half;
        }
      }
      el.scrollLeft = nextLeft;
      exactScrollRef.current = nextLeft;
    };

    const onWinMouseUp = () => {
      dragStateRef.current.active = false;
      if (scrollRef.current) exactScrollRef.current = scrollRef.current.scrollLeft;
    };

    window.addEventListener('mousemove', onWinMouseMove);
    window.addEventListener('mouseup', onWinMouseUp);
    return () => {
      window.removeEventListener('mousemove', onWinMouseMove);
      window.removeEventListener('mouseup', onWinMouseUp);
    };
  }, []);

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
      {/* Giant Background Graduation Caps with soft top/bottom fade mask */}
      {isVisible && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-60 dark:opacity-55"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 16%, black 76%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 16%, black 76%, transparent 100%)',
          }}
        >
          {GRADUATION_CAPS.map((cap, idx) => (
            <div
              key={idx}
              className="animate-cap-toss absolute -bottom-28"
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

        {/* Infinite auto-scrolling carousel with mouse drag-to-scroll & touch swipe (no arrow clutter) */}
        <div
          style={{ transitionDelay: '140ms' }}
          className={`reveal-scale relative mt-8 rounded-2xl sm:mt-10 ${
            isVisible ? 'is-visible' : ''
          }`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => window.setTimeout(() => setIsPaused(false), 1800)}
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
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onDragStart={(e) => e.preventDefault()}
            onClickCapture={(e) => {
              if (dragStateRef.current.moved) {
                e.preventDefault();
                e.stopPropagation();
                dragStateRef.current.moved = false;
              }
            }}
            className="flex cursor-grab active:cursor-grabbing select-none gap-4 overflow-x-auto px-2 py-2 sm:gap-5 sm:px-4"
            style={{ scrollbarWidth: 'none' }}
          >
            {trackItems.map((cert, idx) => {
              const realIndex = idx % items.length;
              return (
                <button
                  key={`${cert.id}-${idx}`}
                  type="button"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onClick={() => setSelectedIndex(realIndex)}
                  className="group relative flex w-[220px] shrink-0 flex-col overflow-hidden rounded-2xl border border-zinc-900/10 bg-[#F2EDE6]/95 p-2.5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#B45309]/45 hover:shadow-lg dark:border-white/10 dark:bg-[#16151C]/95 dark:hover:border-[#E2A856]/50 dark:gold-glow-hover sm:w-[255px] lg:w-[275px] cursor-pointer"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-200/70 dark:bg-[#0D0C10]">
                    <img
                      src={cert.imageUrl}
                      alt={cert.title}
                      draggable={false}
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

      {/* Lightbox Modal with Zoom Controls rendered via Portal above all sections */}
      {selected && selectedIndex !== null && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cert-modal-title"
              className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-6"
            >
              <div
                onClick={() => setSelectedIndex(null)}
                className="absolute inset-0 bg-black/82 backdrop-blur-sm"
              />

              <div className="animate-modal-enter relative z-10 flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-[#FAF8F5] p-3.5 shadow-2xl dark:bg-[#16151C] sm:p-6">
                {/* Clean Full-Width Header: Category + Close on top row, full-width title below */}
                <div className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B45309]/10 px-3 py-1 text-xs font-semibold text-[#B45309] dark:bg-[#E2A856]/15 dark:text-[#E2A856]">
                      <Award className="h-3.5 w-3.5" />
                      {selected.category} • {selectedIndex + 1} / {items.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedIndex(null)}
                      aria-label="Закрыть окно просмотра"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-800 transition-colors hover:text-[#B45309] dark:border-white/10 dark:bg-[#0D0C10] dark:text-[#F5F3EF] dark:hover:text-[#E2A856] cursor-pointer"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <h3
                    id="cert-modal-title"
                    className="mt-2.5 font-serif text-base font-semibold leading-snug text-zinc-900 dark:text-[#F5F3EF] sm:text-xl lg:text-2xl"
                  >
                    {selected.title}
                  </h3>
                </div>

                {/* Arrow-free Swipeable & Zoomable Document Viewport */}
                <div
                  className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-zinc-900/5 dark:bg-black/40"
                  onPointerDown={(e) => {
                    if (zoomLevel > 1) return;
                    modalSwipeRef.current = {
                      active: true,
                      startX: e.clientX,
                      startY: e.clientY,
                      swiped: false,
                    };
                  }}
                  onPointerUp={(e) => {
                    if (!modalSwipeRef.current.active || zoomLevel > 1) return;
                    const dx = e.clientX - modalSwipeRef.current.startX;
                    const dy = e.clientY - modalSwipeRef.current.startY;
                    modalSwipeRef.current.active = false;
                    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.15) {
                      modalSwipeRef.current.swiped = true;
                      if (dx < 0) goNext();
                      else goPrev();
                    }
                  }}
                >
                  <div className="custom-scrollbar flex h-full w-full items-center justify-center overflow-auto p-2 touch-pan-x touch-pan-y">
                    <img
                      src={selected.imageUrl}
                      alt={selected.title}
                      draggable={false}
                      onClick={() => {
                        if (modalSwipeRef.current.swiped) {
                          modalSwipeRef.current.swiped = false;
                          return;
                        }
                        setZoomLevel((z) => (z > 1 ? 1 : 1.75));
                      }}
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'center center',
                      }}
                      className={`max-h-[60dvh] w-auto max-w-full select-none rounded-xl object-contain transition-transform duration-200 ${
                        zoomLevel > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'
                      }`}
                    />
                  </div>
                </div>

                {/* Bottom Zoom & Reset Toolbar */}
                <div className="mt-3 flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(1, Number((z - 0.5).toFixed(2))))}
                    disabled={zoomLevel <= 1}
                    aria-label="Уменьшить"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-800 transition-colors hover:text-[#B45309] disabled:opacity-40 dark:border-white/10 dark:bg-[#0D0C10] dark:text-[#F5F3EF] dark:hover:text-[#E2A856] cursor-pointer"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>

                  <span className="min-w-[48px] text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {Math.round(zoomLevel * 100)}%
                  </span>

                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.5).toFixed(2))))}
                    disabled={zoomLevel >= 2.5}
                    aria-label="Увеличить"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-800 transition-colors hover:text-[#B45309] disabled:opacity-40 dark:border-white/10 dark:bg-[#0D0C10] dark:text-[#F5F3EF] dark:hover:text-[#E2A856] cursor-pointer"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    disabled={zoomLevel <= 1}
                    aria-label="Сбросить масштаб"
                    title="Сбросить масштаб"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-800 transition-colors hover:text-[#B45309] disabled:opacity-40 dark:border-white/10 dark:bg-[#0D0C10] dark:text-[#F5F3EF] dark:hover:text-[#E2A856] cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
}
