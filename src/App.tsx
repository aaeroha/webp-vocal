import { useEffect, useState } from 'react';
import { About } from './components/About';
import { BookingModal } from './components/BookingModal';
import { Certificates } from './components/Certificates';
import { Contacts } from './components/Contacts';
import { FaqAccordion } from './components/FaqAccordion';
import { Formats } from './components/Formats';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MusicAmbience } from './components/MusicAmbience';
import { RetroMicCursor } from './components/RetroMicCursor';
import { Reviews } from './components/Reviews';
import { VinylPlayer } from './components/VinylPlayer';
import { VocalPiano } from './components/VocalPiano';
import { VoiceTestModal } from './components/VoiceTestModal';
import { VoiceTestTrigger } from './components/VoiceTestTrigger';
import { SITE_CONFIG } from './data/content';

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

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#18181B] transition-colors duration-300 dark:bg-[#0D0C10] dark:text-[#F5F3EF]">
      <RetroMicCursor />
      <MusicAmbience />
      <VinylPlayer />
      <VoiceTestTrigger onOpen={() => setVoiceTestOpen(true)} />

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
      <VoiceTestModal
        isOpen={voiceTestOpen}
        onClose={() => setVoiceTestOpen(false)}
        onOpenBooking={openBooking}
      />

      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenBooking={openBooking}
      />

      <main>
        <Hero onOpenBooking={openBooking} />
        <About />
        <Certificates />
        <Formats onOpenBooking={openBooking} />
        <VocalPiano />
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
