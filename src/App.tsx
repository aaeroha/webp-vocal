import { useEffect, useState } from 'react';
import { About } from './components/About';
import { Certificates } from './components/Certificates';
import { Contacts } from './components/Contacts';
import { FaqAccordion } from './components/FaqAccordion';
import { Formats } from './components/Formats';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MusicAmbience } from './components/MusicAmbience';
import { Reviews } from './components/Reviews';
import { SITE_CONFIG } from './data/content';

export function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

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

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#18181B] transition-colors duration-300 dark:bg-[#0D0C10] dark:text-[#F5F3EF]">
      <MusicAmbience />
      <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />

      <main>
        <Hero />
        <About />
        <Certificates />
        <Formats />
        <Reviews />
        <FaqAccordion />
        <Contacts />
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
