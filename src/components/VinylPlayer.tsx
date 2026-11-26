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

  // Larger Hi-Fi vinyl deck kinematics (viewBox 0 0 120 110):
  // Record center: (50, 55), Pivot: (102, 21)
  // Distance Pivot->Center = sqrt((-52)^2 + 34^2) = sqrt(2704+1156) = 62.13
  // Arm length = 46.13 -> at center line (0 deg) tip R = 16.0 (exact edge of label «яблоко»)
  // Outer groove R = 41 -> rotated -39.5 deg from center line -> starts at outer groove
  const armAngle = (progress / 100) * 39.5;
  const isEnd = progress >= 98.5;

  return (
    <aside
      aria-label="Виниловый Hi-Fi проигрыватель навигации"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none"
    >
      {/* Large clean Hi-Fi Turntable Plinth: Matte Black in Light Mode, Ivory White in Dark Mode */}
      <button
        type="button"
        onClick={handleScrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={
          isEnd
            ? 'Конец пластинки — нажмите, чтобы вернуться наверх'
            : 'Нажмите, чтобы вернуться наверх'
        }
        aria-label={`Прокрутка наверх. Пройдено ${Math.round(progress)}%`}
        className={`group relative block w-[124px] h-[112px] sm:w-[168px] sm:h-[152px] p-1.5 rounded-2xl cursor-pointer transition-all duration-300 transform-gpu active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
          isEnd
            ? 'ring-2 ring-amber-500/90 shadow-2xl shadow-amber-500/35 scale-105 bg-[#121216] border border-amber-500/50 dark:bg-[#F5F0E6] dark:border-amber-600/60'
            : 'hover:scale-105 shadow-2xl bg-[#121216]/95 border border-white/15 hover:border-amber-500/60 dark:bg-[#F5F0E6]/95 dark:border-[#B45309]/30 dark:hover:border-[#B45309]/75'
        }`}
      >
        <svg
          viewBox="0 0 120 110"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vinylLabelBig" x1="34" y1="39" x2="66" y2="71" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E2A856" />
              <stop offset="50%" stopColor="#C26D3A" />
              <stop offset="100%" stopColor="#7C2D12" />
            </linearGradient>

            <linearGradient id="tonearmChromeBig" x1="102" y1="21" x2="86" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F4F4F5" />
              <stop offset="50%" stopColor="#A1A1AA" />
              <stop offset="100%" stopColor="#71717A" />
            </linearGradient>

            <linearGradient id="vinylSheenBig" x1="0%" y1="0%" x2="100%" y2="100%">
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

          {/* Platter Bed */}
          <circle cx="50" cy="55" r="42.5" fill="#09090B" />

          {/* LARGE CONTINUOUSLY SPINNING VINYL DISC */}
          <g className="animate-vinyl-spin">
            <circle cx="50" cy="55" r="41.5" fill="#131317" />

            {/* Fine Sound Grooves */}
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

            {/* Dual Vinyl Light Reflection Sheen */}
            <path
              d="M50 55 L20 25 A41.5 41.5 0 0 1 80 25 Z"
              fill="url(#vinylSheenBig)"
              opacity="0.2"
            />
            <path
              d="M50 55 L80 85 A41.5 41.5 0 0 1 20 85 Z"
              fill="url(#vinylSheenBig)"
              opacity="0.2"
            />

            {/* Center "Яблоко" Label */}
            <circle cx="50" cy="55" r="15.5" fill="url(#vinylLabelBig)" />
            <circle cx="50" cy="55" r="13.2" stroke="rgba(255,255,255,0.25)" strokeWidth="0.45" />

            {/* Treble Note inside Center Label */}
            <path
              d="M48.2 59.5 V50.8 C48.2 49.2 49.5 48.2 52.2 48.2 V53.8 C52.2 52.8 51.2 52.2 50.1 52.2 C49 52.2 48.2 53 48.2 54.1 C48.2 55.2 49 55.9 50.1 55.9 C51.2 55.9 52.2 55.2 52.2 54.1 V50"
              fill="#FEF3C7"
              opacity="0.92"
            />

            {/* Precision Spindle Center */}
            <circle cx="50" cy="55" r="2.5" fill="#09090B" />
            <circle cx="50" cy="55" r="1.3" fill="#E4E4E7" />
          </g>

          {/* Clean Integrated Power LED (Top-Left Corner) */}
          <circle cx="9" cy="10" r="1.8" fill="#10B981" />
          <circle cx="9" cy="10" r="3.4" fill="#10B981" opacity="0.28" className="animate-pulse" />

          {/* Clean Gimbal Pivot & Counterweight */}
          <circle
            cx="102"
            cy="21"
            r="8.5"
            fill="#27272A"
            stroke="#52525B"
            strokeWidth="0.8"
            className="dark:fill-[#DED7C7] dark:stroke-[#A89F91]"
          />
          <circle cx="102" cy="21" r="4.8" fill="#52525B" className="dark:fill-[#A89F91]" />
          <circle cx="102" cy="21" r="2.6" fill="#E4E4E7" className="dark:fill-zinc-700" />
          <rect
            x="98.5"
            y="6"
            width="7"
            height="9"
            rx="1.8"
            fill="#71717A"
            stroke="#3F3F46"
            strokeWidth="0.6"
            className="dark:fill-zinc-600 dark:stroke-zinc-800"
          />

          {/* TONEARM (ЗВУКОСНИМАТЕЛЬ) */}
          <g
            style={{
              transformOrigin: '102px 21px',
              transform: `rotate(${armAngle}deg)`,
              transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            {/* S-shaped Metallic Arm pointing from (102,21) to outer groove (86.7, 64.5) */}
            <path
              d="M 102 21 C 103.5 34, 94.5 47, 86.7 64.5"
              fill="none"
              stroke="url(#tonearmChromeBig)"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M 102 21 C 103.5 34, 94.5 47, 86.7 64.5"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* Headshell & Stylus Cartridge */}
            <g transform="translate(86.7, 64.5) rotate(-18)">
              <rect
                x="-2.5"
                y="-1"
                width="5"
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

        {/* Integrated Scroll Percentage / Return-to-Top Badge RIGHT ON the Turntable Corner */}
        <div
          className={`absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-tight transition-all duration-300 shadow-sm ${
            isEnd
              ? 'bg-gradient-to-r from-[#B45309] to-[#D97706] text-white animate-pulse'
              : 'bg-white/15 text-zinc-100 backdrop-blur-xs dark:bg-zinc-900/12 dark:text-zinc-900'
          }`}
        >
          <span>{Math.round(progress)}%</span>
          {(isEnd || isHovered) && <span aria-hidden="true">↑</span>}
        </div>
      </button>
    </aside>
  );
}

export default VinylPlayer;
