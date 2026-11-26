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

  // Hi-Fi deck kinematics:
  // Record center: (48, 54), outer groove R=35, center label R=14
  // Pivot: (98, 22), distance to center = 59.36, arm length = 45.36
  // At 0%: 0deg -> tip at (81.5, 64.2), R=35 (outer groove)
  // At 100%: 36deg -> tip stops at R=14 (edge of center label «яблоко»)
  const armAngle = (progress / 100) * 36;
  const isEnd = progress >= 98.5;

  return (
    <aside
      aria-label="Виниловый Hi-Fi проигрыватель навигации"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none"
    >
      <div className="relative group">
        {/* Floating progress / scroll-to-top tooltip badge */}
        <div
          className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide transition-all duration-300 pointer-events-none shadow-md ${
            isEnd
              ? 'opacity-100 scale-105 bg-gradient-to-r from-[#B45309] to-[#D97706] text-white shadow-amber-500/30 animate-pulse'
              : isHovered
              ? 'opacity-100 -translate-y-1 bg-zinc-900 text-[#F7F2E7] dark:bg-[#F7F2E7] dark:text-zinc-900'
              : 'opacity-85 bg-zinc-900/90 text-zinc-100 dark:bg-[#F7F2E7]/95 dark:text-zinc-900'
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

        {/* Hi-Fi Turntable Plinth: Black in Light mode, Ivory White in Dark mode */}
        <button
          type="button"
          onClick={handleScrollToTop}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title={
            isEnd
              ? 'Конец пластинки. Нажмите, чтобы вернуться наверх'
              : 'Нажмите, чтобы вернуться наверх'
          }
          aria-label={`Прокрутка наверх. Пройдено ${Math.round(progress)}%`}
          className={`relative block w-[108px] h-[98px] sm:w-[144px] sm:h-[130px] p-1.5 rounded-2xl cursor-pointer transition-all duration-300 transform-gpu active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            isEnd
              ? 'ring-2 ring-amber-500/90 shadow-2xl shadow-amber-500/30 scale-105 bg-[#121216] border border-amber-500/40 dark:bg-[#F5F0E6] dark:border-amber-600/50'
              : 'hover:scale-105 shadow-2xl bg-[#121216]/95 border border-white/15 hover:border-amber-500/60 dark:bg-[#F5F0E6]/95 dark:border-[#B45309]/25 dark:hover:border-[#B45309]/70'
          }`}
        >
          <svg
            viewBox="0 0 120 108"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Center label warm vinyl gradient */}
              <linearGradient id="vinylLabelHifi" x1="34" y1="40" x2="62" y2="68" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E2A856" />
                <stop offset="50%" stopColor="#C26D3A" />
                <stop offset="100%" stopColor="#7C2D12" />
              </linearGradient>

              {/* Tonearm metallic brushed chrome gradient */}
              <linearGradient id="tonearmChrome" x1="98" y1="22" x2="81" y2="65" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E4E4E7" />
                <stop offset="45%" stopColor="#A1A1AA" />
                <stop offset="85%" stopColor="#D4D4D8" />
                <stop offset="100%" stopColor="#71717A" />
              </linearGradient>

              {/* Vinyl light sheen reflection gradient */}
              <linearGradient id="vinylSheenHifi" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.24" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Platter brushed metallic outer rim */}
            <circle
              cx="48"
              cy="54"
              r="42"
              fill="#1E1E24"
              stroke="#52525B"
              strokeWidth="1"
              className="dark:fill-[#DDD6C7] dark:stroke-[#A89F91]"
            />
            {/* Hi-Fi Strobe Dots along platter edge */}
            <circle
              cx="48"
              cy="54"
              r="40.5"
              stroke="#A1A1AA"
              strokeWidth="1.2"
              strokeDasharray="1.1 2.1"
              opacity="0.7"
              className="dark:stroke-[#78716C]"
            />

            {/* Platter mat bed */}
            <circle cx="48" cy="54" r="39" fill="#09090B" />

            {/* CONTINUOUSLY SPINNING VINYL DISC */}
            <g className="animate-vinyl-spin">
              <circle cx="48" cy="54" r="38" fill="#131317" />

              {/* Authentic Fine Concentric Sound Grooves */}
              <circle cx="48" cy="54" r="36" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
              <circle cx="48" cy="54" r="34" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <circle cx="48" cy="54" r="32" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
              <circle cx="48" cy="54" r="30" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <circle cx="48" cy="54" r="28" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
              <circle cx="48" cy="54" r="26" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <circle cx="48" cy="54" r="24" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
              <circle cx="48" cy="54" r="22" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <circle cx="48" cy="54" r="20" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
              <circle cx="48" cy="54" r="18" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <circle cx="48" cy="54" r="16" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
              {/* Lead-out runout groove */}
              <circle cx="48" cy="54" r="14.5" stroke="rgba(255,255,255,0.16)" strokeWidth="0.6" />

              {/* Dynamic Vinyl Light Sheen Cones */}
              <path
                d="M48 54 L21 27 A38 38 0 0 1 75 27 Z"
                fill="url(#vinylSheenHifi)"
                opacity="0.18"
              />
              <path
                d="M48 54 L75 81 A38 38 0 0 1 21 81 Z"
                fill="url(#vinylSheenHifi)"
                opacity="0.18"
              />

              {/* "Яблоко" (Vinyl Center Label) */}
              <circle cx="48" cy="54" r="13.5" fill="url(#vinylLabelHifi)" />
              <circle cx="48" cy="54" r="11.5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
              <circle cx="48" cy="54" r="6" stroke="rgba(0,0,0,0.28)" strokeWidth="0.4" />

              {/* Center Label Musical Symbol */}
              <path
                d="M46.3 58 V50 C46.3 48.5 47.4 47.6 49.8 47.6 V52.8 C49.8 51.9 49 51.3 48 51.3 C47 51.3 46.3 52 46.3 53 C46.3 54 47 54.6 48 54.6 C49 54.6 49.8 54 49.8 53 V49.5"
                fill="#FEF3C7"
                opacity="0.9"
              />

              {/* Precision Spindle Center */}
              <circle cx="48" cy="54" r="2.3" fill="#09090B" />
              <circle cx="48" cy="54" r="1.2" fill="#E4E4E7" />
            </g>

            {/* HI-FI TURNTABLE HARDWARE CONTROLS */}
            {/* Strobe lamp tower + Start/Stop pad in bottom-left */}
            <rect
              x="5"
              y="88"
              width="12"
              height="12"
              rx="2.5"
              fill="#27272A"
              stroke="#52525B"
              strokeWidth="0.6"
              className="dark:fill-[#E5DEC9] dark:stroke-[#A89F91]"
            />
            <circle cx="11" cy="94" r="2.1" fill="#F59E0B" className="animate-pulse" />

            {/* Speed indicators 33 / 45 in top-left */}
            <rect
              x="5"
              y="7"
              width="15"
              height="9"
              rx="2"
              fill="#27272A"
              className="dark:fill-[#E5DEC9]"
            />
            <circle cx="8.5" cy="11.5" r="1.2" fill="#10B981" />
            <text
              x="11.5"
              y="13"
              fontSize="4.2"
              fill="#E4E4E7"
              fontWeight="700"
              className="dark:fill-zinc-800"
            >
              33
            </text>

            {/* Hi-Fi Pitch Control Fader on Right Side */}
            <rect
              x="105"
              y="66"
              width="7"
              height="32"
              rx="2"
              fill="#27272A"
              stroke="#3F3F46"
              strokeWidth="0.6"
              className="dark:fill-[#E5DEC9] dark:stroke-[#BDB3A2]"
            />
            <line
              x1="108.5"
              y1="70"
              x2="108.5"
              y2="94"
              stroke="#71717A"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <rect
              x="106"
              y="79"
              width="5"
              height="3.2"
              rx="0.8"
              fill="#D4D4D8"
              className="dark:fill-zinc-700"
            />

            {/* Tonearm Rest Clip */}
            <path
              d="M 92 60 L 97 60 L 97 63"
              stroke="#71717A"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Tonearm Gimbal Base & Anti-Skate Dial (Pivot at 98, 22) */}
            <circle
              cx="98"
              cy="22"
              r="9"
              fill="#27272A"
              stroke="#52525B"
              strokeWidth="0.8"
              className="dark:fill-[#DDD6C7] dark:stroke-[#A89F91]"
            />
            <circle cx="98" cy="22" r="5.5" fill="#52525B" className="dark:fill-[#A89F91]" />
            <circle cx="98" cy="22" r="3" fill="#E4E4E7" className="dark:fill-zinc-700" />
            {/* Counterweight cylinder */}
            <rect
              x="94.5"
              y="6"
              width="7"
              height="9.5"
              rx="1.8"
              fill="#71717A"
              stroke="#3F3F46"
              strokeWidth="0.6"
              className="dark:fill-zinc-600 dark:stroke-zinc-800"
            />
            <line x1="94.5" y1="10" x2="101.5" y2="10" stroke="#D4D4D8" strokeWidth="0.6" />

            {/* TONEARM ASSEMBLY (ЗВУКОСНИМАТЕЛЬ) */}
            <g
              style={{
                transformOrigin: '98px 22px',
                transform: `rotate(${armAngle}deg)`,
                transition: 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              {/* Classic S-shaped Hi-Fi Metallic Tonearm Tube */}
              <path
                d="M 98 22 C 99.5 35, 89 48, 81.5 64.2"
                fill="none"
                stroke="url(#tonearmChrome)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 98 22 C 99.5 35, 89 48, 81.5 64.2"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.6"
              />

              {/* Headshell & Cartridge at needle tip (81.5, 64.2) */}
              <g transform="translate(81.5, 64.2) rotate(-20)">
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
                {/* Headshell finger lift */}
                <path d="M 2.4 1.5 Q 5 1.5, 5 4" stroke="#D4D4D8" strokeWidth="0.65" fill="none" />
                {/* Glowing stylus point */}
                <circle cx="0" cy="7.2" r="1" fill="#F59E0B" />
                <circle cx="0" cy="2.5" r="0.8" fill="#F59E0B" className="animate-pulse" />
              </g>
            </g>
          </svg>
        </button>
      </div>
    </aside>
  );
}

export default VinylPlayer;
