import { lazy, Suspense, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MusicAmbience } from './components/MusicAmbience';
import { RetroMicCursor } from './components/RetroMicCursor';
import { VinylPlayer } from './components/VinylPlayer';
import { VoiceTestTrigger } from './components/VoiceTestTrigger';
import { SITE_CONFIG } from './data/content';

// Lazy-load below-the-fold sections & modals for optimal initial page speed
const About = lazy(() => import('./components/About').then((m) => ({ default: m.About })));
const Formats = lazy(() => import('./components/Formats').then((m) => ({ default: m.Formats })));
const VocalPiano = lazy(() =>
  import('./components/VocalPiano').then((m) => ({ default: m.VocalPiano }))
);
const Certificates = lazy(() =>
  import('./components/Certificates').then((m) => ({ default: m.Certificates }))
);
const Reviews = lazy(() => import('./components/Reviews').then((m) => ({ default: m.Reviews })));
const FaqAccordion = lazy(() =>
  import('./components/FaqAccordion').then((m) => ({ default: m.FaqAccordion }))
);
const Contacts = lazy(() =>
  import('./components/Contacts').then((m) => ({ default: m.Contacts }))
);
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
      <RetroMicCursor />
      <MusicAmbience />
      <VinylPlayer />
      <VoiceTestTrigger onOpen={openVoiceTest} />

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
        <Suspense fallback={null}>
          <About />
          <Formats onOpenBooking={openBooking} />
          <VocalPiano />
          <Certificates />
          <Reviews />
          <FaqAccordion />
          <Contacts isDark={isDark} onOpenBooking={openBooking} />
        </Suspense>
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
