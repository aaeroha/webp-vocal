import { useEffect, useRef, useState } from 'react';

/**
 * Custom 1950s Shure-style retro vocal microphone cursor.
 * Active exclusively on desktop precision pointer devices (hover: hover & pointer: fine).
 * Lights up warm golden-yellow when hovering interactive controls.
 */
export function RetroMicCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');

    const updateMode = () => {
      const fine = mq.matches;
      setEnabled(fine);
      if (fine) {
        document.documentElement.classList.add('mic-cursor-active');
      } else {
        document.documentElement.classList.remove('mic-cursor-active');
      }
    };

    updateMode();
    mq.addEventListener('change', updateMode);

    return () => {
      mq.removeEventListener('change', updateMode);
      document.documentElement.classList.remove('mic-cursor-active');
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const isInteractiveElement = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest(
          'a, button, [role="button"], summary, input, select, textarea, label, [data-interactive="true"]'
        )
      );
    };

    const renderCursor = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }
      frameRef.current = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      const interactive = isInteractiveElement(e.target);
      setIsHoveringInteractive(interactive);

      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(renderCursor);
      }
    };

    const onMouseLeave = () => {
      setVisible(false);
    };

    const onMouseEnter = () => {
      setVisible(true);
    };

    const onMouseDown = () => setIsPressed(true);
    const onMouseUp = () => setIsPressed(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [enabled, visible]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-[9999] will-change-transform transition-opacity duration-150 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        // Offset so top-left precision aim dot is directly under cursor coordinate
        marginLeft: '-4px',
        marginTop: '-4px',
      }}
    >
      <div
        className={`relative transition-all duration-200 ease-out ${
          isPressed
            ? 'scale-90 -rotate-12'
            : isHoveringInteractive
              ? 'scale-115 -rotate-6'
              : 'scale-100 rotate-0'
        }`}
        style={{
          filter: isHoveringInteractive
            ? 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.85)) drop-shadow(0 2px 5px rgba(0, 0, 0, 0.35))'
            : 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.32))',
        }}
      >
        {/* Precision tiny hotspot ring at cursor tip (top-left) */}
        <span
          className={`absolute left-[2px] top-[2px] h-2 w-2 rounded-full transition-colors duration-200 ${
            isHoveringInteractive
              ? 'bg-amber-300 ring-2 ring-amber-400/70'
              : 'bg-[#B45309] dark:bg-[#E2A856] ring-1 ring-white/80'
          }`}
        />

        {/* Detailed 1950s Shure-style Vintage Studio Microphone SVG */}
        <svg
          width="34"
          height="42"
          viewBox="0 0 34 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="translate-x-[5px] translate-y-[4px]"
        >
          <defs>
            <linearGradient id="micChrome" x1="8" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isHoveringInteractive ? '#FEF08A' : '#F4F4F5'} />
              <stop offset="50%" stopColor={isHoveringInteractive ? '#FACC15' : '#D4D4D8'} />
              <stop offset="100%" stopColor={isHoveringInteractive ? '#CA8A04' : '#71717A'} />
            </linearGradient>
            <linearGradient id="micCoreGlow" x1="17" y1="5" x2="17" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isHoveringInteractive ? '#FEF08A' : '#3F3F46'} />
              <stop offset="100%" stopColor={isHoveringInteractive ? '#F59E0B' : '#18181B'} />
            </linearGradient>
          </defs>

          {/* Outer warm glow aura when active */}
          {isHoveringInteractive && (
            <ellipse
              cx="17"
              cy="14"
              rx="12"
              ry="13"
              fill="#FACC15"
              opacity="0.28"
            />
          )}

          {/* Acoustic inner core behind grille */}
          <rect
            x="9.5"
            y="4"
            width="15"
            height="19"
            rx="7.5"
            fill="url(#micCoreGlow)"
          />

          {/* Vintage Mic Chrome Grille Frame */}
          <rect
            x="8"
            y="2.5"
            width="18"
            height="22"
            rx="9"
            stroke="url(#micChrome)"
            strokeWidth="2.1"
            fill="none"
          />

          {/* Signature 1950s Horizontal Chrome Ribs */}
          <line x1="9" y1="7.5" x2="25" y2="7.5" stroke="url(#micChrome)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="8.5" y1="11" x2="25.5" y2="11" stroke="url(#micChrome)" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="8.5" y1="14.5" x2="25.5" y2="14.5" stroke="url(#micChrome)" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="9" y1="18" x2="25" y2="18" stroke="url(#micChrome)" strokeWidth="1.2" strokeLinecap="round" />

          {/* Center vertical divider bar */}
          <line x1="17" y1="3" x2="17" y2="24" stroke="url(#micChrome)" strokeWidth="1.5" />

          {/* Cradle / Swivel Yoke */}
          <path
            d="M 5.5 16.5 V 21 C 5.5 26 10.6 29.5 17 29.5 C 23.4 29.5 28.5 26 28.5 21 V 16.5"
            stroke="url(#micChrome)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Pivot Thumb Screws */}
          <circle cx="5.5" cy="15.5" r="1.6" fill="url(#micChrome)" />
          <circle cx="28.5" cy="15.5" r="1.6" fill="url(#micChrome)" />

          {/* Stand Neck & Base Flange */}
          <rect x="14.5" y="29.5" width="5" height="6" rx="1" fill="url(#micChrome)" />
          <path
            d="M 11 36.5 H 23 L 24.5 39 H 9.5 L 11 36.5 Z"
            fill={isHoveringInteractive ? '#FACC15' : '#52525B'}
            stroke="url(#micChrome)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
