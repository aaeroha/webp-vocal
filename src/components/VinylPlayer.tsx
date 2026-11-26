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

  // Tonearm kinematics (record center 50,55; pivot 100,21)
  const armAngle = (progress / 100) * 39.5;

  return (
    <aside
      aria-label="Виниловый Hi-Fi проигрыватель навигации"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none flex flex-col items-end gap-1.5 transition-all duration-500 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-8 opacity-0 pointer-events-none'
      }`}
    >
      {/* Isolated Hi-Fi Mini Digital OLED Display neatly aligned above the turntable */}
      <button
        type="button"
        onClick={handleScrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Прокручено ${roundedPercent}%. Нажмите, чтобы вернуться наверх`}
        className={`relative flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] sm:text-xs font-bold tracking-widest shadow-inner transition-all duration-300 cursor-pointer focus:outline-none ${
          allLedsLit
            ? 'border-amber-400/90 bg-[#0A090E] text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.5)] animate-pulse'
            : 'border-zinc-700/90 bg-[#0D0C10]/95 text-amber-400 shadow-[0_4px_12px_rgba(0,0,0,0.45)] dark:border-[#B45309]/45 dark:bg-[#1B1920]'
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${
            allLedsLit ? 'bg-emerald-400 shadow-[0_0_6px_#34D399]' : 'bg-amber-400/85'
          }`}
        />
        <span className="tabular-nums">
          {String(roundedPercent).padStart(2, '0')}%
        </span>
        {(allLedsLit || isHovered) && (
          <span className="text-[10px] font-sans font-semibold tracking-normal text-amber-200 whitespace-nowrap">
            • НАВЕРХ ↑
          </span>
        )}
      </button>

      {/* Large Hi-Fi Turntable with Right-Side Vertical 10-LED VU Level Scale */}
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
        aria-label={`Прокрутка наверх. Заполнено ${litLeds} из 10 индикаторов`}
        className={`group relative block w-[136px] h-[112px] sm:w-[184px] sm:h-[152px] p-1.5 rounded-2xl cursor-pointer transition-all duration-300 transform-gpu active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
          allLedsLit
            ? 'ring-2 ring-amber-500/95 shadow-2xl shadow-amber-500/40 scale-105 bg-[#121216] border border-amber-500/55 dark:bg-[#F5F0E6] dark:border-amber-600/65'
            : 'hover:scale-105 shadow-2xl bg-[#121216]/95 border border-white/15 hover:border-amber-500/60 dark:bg-[#F5F0E6]/95 dark:border-[#B45309]/30 dark:hover:border-[#B45309]/75'
        }`}
      >
        <svg
          viewBox="0 0 134 110"
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

            <linearGradient id="tonearmChromeVu" x1="100" y1="21" x2="85" y2="64.5" gradientUnits="userSpaceOnUse">
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
            x="116"
            y="10"
            width="12"
            height="90"
            rx="3.5"
            fill="#0A0A0E"
            stroke="#3F3F46"
            strokeWidth="0.8"
            className="dark:fill-[#1C1917] dark:stroke-[#A89F91]"
          />
          {Array.from({ length: ledCount }).map((_, idx) => {
            // Segment 0 is bottom (10%), segment 9 is top (100%)
            const isLit = idx < litLeds;
            const yPos = 89 - idx * 8.2;
            const activeColor =
              idx >= 8 ? '#EF4444' : idx >= 6 ? '#F59E0B' : '#10B981';
            return (
              <rect
                key={idx}
                x="118.6"
                y={yPos}
                width="6.8"
                height="5.2"
                rx="1.2"
                fill={isLit ? activeColor : '#27272A'}
                opacity={isLit ? 1 : 0.45}
              />
            );
          })}

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

          {/* TONEARM */}
          <g
            style={{
              transformOrigin: '100px 21px',
              transform: `rotate(${armAngle}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <path
              d="M 100 21 C 101.5 34, 93 47, 85 64.5"
              fill="none"
              stroke="url(#tonearmChromeVu)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 100 21 C 101.5 34, 93 47, 85 64.5"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.55"
            />

            <g transform="translate(85, 64.5) rotate(-18)">
              <rect
                x="-2.4"
                y="-1"
                width="4.8"
                height="8.5"
                rx="1"
                fill="#18181B"
                stroke="#D4D4D8"
                strokeWidth="0.7"
              />
              <circle cx="0" cy="7.2" r="1.05" fill="#F59E0B" />
              <circle cx="0" cy="2.6" r="0.8" fill="#F59E0B" className="animate-pulse" />
            </g>
          </g>
        </svg>
      </button>
    </aside>
  );
}

export default VinylPlayer;
