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

  const roundedPercent = Math.round(progress);
  const isVisible = roundedPercent >= 10;

  // Vertical 10-LED VU Meter (10% to 100%)
  const ledCount = 10;
  const litLeds = Math.min(
    ledCount,
    roundedPercent >= 98.5 ? ledCount : Math.floor(progress / 10)
  );
  const allLedsLit = litLeds === ledCount;

  // Exact calibrated tonearm kinematics:
  // Record center (50, 55), Pivot (100, 21), distance Pivot->Center = 60.465
  // Stylus sits at (88, 63.8) at 0 deg -> R = 39.0 (exact outer edge of vinyl track!)
  // Rotating 35.5 deg clockwise brings stylus to R = 17.5 (cleanly outside the 15.5 orange label!)
  // Normalized from 10%..100% scroll so at 10% it sits right on the outer groove edge.
  const trackProgress = Math.max(0, Math.min(1, (progress - 10) / 90));
  const armAngle = trackProgress * 35.5;

  return (
    <aside
      aria-label="Виниловый Hi-Fi проигрыватель навигации"
      className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-40 select-none flex flex-col items-center gap-1 sm:gap-1.5 transition-all duration-500 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-8 opacity-0 pointer-events-none'
      }`}
    >
      {/* Centered "НАВЕРХ ↑" Display Pill directly above center of turntable */}
      <button
        type="button"
        onClick={handleScrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Наверх. Прокручено ${roundedPercent}%`}
        className={`relative flex items-center justify-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-bold tracking-wider shadow-lg transition-all duration-300 cursor-pointer focus:outline-none ${
          allLedsLit || isHovered
            ? 'opacity-100 translate-y-0 border-amber-400/90 bg-[#0A090E] text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.48)]'
            : 'opacity-0 translate-y-1 pointer-events-none border-transparent'
        } ${allLedsLit ? 'animate-pulse' : ''}`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${
            allLedsLit ? 'bg-emerald-400 shadow-[0_0_6px_#34D399]' : 'bg-amber-400'
          }`}
        />
        <span>НАВЕРХ ↑</span>
      </button>

      {/* Large Hi-Fi Turntable with Right-Side Vertical VU Scale & Built-In Bottom % Readout */}
      <button
        type="button"
        onClick={handleScrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={
          allLedsLit
            ? 'Все индикаторы горят — нажмите, чтобы вернуться наверх'
            : 'Нажмите, чтобы вернуться наверх'
        }
        aria-label={`Прокрутка наверх. Пройдено ${roundedPercent}%`}
        className={`group relative block w-[104px] h-[84px] sm:w-[196px] sm:h-[158px] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 transform-gpu active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
          allLedsLit
            ? 'ring-2 ring-amber-500/95 shadow-2xl shadow-amber-500/40 scale-105 bg-[#121216] border border-amber-500/55 dark:bg-[#F5F0E6] dark:border-amber-600/65'
            : 'hover:scale-105 shadow-2xl bg-[#121216]/95 border border-white/15 hover:border-amber-500/60 dark:bg-[#F5F0E6]/95 dark:border-[#B45309]/30 dark:hover:border-[#B45309]/75'
        }`}
      >
        <svg
          viewBox="0 0 140 112"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vinylLabelVu" x1="34" y1="39" x2="66" y2="71" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E2A856" />
              <stop offset="50%" stopColor="#C26D3A" />
              <stop offset="100%" stopColor="#7C2D12" />
            </linearGradient>

            <linearGradient id="tonearmChromeVu" x1="100" y1="21" x2="88" y2="63.8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F4F4F5" />
              <stop offset="50%" stopColor="#A1A1AA" />
              <stop offset="100%" stopColor="#71717A" />
            </linearGradient>

            <linearGradient id="vinylSheenVu" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Hi-Fi Strobe Platter Rim */}
          <circle
            cx="50"
            cy="55"
            r="46"
            fill="#1D1D22"
            stroke="#52525B"
            strokeWidth="1"
            className="dark:fill-[#DED7C7] dark:stroke-[#A89F91]"
          />
          <circle
            cx="50"
            cy="55"
            r="44.2"
            stroke="#A1A1AA"
            strokeWidth="1.2"
            strokeDasharray="1.1 2.2"
            opacity="0.65"
            className="dark:stroke-[#78716C]"
          />

          <circle cx="50" cy="55" r="42.5" fill="#09090B" />

          {/* LARGE SPINNING VINYL DISC */}
          <g className="animate-vinyl-spin">
            <circle cx="50" cy="55" r="41.5" fill="#131317" />

            <circle cx="50" cy="55" r="39" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
            <circle cx="50" cy="55" r="36.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <circle cx="50" cy="55" r="34" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
            <circle cx="50" cy="55" r="31.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <circle cx="50" cy="55" r="29" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
            <circle cx="50" cy="55" r="26.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <circle cx="50" cy="55" r="24" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
            <circle cx="50" cy="55" r="21.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <circle cx="50" cy="55" r="19" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
            <circle cx="50" cy="55" r="17" stroke="rgba(255,255,255,0.16)" strokeWidth="0.6" />

            <path d="M50 55 L20 25 A41.5 41.5 0 0 1 80 25 Z" fill="url(#vinylSheenVu)" opacity="0.2" />
            <path d="M50 55 L80 85 A41.5 41.5 0 0 1 20 85 Z" fill="url(#vinylSheenVu)" opacity="0.2" />

            <circle cx="50" cy="55" r="15.5" fill="url(#vinylLabelVu)" />
            <circle cx="50" cy="55" r="13.2" stroke="rgba(255,255,255,0.25)" strokeWidth="0.45" />

            <path
              d="M48.2 59.5 V50.8 C48.2 49.2 49.5 48.2 52.2 48.2 V53.8 C52.2 52.8 51.2 52.2 50.1 52.2 C49 52.2 48.2 53 48.2 54.1 C48.2 55.2 49 55.9 50.1 55.9 C51.2 55.9 52.2 55.2 52.2 54.1 V50"
              fill="#FEF3C7"
              opacity="0.92"
            />

            <circle cx="50" cy="55" r="2.5" fill="#09090B" />
            <circle cx="50" cy="55" r="1.3" fill="#E4E4E7" />
          </g>

          {/* Power LED Top-Left */}
          <circle cx="8" cy="10" r="1.8" fill="#10B981" />
          <circle cx="8" cy="10" r="3.4" fill="#10B981" opacity="0.28" className="animate-pulse" />

          {/* RIGHT-SIDE VERTICAL 10-LED VU LEVEL SCALE */}
          <rect
            x="118"
            y="8"
            width="14"
            height="79"
            rx="3.5"
            fill="#0A0A0E"
            stroke="#3F3F46"
            strokeWidth="0.8"
            className="dark:fill-[#1C1917] dark:stroke-[#A89F91]"
          />
          {Array.from({ length: ledCount }).map((_, idx) => {
            const isLit = idx < litLeds;
            const yPos = 77.5 - idx * 7.2;
            const activeColor =
              idx >= 8 ? '#EF4444' : idx >= 6 ? '#F59E0B' : '#10B981';
            return (
              <rect
                key={idx}
                x="120.8"
                y={yPos}
                width="8.4"
                height="4.6"
                rx="1.1"
                fill={isLit ? activeColor : '#27272A'}
                opacity={isLit ? 1 : 0.45}
              />
            );
          })}

          {/* INTEGRATED % DIGITAL READOUT RIGHT NEXT TO / BELOW VU SCALE */}
          <rect
            x="105"
            y="91"
            width="30"
            height="14"
            rx="3"
            fill="#09090B"
            stroke={allLedsLit ? '#F59E0B' : '#3F3F46'}
            strokeWidth="0.8"
            className="dark:fill-[#1C1917]"
          />
          <text
            x="120"
            y="101"
            textAnchor="middle"
            fontSize="7.4"
            fontFamily="monospace"
            fontWeight="700"
            fill={allLedsLit ? '#FACC15' : '#E2A856'}
          >
            {roundedPercent}%
          </text>

          {/* Tonearm Gimbal Pivot & Counterweight */}
          <circle
            cx="100"
            cy="21"
            r="8.2"
            fill="#27272A"
            stroke="#52525B"
            strokeWidth="0.8"
            className="dark:fill-[#DED7C7] dark:stroke-[#A89F91]"
          />
          <circle cx="100" cy="21" r="4.6" fill="#52525B" className="dark:fill-[#A89F91]" />
          <circle cx="100" cy="21" r="2.5" fill="#E4E4E7" className="dark:fill-zinc-700" />
          <rect
            x="96.5"
            y="6"
            width="7"
            height="8.8"
            rx="1.8"
            fill="#71717A"
            stroke="#3F3F46"
            strokeWidth="0.6"
            className="dark:fill-zinc-600 dark:stroke-zinc-800"
          />

          {/* CALIBRATED TONEARM (starts at outer vinyl rim R=39, stops cleanly at R=17.5 outside label) */}
          <g
            style={{
              transformOrigin: '100px 21px',
              transform: `rotate(${armAngle}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <path
              d="M 100 21 C 101 32, 94.5 44, 89.5 57.5"
              fill="none"
              stroke="url(#tonearmChromeVu)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M 100 21 C 101 32, 94.5 44, 89.5 57.5"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* Headshell ending cleanly so needle point lands right at (88, 63.8) */}
            <g transform="translate(89.5, 57.5) rotate(-14)">
              <rect
                x="-2.3"
                y="-1"
                width="4.6"
                height="7.5"
                rx="1"
                fill="#18181B"
                stroke="#D4D4D8"
                strokeWidth="0.7"
              />
              {/* Stylus tip */}
              <circle cx="0" cy="6.2" r="1.05" fill="#F59E0B" />
              <circle cx="0" cy="2.4" r="0.75" fill="#F59E0B" className="animate-pulse" />
            </g>
          </g>
        </svg>
      </button>
    </aside>
  );
}

export default VinylPlayer;
