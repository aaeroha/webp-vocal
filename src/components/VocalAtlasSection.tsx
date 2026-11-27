import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AudioWaveform } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const VocalAtlas3D = lazy(() => import('./VocalAtlas3D'));

/**
 * Interactive 3D Vocal Apparatus & Resonator Atlas wrapper.
 * Mounts Three.js only when scrolled near the section so initial Hero load stays instant.
 */
export function VocalAtlasSection() {
  const { ref, isVisible } = useReveal({ threshold: 0.05 });
  const mountTriggerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad3D, setShouldLoad3D] = useState(false);

  useEffect(() => {
    const el = mountTriggerRef.current;
    if (!el || shouldLoad3D) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad3D(true);
          io.disconnect();
        }
      },
      { rootMargin: '420px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldLoad3D]);

  return (
    <section
      id="vocal-atlas"
      ref={mountTriggerRef}
      className="relative z-10 py-14 sm:py-20 lg:py-24"
    >
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`reveal-scale rounded-3xl border border-zinc-900/10 bg-[#F2EDE6]/92 p-5 dark:border-white/10 dark:bg-[#16151C]/95 sm:p-8 lg:p-10 ${
            isVisible ? 'is-visible' : ''
          }`}
        >
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
              <AudioWaveform className="h-3.5 w-3.5" />
              Вокальная механика и фонопедия в 3D
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-4xl lg:text-[2.85rem]">
              Интерактивный 3D-атлас резонаторов голоса
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
              Вместо непонятных советов «пой в голову» или «на опору» — посмотрите на 3D-модели, как работают складки и какие полости включаются при каждом приёме.
            </p>
          </div>

          {shouldLoad3D ? (
            <Suspense
              fallback={
                <div className="mt-8 flex min-h-[420px] items-center justify-center rounded-3xl border border-zinc-900/10 bg-[#0D0C10]/90 text-sm text-zinc-400">
                  Загрузка 3D-модели вокального аппарата...
                </div>
              }
            >
              <VocalAtlas3D />
            </Suspense>
          ) : (
            <div className="mt-8 min-h-[420px] rounded-3xl border border-zinc-900/10 bg-[#0D0C10]/85" />
          )}
        </div>
      </div>
    </section>
  );
}
