import { useEffect, useState, type CSSProperties } from 'react';

const LIGHT_NOTES = [
  { top: '12%', left: '3%', size: 'w-8 h-8', parallax: -0.08, variant: 'single', reverse: false, delay: '0s' },
  { top: '21%', right: '4%', size: 'w-9 h-9', parallax: -0.06, variant: 'double', reverse: true, delay: '0.4s' },
  { top: '34%', left: '5%', size: 'w-7 h-7', parallax: -0.1, variant: 'double', reverse: false, delay: '0.8s' },
  { top: '45%', right: '3%', size: 'w-10 h-10', parallax: -0.07, variant: 'single', reverse: true, delay: '0.2s' },
  { top: '57%', left: '4%', size: 'w-9 h-9', parallax: -0.09, variant: 'single', reverse: false, delay: '1.1s' },
  { top: '68%', right: '5%', size: 'w-8 h-8', parallax: -0.06, variant: 'double', reverse: true, delay: '0.6s' },
  { top: '79%', left: '6%', size: 'w-7 h-7', parallax: -0.08, variant: 'double', reverse: false, delay: '1.4s' },
  { top: '87%', right: '6%', size: 'w-8 h-8', parallax: -0.05, variant: 'single', reverse: true, delay: '0.3s' },
];

// Symmetric dense vertical audio spectrum bars (mirroring live voice analyzer aesthetic)
const SPECTRUM_BAR_COUNT = 72;
const SPECTRUM_BARS = Array.from({ length: SPECTRUM_BAR_COUNT }, (_, i) => {
  const norm = i / (SPECTRUM_BAR_COUNT - 1);
  const centerDist = Math.abs(norm - 0.5) * 2;
  const bell = Math.exp(-Math.pow(centerDist * 1.45, 2));
  const harmonic = 0.55 + 0.45 * Math.sin(i * 0.72) * Math.cos(i * 0.31);
  const heightPct = Math.max(12, Math.min(96, Math.round((bell * 0.75 + harmonic * 0.25) * 92)));
  const dur = (1.6 + ((i * 7) % 11) * 0.16).toFixed(2);
  const delay = (-((i * 0.19) % 2.4)).toFixed(2);
  return { heightPct, dur: `${dur}s`, delay: `${delay}s` };
});

function AmbientSpectrumBand({
  topClass,
  opacityClass,
  parallaxY,
}: {
  topClass: string;
  opacityClass: string;
  parallaxY: number;
}) {
  return (
    <div
      className={`absolute ${topClass} left-0 right-0 flex h-36 sm:h-44 items-center justify-center px-2 ${opacityClass}`}
      style={{ transform: `translateY(${parallaxY}px)` }}
    >
      {/* Glowing horizontal axis line */}
      <div className="absolute inset-x-4 top-1/2 h-[1.5px] -translate-y-1/2 bg-gradient-to-r from-transparent via-teal-400/70 to-transparent shadow-[0_0_12px_rgba(45,212,191,0.55)] dark:via-[#2DD4BF]/80" />

      {/* Dense mirrored vertical equalizer bars */}
      <div className="relative flex h-full w-full max-w-[1440px] items-center justify-between gap-[2px] sm:gap-[3px]">
        {SPECTRUM_BARS.map((bar, idx) => (
          <div key={idx} className="flex h-full flex-1 items-center justify-center">
            <span
              className="animate-spectrum-bar block w-[2px] sm:w-[2.5px] rounded-full bg-gradient-to-b from-[#B45309]/10 via-[#0EA5E9]/70 to-[#B45309]/10 dark:from-[#2DD4BF]/10 dark:via-[#2DD4BF]/85 dark:to-[#2DD4BF]/10"
              style={
                {
                  height: `${bar.heightPct}%`,
                  animationDuration: bar.dur,
                  animationDelay: bar.delay,
                  '--spec-min': 0.28,
                  '--spec-max': 1.05,
                } as CSSProperties
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MusicAmbience() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        frameId = 0;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      {/* Background ambience layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      >
        {/* Soft ambient radial glow */}
        <div className="absolute -top-32 right-[10%] h-[420px] w-[420px] rounded-full bg-[#C26D3A]/[0.06] blur-3xl dark:bg-[#E2A856]/[0.08]" />
        <div className="absolute top-[45%] -left-32 h-[380px] w-[380px] rounded-full bg-[#B45309]/[0.05] blur-3xl dark:bg-[#E2A856]/[0.06]" />

        {/* Mirrored vertical audio spectrum visualizers (matching voice test equalizer aesthetic) */}
        <AmbientSpectrumBand
          topClass="top-[24%]"
          opacityClass="opacity-[0.18] dark:opacity-[0.26]"
          parallaxY={scrollY * -0.03}
        />
        <AmbientSpectrumBand
          topClass="top-[66%]"
          opacityClass="opacity-[0.15] dark:opacity-[0.22]"
          parallaxY={scrollY * -0.02}
        />

        {/* LIGHT MODE: Lively dancing musical notes & treble clef */}
        <div className="block dark:hidden">
          <svg
            viewBox="0 0 120 240"
            fill="none"
            className="animate-float-note hidden lg:block absolute top-40 right-12 w-24 opacity-[0.18] text-[#B45309]"
            style={{ transform: `translateY(${scrollY * 0.06}px)` }}
          >
            <path
              d="M62 215 C 40 215, 28 198, 35 182 C 42 167, 63 172, 63 188 C 63 198, 53 203, 47 200 M62 215 C 76 215, 80 198, 76 175 L 57 42 C 55 24, 69 14, 78 24 C 87 34, 77 56, 56 76 C 32 98, 22 122, 34 146 C 46 169, 82 168, 92 142 C 100 121, 84 101, 63 105 C 46 108, 41 126, 52 138"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>

          {LIGHT_NOTES.map((note, index) => (
            <div
              key={index}
              className="absolute text-[#B45309]/55 drop-shadow-[0_2px_6px_rgba(180,83,9,0.18)]"
              style={{
                top: note.top,
                left: note.left,
                right: note.right,
                transform: `translateY(${scrollY * note.parallax}px)`,
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
    </>
  );
}
