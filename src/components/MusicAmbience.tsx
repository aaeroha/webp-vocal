import { useEffect, useState } from 'react';

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

        {/* LIGHT MODE: Lively, clearly visible dancing musical notes & treble clef */}
        <div className="block dark:hidden">
          <svg
            viewBox="0 0 1440 220"
            fill="none"
            className="animate-wave-flow absolute top-28 left-0 w-full opacity-[0.14] text-[#B45309]"
            style={{ transform: `translateY(${scrollY * -0.04}px)` }}
          >
            <path d="M-40 60 C 320 20, 680 100, 1480 45" stroke="currentColor" strokeWidth="1.2" />
            <path d="M-40 74 C 320 34, 680 114, 1480 59" stroke="currentColor" strokeWidth="1.2" />
            <path d="M-40 88 C 320 48, 680 128, 1480 73" stroke="currentColor" strokeWidth="1.2" />
            <path d="M-40 102 C 320 62, 680 142, 1480 87" stroke="currentColor" strokeWidth="1.2" />
            <path d="M-40 116 C 320 76, 680 156, 1480 101" stroke="currentColor" strokeWidth="1.2" />
          </svg>

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

        {/* DARK MODE: Elegant flowing multi-layer SVG Waveform */}
        <div className="hidden dark:block">
          <svg
            viewBox="0 0 1600 240"
            fill="none"
            preserveAspectRatio="none"
            className="animate-wave-flow absolute top-[34%] -left-[5%] h-48 w-[110%] opacity-25 text-[#E2A856]"
            style={{ transform: `translateY(${scrollY * -0.03}px)` }}
          >
            <defs>
              <linearGradient id="waveGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E2A856" stopOpacity="0" />
                <stop offset="25%" stopColor="#E2A856" stopOpacity="0.65" />
                <stop offset="50%" stopColor="#F5D39A" stopOpacity="0.95" />
                <stop offset="75%" stopColor="#E2A856" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#E2A856" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 120 Q 100 40, 200 120 T 400 120 T 600 120 T 800 120 T 1000 120 T 1200 120 T 1400 120 T 1600 120"
              stroke="url(#waveGoldGrad)"
              strokeWidth="1.6"
            />
            <path
              d="M0 120 Q 100 185, 200 120 T 400 120 T 600 120 T 800 120 T 1000 120 T 1200 120 T 1400 120 T 1600 120"
              stroke="url(#waveGoldGrad)"
              strokeWidth="1.2"
              opacity="0.7"
            />
            <path
              d="M0 120 Q 80 75, 160 120 T 320 120 T 480 120 T 640 120 T 800 120 T 960 120 T 1120 120 T 1280 120 T 1440 120 T 1600 120"
              stroke="url(#waveGoldGrad)"
              strokeWidth="1"
              opacity="0.45"
            />
          </svg>

          <svg
            viewBox="0 0 1600 220"
            fill="none"
            preserveAspectRatio="none"
            className="animate-wave-flow-reverse absolute top-[68%] -left-[5%] h-44 w-[110%] opacity-22 text-[#E2A856]"
            style={{ transform: `translateY(${scrollY * -0.02}px)` }}
          >
            <path
              d="M0 110 C 120 20, 220 200, 340 110 C 460 20, 560 200, 680 110 C 800 20, 900 200, 1020 110 C 1140 20, 1240 200, 1360 110 C 1480 20, 1540 160, 1600 110"
              stroke="url(#waveGoldGrad)"
              strokeWidth="1.5"
            />
            <path
              d="M0 110 C 140 175, 260 45, 400 110 C 540 175, 660 45, 800 110 C 940 175, 1060 45, 1200 110 C 1340 175, 1460 45, 1600 110"
              stroke="url(#waveGoldGrad)"
              strokeWidth="1"
              opacity="0.55"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
