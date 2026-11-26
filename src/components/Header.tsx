import { useEffect, useState } from 'react';
import { CalendarCheck, Menu, X } from 'lucide-react';
import { NAV_LINKS, SITE_CONFIG } from '../data/content';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenBooking: () => void;
}

export function Header({ isDark, onToggleTheme, onOpenBooking }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-zinc-900/10 bg-[#FAF8F5]/88 backdrop-blur-md shadow-xs dark:border-white/10 dark:bg-[#0D0C10]/88'
            : 'bg-[#FAF8F5]/75 backdrop-blur-sm dark:bg-[#0D0C10]/75'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-18 sm:px-6 lg:px-8">
          {/* Left: Brand */}
          <a
            href="#top"
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#B45309]/25 bg-[#F2EDE6] font-serif text-lg font-semibold text-[#B45309] transition-colors group-hover:border-[#B45309] dark:border-[#E2A856]/30 dark:bg-[#16151C] dark:text-[#E2A856]">
              ВЕ
            </span>
            <div className="leading-tight">
              <span className="block font-serif text-lg font-semibold tracking-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-xl">
                {SITE_CONFIG.brandName}
              </span>
              <span className="hidden text-[11px] font-medium text-zinc-500 dark:text-zinc-400 sm:block">
                {SITE_CONFIG.brandSubtitle}
              </span>
            </div>
          </a>

          {/* Center: Desktop anchor links (> 1024px) */}
          <nav
            aria-label="Основная навигация"
            className="hidden lg:flex items-center gap-6"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative py-1 text-sm font-medium text-zinc-700 transition-colors hover:text-[#B45309] dark:text-zinc-300 dark:hover:text-[#E2A856]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: ThemeToggle, Unified Booking CTA, and Mobile/Tablet Burger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            <button
              type="button"
              onClick={onOpenBooking}
              className="btn-sheen inline-flex h-10 items-center gap-2 rounded-full bg-[#B45309] px-3.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#EBB86E] dark:gold-glow sm:px-4 sm:text-sm cursor-pointer"
            >
              <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Записаться</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Открыть меню навигации"
              aria-expanded={menuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-800 transition-colors hover:border-[#B45309]/40 hover:text-[#B45309] dark:border-white/10 dark:bg-[#16151C] dark:text-[#F5F3EF] dark:hover:border-[#E2A856]/50 dark:hover:text-[#E2A856] lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out drawer for tablet & mobile (< 1024px) */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-black/45 backdrop-blur-xs"
        />

        <aside
          className={`absolute top-0 right-0 flex h-full w-[min(85vw,340px)] flex-col justify-between border-l border-zinc-900/10 bg-[#FAF8F5] p-6 shadow-2xl transition-transform duration-300 ease-out dark:border-white/10 dark:bg-[#121117] ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between border-b border-zinc-900/10 pb-4 dark:border-white/10">
              <div>
                <p className="font-serif text-xl font-semibold text-zinc-900 dark:text-[#F5F3EF]">
                  {SITE_CONFIG.brandName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {SITE_CONFIG.brandSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Закрыть меню"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-800 dark:border-white/10 dark:bg-[#16151C] dark:text-[#F5F3EF] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Мобильная навигация" className="mt-6 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-zinc-800 transition-colors hover:bg-[#F2EDE6] hover:text-[#B45309] dark:text-[#F5F3EF] dark:hover:bg-[#16151C] dark:hover:text-[#E2A856]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="border-t border-zinc-900/10 pt-5 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenBooking();
              }}
              className="btn-sheen flex w-full items-center justify-center gap-2 rounded-full bg-[#B45309] px-5 py-3.5 text-sm font-semibold text-white dark:bg-[#E2A856] dark:text-[#0D0C10] cursor-pointer"
            >
              <CalendarCheck className="h-4 w-4" />
              Записаться на урок
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
