import { useEffect, useRef, useState } from 'react';
import { CalendarCheck, ChevronDown } from 'lucide-react';
import { HERO_CONTENT, STATS_CONTENT, type StatCounter } from '../data/content';
import { useReveal } from '../hooks/useReveal';

interface HeroProps {
  onOpenBooking: () => void;
}

function formatStatNumber(val: number, formatSpaces?: boolean) {
  if (!formatSpaces) return String(val);
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function AnimatedStatCard({
  item,
  start,
  delayMs,
}: {
  item: StatCounter;
  start: boolean;
  delayMs: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!start) {
      setDisplayValue(0);
      return;
    }

    let frameId = 0;
    const duration = 1600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(item.value * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [start, item.value]);

  return (
    <div
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`reveal-scale flex flex-col items-center justify-center rounded-2xl border border-zinc-900/10 bg-[#F2EDE6]/92 px-4 py-5 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#B45309]/40 dark:border-white/12 dark:bg-[#16151C]/92 dark:hover:border-[#E2A856]/45 dark:gold-glow-hover sm:px-5 sm:py-6 ${
        start ? 'is-visible' : ''
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-center gap-x-1.5 text-[#B45309] dark:text-[#E2A856]">
        <span className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {formatStatNumber(displayValue, item.formatSpaces)}
          {item.suffix ?? ''}
        </span>
        <span className="font-serif text-xl font-semibold sm:text-2xl">
          {item.unit}
        </span>
      </div>
      <p className="mt-2 max-w-[210px] text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-sm">
        {item.label}
      </p>
    </div>
  );
}

export function Hero({ onOpenBooking }: HeroProps) {
  const { ref: heroRef, isVisible: heroVisible } = useReveal({ threshold: 0.08 });
  const { ref: statsRef, isVisible: statsVisible } = useReveal({
    threshold: 0.22,
    rootMargin: '0px 0px -60px 0px',
  });

  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mobileLiftRef = useRef<HTMLDivElement | null>(null);

  // On mobile (< 768px), text starts below the video so the video stays unobstructed;
  // as the user scrolls down, the text & stats block smoothly glides upward into place.
  useEffect(() => {
    let rafId = 0;
    const updateLift = () => {
      rafId = 0;
      const el = mobileLiftRef.current;
      if (!el) return;
      if (window.innerWidth >= 768) {
        el.style.transform = '';
        return;
      }
      const lift = Math.min(200, Math.max(0, window.scrollY * 0.9));
      el.style.transform = `translate3d(0, -${lift.toFixed(1)}px, 0)`;
    };

    const onScrollOrResize = () => {
      if (!rafId) rafId = window.requestAnimationFrame(updateLift);
    };

    updateLift();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    const vid = videoRef.current;
    vid.muted = true;
    const attemptPlay = () => {
      vid.play().catch(() => {
        // Autoplay policy fallback handled silently
      });
    };
    const onReady = () => {
      setVideoReady(true);
      attemptPlay();
    };
    // Slight delay lets initial paint & fonts settle before decoding WebM background video
    const startTimer = window.setTimeout(() => {
      if (vid.readyState >= 3) {
        onReady();
      } else {
        vid.load();
      }
    }, 350);
    vid.addEventListener('loadeddata', onReady);
    vid.addEventListener('canplaythrough', onReady);
    vid.addEventListener('playing', onReady);
    return () => {
      window.clearTimeout(startTimer);
      vid.removeEventListener('loadeddata', onReady);
      vid.removeEventListener('canplaythrough', onReady);
      vid.removeEventListener('playing', onReady);
    };
  }, []);

  // H1 cycling typewriter
  const phrases = HERO_CONTENT.typewriterPhrases;
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(phrases[0].length);
  const [isDeleting, setIsDeleting] = useState(false);

  // Subtitle one-shot typewriter that resets whenever user leaves Hero & scrolls back
  const fullSubtitle = HERO_CONTENT.subtitle;
  const [subCount, setSubCount] = useState(0);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting && charCount === currentPhrase.length) {
      const pauseTimer = window.setTimeout(() => setIsDeleting(true), 2100);
      return () => window.clearTimeout(pauseTimer);
    }

    if (isDeleting && charCount === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
      return;
    }

    const speed = isDeleting ? 45 : 85;
    const timer = window.setTimeout(() => {
      setCharCount((prev) => prev + (isDeleting ? -1 : 1));
    }, speed);

    return () => window.clearTimeout(timer);
  }, [charCount, isDeleting, phraseIndex, phrases]);

  useEffect(() => {
    if (!heroVisible) {
      setSubCount(0);
      return;
    }

    if (subCount >= fullSubtitle.length) return;

    const timer = window.setTimeout(() => {
      setSubCount((prev) => Math.min(fullSubtitle.length, prev + 2));
    }, 16);

    return () => window.clearTimeout(timer);
  }, [heroVisible, subCount, fullSubtitle.length]);

  const typedText = phrases[phraseIndex].slice(0, charCount);
  const typedSubtitle = fullSubtitle.slice(0, subCount);
  const isSubtitleTyping = heroVisible && subCount < fullSubtitle.length;

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative z-10 overflow-hidden pt-[265px] pb-6 sm:pt-[330px] sm:pb-10 md:pt-14 md:pb-18 lg:pt-20 lg:pb-24"
    >
      {/* Instant LCP Poster Image + Progressive Ambient Video (unobstructed & centered on mobile, full-bleed on desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[270px] overflow-hidden sm:h-[340px] md:inset-0 md:h-full"
      >
        <div className="relative h-full w-full opacity-82 dark:opacity-85 md:opacity-72 md:dark:opacity-78">
          <img
            src={HERO_CONTENT.posterUrl}
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            className={`h-full w-full object-cover object-center md:object-[50%_14%] transition-opacity duration-500 ${
              videoReady ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            src={HERO_CONTENT.videoUrl}
            className={`absolute inset-0 h-full w-full object-cover object-center md:object-[50%_14%] transition-opacity duration-700 ${
              videoReady ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/20 via-[#FAF8F5]/25 to-[#FAF8F5] dark:from-[#0D0C10]/25 dark:via-[#0D0C10]/25 dark:to-[#0D0C10] md:from-[#FAF8F5]/55 md:via-[#FAF8F5]/38 dark:md:from-[#0D0C10]/55 dark:md:via-[#0D0C10]/35" />
      </div>

      <div
        ref={mobileLiftRef}
        className="relative z-10 mx-auto max-w-7xl px-4 will-change-transform sm:px-6 lg:px-8"
      >
        <div className="max-w-3xl">
          <h1 className="font-serif text-[2.4rem] leading-[1.08] font-semibold tracking-tight text-zinc-950 drop-shadow-[0_1px_10px_rgba(250,248,245,0.65)] dark:text-[#F5F3EF] dark:drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)] min-h-[5.4rem] sm:min-h-[3.8rem] sm:text-5xl lg:min-h-[4.6rem] lg:text-[4rem]">
            <span>{typedText}</span>
            <span
              aria-hidden="true"
              className="animate-caret ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.06em] rounded-full bg-[#B45309] dark:bg-[#E2A856]"
            />
          </h1>

          {/* Subtitle with height-reserved typewriter effect */}
          <div className="relative mt-4 max-w-2xl rounded-2xl bg-[#FAF8F5]/72 p-4 text-[15px] leading-[1.65] text-zinc-800 backdrop-blur-xs dark:bg-[#0D0C10]/62 dark:text-zinc-100 sm:p-5 sm:text-base lg:text-[1.0625rem]">
            <p aria-hidden="true" className="invisible select-none">
              {fullSubtitle}
            </p>
            <p className="absolute inset-0 p-4 sm:p-5">
              <span>{typedSubtitle}</span>
              {isSubtitleTyping && (
                <span
                  aria-hidden="true"
                  className="animate-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.12em] bg-[#B45309] dark:bg-[#E2A856]"
                />
              )}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={onOpenBooking}
              className="btn-sheen inline-flex items-center justify-center gap-2.5 rounded-full bg-[#B45309] px-7 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#EBB86E] dark:gold-glow cursor-pointer"
            >
              <CalendarCheck className="h-4.5 w-4.5 shrink-0" />
              <span>{HERO_CONTENT.primaryCta}</span>
            </button>

            <a
              href="#formats"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-900/15 bg-[#FAF8F5]/90 px-6 py-3.5 text-[15px] font-semibold text-zinc-900 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B45309]/40 hover:text-[#B45309] dark:border-white/20 dark:bg-[#16151C]/88 dark:text-[#F5F3EF] dark:hover:border-[#E2A856]/50 dark:hover:text-[#E2A856]"
            >
              <span>Как проходят уроки</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-75" />
            </a>
          </div>
        </div>

        {/* О моей работе в цифрах — restarts counting every time user returns */}
        <div ref={statsRef} className="mt-12 md:mt-32 lg:mt-52 xl:mt-64">
          <p
            className={`reveal-item mb-5 text-center text-[13px] font-semibold uppercase tracking-[0.2em] text-[#B45309] dark:text-[#E2A856] ${
              statsVisible ? 'is-visible' : ''
            }`}
          >
            {STATS_CONTENT.eyebrow}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {STATS_CONTENT.items.map((item, idx) => (
              <AnimatedStatCard
                key={item.id}
                item={item}
                start={statsVisible}
                delayMs={idx * 90}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
