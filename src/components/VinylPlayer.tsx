import { useEffect, useState } from 'react';

export function VinylPlayer() {
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let frameId = 0;

    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        const currentProgress =
          maxScroll > 0 ? Math.min(100, Math.max(0, (currentY / maxScroll) * 100)) : 0;
        setProgress(currentProgress);
        frameId = 0;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Kinematic tonearm angle:
  // At 0% scroll: 0 deg (needle is on outer groove at R ~ 30)
  // At 100% scroll: 36.8 deg (needle reaches inner groove at R ~ 12, right at center label)
  const armAngle = (progress / 100) * 36.8;
  const isEnd = progress >= 98.5;

  return (
    <aside
      aria-label="Виниловый проигрыватель навигации"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none"
    >
      <div className="relative group">
        {/* Floating progress / scroll-to-top tooltip badge */}
        <div
          className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide transition-all duration-300 pointer-events-none shadow-md ${
            isEnd
              ? 'opacity-100 scale-105 bg-gradient-to-r from-[#B45309] to-[#D97706] text-white shadow-amber-500/30 animate-pulse'
              : isHovered
              ? 'opacity-100 -translate-y-1 bg-zinc-900/90 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
              : 'opacity-75 sm:opacity-90 bg-zinc-900/80 text-zinc-200 dark:bg-zinc-800/90 dark:text-zinc-200'
          }`}
        >
          {isEnd ? (
            <span className="flex items-center gap-1 font-semibold">
              100% • Наверх <span aria-hidden="true">↑</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span>{Math.round(progress)}%</span>
              {isHovered && <span className="text-[10px] opacity-80">• Наверх ↑</span>}
            </span>
          )}
        </div>

        {/* Interactive turntable button */}
        <button
          type="button"
          onClick={handleScrollToTop}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title={isEnd ? 'Конец пластинки. Нажмите, чтобы вернуться наверх' : 'Нажмите, чтобы вернуться наверх'}
          aria-label={`Прокрутка наверх. Пройдено ${Math.round(progress)}%`}
          className={`relative block w-20 h-20 sm:w-24 sm:h-24 p-1.5 rounded-2xl cursor-pointer transition-all duration-300 transform-gpu active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            isEnd
              ? 'ring-2 ring-amber-500/80 shadow-2xl shadow-amber-500/25 scale-105 bg-[#FAF8F5]/95 dark:bg-[#16151B]/95'
              : 'hover:scale-105 shadow-xl hover:shadow-2xl bg-[#FAF8F5]/90 dark:bg-[#141318]/90 backdrop-blur-md border border-zinc-900/10 dark:border-white/10 hover:border-amber-500/40 dark:hover:border-amber-500/50'
          }`}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Center label warm vinyl gradient */}
              <linearGradient id="vinylLabel" x1="31" y1="39" x2="53" y2="61" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="50%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>

              {/* Tonearm metallic brushed silver gradient */}
              <linearGradient id="tonearmSilver" x1="82" y1="20" x2="71" y2="57" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F4F4F5" />
                <stop offset="45%" stopColor="#D4D4D8" />
                <stop offset="85%" stopColor="#A1A1AA" />
                <stop offset="100%" stopColor="#71717A" />
              </linearGradient>

              {/* Vinyl light reflection sheen gradient */}
              <linearGradient id="vinylSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Turntable Platter Outer Strobe Ring */}
            <circle
              cx="42"
              cy="50"
              r="35"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="1.2 1.8"
              className="text-zinc-400/40 dark:text-zinc-600/40"
            />

            {/* Turntable Platter Bed */}
            <circle cx="42" cy="50" r="33.8" fill="#0A0A0C" />

            {/* CONTINUOUSLY SPINNING VINYL RECORD DISC */}
            <g className="animate-vinyl-spin">
              {/* Main Vinyl Disc Body */}
              <circle cx="42" cy="50" r="32.5" fill="#131316" />

              {/* Realistic Concentric Sound Grooves */}
              <circle cx="42" cy="50" r="30.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
              <circle cx="42" cy="50" r="28.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <circle cx="42" cy="50" r="26.5" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
              <circle cx="42" cy="50" r="24.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <circle cx="42" cy="50" r="22.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
              <circle cx="42" cy="50" r="20.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <circle cx="42" cy="50" r="18.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
              <circle cx="42" cy="50" r="16.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <circle cx="42" cy="50" r="14.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
              <circle cx="42" cy="50" r="13" stroke="rgba(255,255,255,0.14)" strokeWidth="0.75" />

              {/* Two Dynamic Vinyl Light Reflection Sheens */}
              <path
                d="M42 50 L20 28 A32.5 32.5 0 0 1 64 28 Z"
                fill="url(#vinylSheen)"
                opacity="0.18"
              />
              <path
                d="M42 50 L64 72 A32.5 32.5 0 0 1 20 72 Z"
                fill="url(#vinylSheen)"
                opacity="0.18"
              />

              {/* "Яблоко" (Vinyl Center Label) */}
              <circle cx="42" cy="50" r="12" fill="url(#vinylLabel)" />
              <circle cx="42" cy="50" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
              <circle cx="42" cy="50" r="5" stroke="rgba(0,0,0,0.25)" strokeWidth="0.4" />

              {/* Center Label Musical Symbol (Treble Clef / Note) */}
              <path
                d="M40.5 53.5 V46.5 C40.5 45.2 41.5 44.5 43.5 44.5 V49 C43.5 48.2 42.8 47.7 42 47.7 C41.2 47.7 40.5 48.3 40.5 49.1 C40.5 49.9 41.2 50.5 42 50.5 C42.8 50.5 43.5 49.9 43.5 49.1 V46"
                fill="#FEF3C7"
                opacity="0.85"
              />

              {/* Spindle hole */}
              <circle cx="42" cy="50" r="2" fill="#0A0A0C" />
              <circle cx="42" cy="50" r="1" fill="#E4E4E7" />
            </g>

            {/* STATIONARY TURNTABLE HARDWARE */}
            {/* Emerald Power Status LED */}
            <circle cx="11" cy="11" r="1.6" fill="#10B981" />
            <circle cx="11" cy="11" r="2.8" fill="#10B981" opacity="0.3" className="animate-pulse" />

            {/* Pitch Speed 33 RPM Label */}
            <text
              x="10"
              y="20"
              fontSize="3.8"
              fill="currentColor"
              fontWeight="600"
              letterSpacing="0.4"
              className="text-zinc-400 dark:text-zinc-500"
            >
              33
            </text>

            {/* Pitch slider track */}
            <line
              x1="9"
              y1="82"
              x2="22"
              y2="82"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinecap="round"
              className="text-zinc-400 dark:text-zinc-600"
            />
            <rect
              x="14"
              y="80.6"
              width="2.6"
              height="2.8"
              rx="0.6"
              fill="currentColor"
              className="text-zinc-500 dark:text-zinc-400"
            />

            {/* Tonearm Base / Gimbal Assembly (Pivot at 82, 20) */}
            <circle cx="82" cy="20" r="6" fill="#3F3F46" stroke="#27272A" strokeWidth="0.8" />
            <circle cx="82" cy="20" r="4.2" fill="#52525B" />
            <circle cx="82" cy="20" r="2.6" fill="#D4D4D8" />
            {/* Counterweight */}
            <rect x="79" y="8" width="6" height="7.5" rx="1.5" fill="#71717A" stroke="#52525B" strokeWidth="0.5" />
            <line x1="79" y1="11.5" x2="85" y2="11.5" stroke="#3F3F46" strokeWidth="0.5" />

            {/* TONEARM (ЗВУКОСНИМАТЕЛЬ) - ROTATES SMOOTHLY BASED ON SCROLL */}
            <g
              style={{
                transformOrigin: '82px 20px',
                transform: `rotate(${armAngle}deg)`,
                transition: 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              {/* Tonearm Tube (Graceful S-curved metallic rod) */}
              <path
                d="M 82 20 C 83.5 32, 75.5 42, 71.4 56.5"
                fill="none"
                stroke="url(#tonearmSilver)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 82 20 C 83.5 32, 75.5 42, 71.4 56.5"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* Headshell / Cartridge body at needle tip */}
              <g transform="translate(71.4, 56.5) rotate(-22)">
                <rect
                  x="-2"
                  y="-1"
                  width="4"
                  height="7"
                  rx="0.8"
                  fill="#18181B"
                  stroke="#A1A1AA"
                  strokeWidth="0.5"
                />
                {/* Finger lift on headshell */}
                <path d="M 2 1 Q 4 1, 4 3" stroke="#A1A1AA" strokeWidth="0.5" fill="none" />
                {/* Stylus / Needle point */}
                <circle cx="0" cy="5.8" r="0.8" fill="#F59E0B" />
                {/* Tiny glowing indicator on cartridge */}
                <circle cx="0" cy="2" r="0.6" fill="#F59E0B" className="animate-pulse" />
              </g>
            </g>
          </svg>
        </button>
      </div>
    </aside>
  );
}

export default VinylPlayer;
