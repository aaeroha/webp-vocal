import { useEffect, useRef } from 'react';

const LIGHT_NOTES = [
  { top: '18%', left: '3%', size: 'w-8 h-8', variant: 'single', reverse: false, delay: '0s' },
  { top: '31%', right: '4%', size: 'w-9 h-9', variant: 'double', reverse: true, delay: '0.4s' },
  { top: '44%', left: '5%', size: 'w-7 h-7', variant: 'double', reverse: false, delay: '0.8s' },
  { top: '57%', right: '3%', size: 'w-10 h-10', variant: 'single', reverse: true, delay: '0.2s' },
  { top: '70%', left: '4%', size: 'w-9 h-9', variant: 'single', reverse: false, delay: '1.1s' },
  { top: '82%', right: '5%', size: 'w-8 h-8', variant: 'double', reverse: true, delay: '0.6s' },
];

/**
 * High-performance ambient backdrop:
 * - Thin, dense (152 bars), tall singing spectrum in warm studio gold/amber
 * - Appears after Hero (#top) and settles right in the gap between
 *   #formats ("Как проходят занятия") and #vocal-piano ("Интерактивный тренажёр").
 */
export function MusicAmbience() {
  const waveTrackRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const waveEl = waveTrackRef.current;
    const canvas = canvasRef.current;
    if (!waveEl || !canvas) return;

    let rafId = 0;
    let isDrawingActive = true;
    let minDocY = 860;
    let maxDocY = 2000;

    const recalcBounds = () => {
      const heroEl = document.getElementById('top');
      const formatsEl = document.getElementById('formats');
      const pianoEl = document.getElementById('vocal-piano');
      const vh = window.innerHeight || 800;

      const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : vh;
      minDocY = Math.round(heroBottom + Math.max(40, vh * 0.08));

      if (formatsEl && pianoEl) {
        const formatsBottom = formatsEl.offsetTop + formatsEl.offsetHeight;
        const pianoTop = pianoEl.offsetTop;
        maxDocY = Math.max(minDocY, Math.round((formatsBottom + pianoTop) / 2));
      } else {
        maxDocY = Math.max(minDocY, Math.round(heroBottom + vh * 1.4));
      }
    };

    const updateWavePosition = () => {
      recalcBounds();
      const targetDocY = window.scrollY + window.innerHeight * 0.5;
      const clampedY = Math.max(minDocY, Math.min(maxDocY, targetDocY));
      waveEl.style.transform = `translate3d(0, ${clampedY}px, 0)`;

      const distFromViewportCenter = Math.abs(clampedY - (window.scrollY + window.innerHeight * 0.5));
      const inViewRange = distFromViewportCenter < window.innerHeight * 0.9;
      waveEl.style.opacity = window.scrollY < 160 ? '0' : '1';
      isDrawingActive = inViewRange;
    };

    recalcBounds();
    updateWavePosition();

    let scrollScheduled = false;
    const onScrollOrResize = () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      window.requestAnimationFrame(() => {
        updateWavePosition();
        scrollScheduled = false;
      });
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    const ctx = canvas.getContext('2d');
    const barCount = 152;
    let t = 0;
    let lastDraw = 0;

    const drawSingingWave = (now: number) => {
      rafId = window.requestAnimationFrame(drawSingingWave);
      if (!isDrawingActive || !ctx || now - lastDraw < 32) return;
      lastDraw = now;

      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;
      const isDark = document.documentElement.classList.contains('dark');

      ctx.clearRect(0, 0, width, height);
      t += 0.062;

      // Dynamic vocal phrase breath + vibrato envelope reaching taller vertical peaks
      const phraseBreath = 0.72 + 0.34 * Math.sin(t * 0.58) + 0.14 * Math.sin(t * 1.6);
      const step = width / barCount;
      const barWidth = Math.max(1.8, step * 0.36);

      const axisGrad = ctx.createLinearGradient(0, 0, width, 0);
      axisGrad.addColorStop(0, 'rgba(226, 168, 86, 0)');
      axisGrad.addColorStop(
        0.5,
        isDark ? 'rgba(250, 204, 21, 0.52)' : 'rgba(180, 83, 9, 0.38)'
      );
      axisGrad.addColorStop(1, 'rgba(226, 168, 86, 0)');

      ctx.strokeStyle = axisGrad;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();

      for (let i = 0; i < barCount; i++) {
        const norm = i / (barCount - 1);
        const distFromCenter = Math.abs(norm - 0.5) * 2;
        const bell = Math.exp(-Math.pow(distFromCenter * 1.28, 2));
        const vowelWave =
          0.54 +
          0.34 * Math.sin(i * 0.24 - t * 2.2) +
          0.22 * Math.cos(i * 0.62 + t * 3.15);
        const vibrato = 1 + 0.12 * Math.sin(t * 6.8 + i * 0.11);

        const amp = Math.min(1, Math.max(0.04, bell * vowelWave * phraseBreath * vibrato));
        const halfH = Math.max(3, amp * (height * 0.485));
        const x = i * step + (step - barWidth) * 0.5;

        const barGrad = ctx.createLinearGradient(0, midY - halfH, 0, midY + halfH);
        if (isDark) {
          barGrad.addColorStop(0, 'rgba(226, 168, 86, 0.04)');
          barGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.88)');
          barGrad.addColorStop(1, 'rgba(226, 168, 86, 0.04)');
        } else {
          barGrad.addColorStop(0, 'rgba(180, 83, 9, 0.04)');
          barGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.74)');
          barGrad.addColorStop(1, 'rgba(180, 83, 9, 0.04)');
        }

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(x, midY - halfH, barWidth, halfH * 2, barWidth / 2);
        ctx.fill();
      }
    };

    rafId = window.requestAnimationFrame(drawSingingWave);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      {/* Ambient glows */}
      <div className="fixed -top-32 right-[10%] h-[420px] w-[420px] rounded-full bg-[#C26D3A]/[0.05] blur-3xl dark:bg-[#E2A856]/[0.07]" />
      <div className="fixed top-[45%] -left-32 h-[380px] w-[380px] rounded-full bg-[#B45309]/[0.04] blur-3xl dark:bg-[#E2A856]/[0.05]" />

      {/* Single Large Dense Thin Singing Spectrum Wave (stops cleanly between Formats & VocalPiano) */}
      <div
        ref={waveTrackRef}
        className="absolute left-0 right-0 top-0 -mt-44 flex items-center justify-center px-2 transition-opacity duration-500"
        style={{ willChange: 'transform', opacity: 0 }}
      >
        <canvas
          ref={canvasRef}
          width={1400}
          height={400}
          className="h-72 w-full max-w-[1440px] opacity-38 dark:opacity-45 sm:h-96"
        />
      </div>

      {/* LIGHT MODE: Subtle dancing musical notes below Hero */}
      <div className="block dark:hidden">
        {LIGHT_NOTES.map((note, index) => (
          <div
            key={index}
            className="absolute text-[#B45309]/45"
            style={{
              top: note.top,
              left: note.left,
              right: note.right,
            }}
          >
            <svg
              className={`${note.size} ${note.reverse ? 'animate-float-note-reverse' : 'animate-float-note'}`}
              style={{ animationDelay: note.delay }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {note.variant === 'single' ? (
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              ) : (
                <path d="M21 3v12.5a3.5 3.5 0 1 1-2-3.16V6.4l-9 2.25v8.85a3.5 3.5 0 1 1-2-3.16V6l13-3z" />
              )}
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
