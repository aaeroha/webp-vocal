import { useEffect, useRef, useState } from 'react';

/**
 * Custom 1950s tilted 3/4 golden/chrome studio microphone cursor (Shure 55SH style).
 * Keeps visible when approaching or hovering along the browser right scrollbar area.
 */
export function RetroMicCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const visibleRef = useRef(false);

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

    const updatePosition = (clientX: number, clientY: number, target: EventTarget | null) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }
      setIsHoveringInteractive(isInteractiveElement(target));
    };

    const onPointerMove = (e: PointerEvent) => {
      updatePosition(e.clientX, e.clientY, e.target);
    };

    const onMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY, e.target);
    };

    // Hide ONLY when pointer genuinely exits the browser viewport (top/left/bottom),
    // NOT when crossing from document area onto the right native scrollbar strip.
    const onMouseLeave = (e: MouseEvent) => {
      const docWidth = document.documentElement.clientWidth;
      const isOverRightScrollbar = e.clientX >= docWidth - 2 && e.clientX <= window.innerWidth + 2;
      if (isOverRightScrollbar) return;

      if (e.clientX <= 0 || e.clientY <= 0 || e.clientY >= window.innerHeight - 1 || e.clientX >= window.innerWidth - 1) {
        visibleRef.current = false;
        setIsVisible(false);
      }
    };

    const onWindowBlur = () => {
      visibleRef.current = false;
      setIsVisible(false);
    };

    const onMouseEnter = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY, e.target);
    };

    const onMouseDown = () => setIsPressed(true);
    const onMouseUp = () => setIsPressed(false);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-[9999] transition-opacity duration-150 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        transform: 'translate3d(-100px, -100px, 0)',
        willChange: 'transform',
      }}
    >
      <div
        className={`relative transition-all duration-150 ease-out ${
          isPressed
            ? 'scale-90 -rotate-[40deg]'
            : isHoveringInteractive
              ? 'scale-110 -rotate-[36deg]'
              : 'scale-100 -rotate-[32deg]'
        }`}
        style={{
          marginLeft: '-11px',
          marginTop: '-6px',
          transformOrigin: '11px 6px',
          filter: isHoveringInteractive
            ? 'drop-shadow(0 0 11px rgba(250, 204, 21, 0.95)) drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4))'
            : 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.38))',
        }}
      >
        <svg
          width="38"
          height="46"
          viewBox="0 0 42 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="micGoldShell" x1="8" y1="2" x2="34" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isHoveringInteractive ? '#FEF9C3' : '#F4F4F5'} />
              <stop offset="35%" stopColor={isHoveringInteractive ? '#FDE047' : '#E2C07D'} />
              <stop offset="70%" stopColor={isHoveringInteractive ? '#FACC15' : '#C59B43'} />
              <stop offset="100%" stopColor={isHoveringInteractive ? '#CA8A04' : '#78581E'} />
            </linearGradient>

            <linearGradient id="micSideSilver" x1="28" y1="6" x2="36" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isHoveringInteractive ? '#FDE047' : '#D4D4D8'} />
              <stop offset="100%" stopColor={isHoveringInteractive ? '#A16207' : '#52525B'} />
            </linearGradient>

            <linearGradient id="micAcousticMesh" x1="12" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isHoveringInteractive ? '#FEF08A' : '#3F3F46'} />
              <stop offset="50%" stopColor={isHoveringInteractive ? '#F59E0B' : '#27272A'} />
              <stop offset="100%" stopColor={isHoveringInteractive ? '#B45309' : '#09090B'} />
            </linearGradient>

            <linearGradient id="micBaseMount" x1="14" y1="30" x2="26" y2="47" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F4F4F5" />
              <stop offset="50%" stopColor="#A1A1AA" />
              <stop offset="100%" stopColor="#52525B" />
            </linearGradient>
          </defs>

          {isHoveringInteractive && (
            <ellipse cx="20" cy="16" rx="15" ry="14" fill="#FACC15" opacity="0.34" />
          )}

          <path
            d="M 25 4.2 C 30.8 4.8, 34 9.5, 34 15.8 C 34 22.5, 30.5 27.5, 25 28.5 L 22 28.5 L 22 4.2 Z"
            fill="url(#micSideSilver)"
            stroke="#52525B"
            strokeWidth="0.6"
          />
          <line x1="28.5" y1="9" x2="33" y2="9.5" stroke="#18181B" strokeWidth="1" strokeLinecap="round" />
          <line x1="29" y1="12.5" x2="33.5" y2="13" stroke="#18181B" strokeWidth="1" strokeLinecap="round" />
          <line x1="29" y1="16" x2="33.5" y2="16.5" stroke="#18181B" strokeWidth="1" strokeLinecap="round" />
          <line x1="29" y1="19.5" x2="33.2" y2="20" stroke="#18181B" strokeWidth="1" strokeLinecap="round" />
          <line x1="28.5" y1="23" x2="32.2" y2="23.5" stroke="#18181B" strokeWidth="1" strokeLinecap="round" />

          <rect
            x="8"
            y="4"
            width="20"
            height="24.5"
            rx="9.5"
            fill="url(#micAcousticMesh)"
            stroke="url(#micGoldShell)"
            strokeWidth="1.8"
          />

          <path d="M 8.8 9.2 Q 17 8.2 27.2 9.5" stroke="url(#micGoldShell)" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 8.2 13 Q 17 12 27.8 13.3" stroke="url(#micGoldShell)" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 8.2 16.8 Q 17 15.8 27.8 17.1" stroke="url(#micGoldShell)" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 8.6 20.6 Q 17 19.6 27.4 20.9" stroke="url(#micGoldShell)" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 9.6 24.4 Q 17 23.6 26.2 24.7" stroke="url(#micGoldShell)" strokeWidth="1.5" strokeLinecap="round" />

          <path d="M 16.5 4.2 Q 15.5 16 16.8 28.4" stroke="url(#micGoldShell)" strokeWidth="2.1" />

          <path
            d="M 13.5 28.2 L 15 35 L 25 35 L 26.8 28.2 Z"
            fill="url(#micBaseMount)"
            stroke="#52525B"
            strokeWidth="0.7"
          />
          <circle
            cx="24.2"
            cy="33.5"
            r="2.1"
            fill={isHoveringInteractive ? '#FACC15' : '#D97706'}
            stroke="#52525B"
            strokeWidth="0.7"
          />

          <path
            d="M 14.2 35 L 12.2 46.5 L 24.8 47.5 L 24 35 Z"
            fill="url(#micBaseMount)"
            stroke="#3F3F46"
            strokeWidth="0.7"
          />
          <rect x="19.5" y="37" width="3.8" height="8" rx="0.6" fill="#27272A" />
        </svg>
      </div>
    </div>
  );
}
