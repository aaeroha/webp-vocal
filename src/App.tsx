import { lazy, Suspense, useEffect, useState } from 'react';
import { About } from './components/About';
import { Certificates } from './components/Certificates';
import { Contacts } from './components/Contacts';
import { CookieNotice } from './components/CookieNotice';
import { FaqAccordion } from './components/FaqAccordion';
import { Formats } from './components/Formats';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MusicAmbience } from './components/MusicAmbience';
import { RetroMicCursor } from './components/RetroMicCursor';
import { Reviews } from './components/Reviews';
import { VinylPlayer } from './components/VinylPlayer';
import { VocalPiano } from './components/VocalPiano';
import { VoiceTestTrigger } from './components/VoiceTestTrigger';
import { SITE_CONFIG } from './data/content';

// Only heavy interactive modals stay lazy-loaded so initial page layout has zero CLS shifts
const BookingModal = lazy(() =>
  import('./components/BookingModal').then((m) => ({ default: m.BookingModal }))
);
const VoiceTestModal = lazy(() =>
  import('./components/VoiceTestModal').then((m) => ({ default: m.VoiceTestModal }))
);

export function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const [bookingOpen, setBookingOpen] = useState(false);
  const [voiceTestOpen, setVoiceTestOpen] = useState(false);
  const [bootPhase, setBootPhase] = useState<'visible' | 'fading' | 'gone'>('visible');

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setBootPhase('fading'), 650);
    const removeTimer = window.setTimeout(() => setBootPhase('gone'), 1100);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('vocal-studio-theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [isDark]);

  const openBooking = () => setBookingOpen(true);
  const openVoiceTest = () => setVoiceTestOpen(true);

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#18181B] transition-colors duration-300 dark:bg-[#0D0C10] dark:text-[#F5F3EF]">
      {/* Graceful Studio Boot Curtain (~0.65s) lets fonts & DOM settle smoothly without flash */}
      {bootPhase !== 'gone' && (
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#FAF8F5] transition-opacity duration-500 dark:bg-[#0D0C10] ${
            bootPhase === 'fading' ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#B45309]/40 bg-[#F2EDE6] font-serif text-3xl font-semibold text-[#B45309] shadow-lg dark:border-[#E2A856]/45 dark:bg-[#16151C] dark:text-[#E2A856]">
            <span className="absolute inset-0 animate-ping rounded-full border border-[#B45309]/30 dark:border-[#E2A856]/30" />
            ВЕ
          </div>
        </div>
      )}

      <RetroMicCursor />
      <MusicAmbience />
      <VinylPlayer />
      <VoiceTestTrigger onOpen={openVoiceTest} />
      <CookieNotice />

      <Suspense fallback={null}>
        {bookingOpen && (
          <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
        )}
        {voiceTestOpen && (
          <VoiceTestModal
            isOpen={voiceTestOpen}
            onClose={() => setVoiceTestOpen(false)}
            onOpenBooking={openBooking}
          />
        )}
      </Suspense>

      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenBooking={openBooking}
        onOpenVoiceTest={openVoiceTest}
      />

      <main className="overflow-x-clip">
        <Hero onOpenBooking={openBooking} />
        <About />
        <Formats onOpenBooking={openBooking} />
        <VocalPiano />
        <Certificates />
        <Reviews />
        <FaqAccordion />
        <Contacts isDark={isDark} onOpenBooking={openBooking} />
      </main>

      <footer className="relative z-10 border-t border-zinc-900/10 py-8 text-center text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE_CONFIG.brandName} — {SITE_CONFIG.brandSubtitle}
          </p>
          <p>Очно в оборудованной студии и онлайн • Современная вокальная механика и фонопедия</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
