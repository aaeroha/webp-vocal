import { useEffect, useState } from 'react';
import {
  AudioWaveform,
  Award,
  CalendarCheck,
  ChevronDown,
  HelpCircle,
  MapPin,
  Menu,
  Mic,
  MicVocal,
  Music2,
  Piano,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { NAV_LINKS, SITE_CONFIG } from '../data/content';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenBooking: () => void;
  onOpenVoiceTest: () => void;
}

const PRIMARY_LINKS = [
  { label: 'Обо мне', href: '#about', icon: MicVocal },
  { label: 'Занятия', href: '#formats', icon: Music2 },
  { label: 'Пианино', href: '#vocal-piano', icon: Piano },
];

const INFO_DROPDOWN_LINKS = [
  { label: '3D-атлас резонаторов', href: '#vocal-atlas', icon: AudioWaveform },
  { label: 'Дипломы и база', href: '#certificates', icon: Award },
  { label: 'Отзывы учеников', href: '#reviews', icon: Star },
  { label: 'Частые вопросы', href: '#faq', icon: HelpCircle },
  { label: 'Контакты и карта', href: '#contacts', icon: MapPin },
];

export function Header({ isDark, onToggleTheme, onOpenBooking, onOpenVoiceTest }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-18 sm:px-6 lg:px-8">
          {/* Left: Clean Brand Logo only */}
          <a
            href="#top"
            aria-label={`${SITE_CONFIG.brandName} — наверх`}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B45309]/30 bg-[#F2EDE6] font-serif text-lg font-semibold text-[#B45309] transition-all duration-300 group-hover:scale-105 group-hover:border-[#B45309] dark:border-[#E2A856]/35 dark:bg-[#16151C] dark:text-[#E2A856]">
              ВЕ
            </span>
          </a>

          {/* Center: Vocal-styled Navigation + Voice Test integrated naturally in the center cluster */}
          <nav
            aria-label="Основная навигация"
            className="hidden xl:flex items-center gap-2"
          >
            {PRIMARY_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-[#F2EDE6]/80 hover:text-[#B45309] dark:text-zinc-300 dark:hover:bg-[#16151C] dark:hover:text-[#E2A856]"
                >
                  <Icon className="h-3.5 w-3.5 text-[#B45309]/80 transition-transform duration-200 group-hover:scale-110 dark:text-[#E2A856]/85" />
                  <span>{link.label}</span>
                </a>
              );
            })}

            {/* Clean "Информация" dropdown without cluttered subtext */}
            <div
              className="relative"
              onMouseEnter={() => setInfoOpen(true)}
              onMouseLeave={() => setInfoOpen(false)}
            >
              <button
                type="button"
                onClick={() => setInfoOpen((prev) => !prev)}
                aria-expanded={infoOpen}
                className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-[#F2EDE6]/80 hover:text-[#B45309] dark:text-zinc-300 dark:hover:bg-[#16151C] dark:hover:text-[#E2A856] cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#B45309]/80 dark:text-[#E2A856]/85" />
                <span>Информация</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    infoOpen ? 'rotate-180 text-[#B45309] dark:text-[#E2A856]' : ''
                  }`}
                />
              </button>

              <div
                className={`absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-2 transition-all duration-200 ${
                  infoOpen
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-1 opacity-0'
                }`}
              >
                <div className="rounded-2xl border border-zinc-900/10 bg-[#FAF8F5]/98 p-1.5 shadow-xl backdrop-blur-md dark:border-white/12 dark:bg-[#16151C]/98">
                  {INFO_DROPDOWN_LINKS.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setInfoOpen(false)}
                        className="group flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-[#F2EDE6] hover:text-[#B45309] dark:text-[#F5F3EF] dark:hover:bg-[#0D0C10] dark:hover:text-[#E2A856]"
                      >
                        <ItemIcon className="h-4 w-4 shrink-0 text-[#B45309]/80 transition-transform group-hover:scale-110 dark:text-[#E2A856]/85" />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            <span aria-hidden="true" className="mx-1 h-4 w-px bg-zinc-900/12 dark:bg-white/12" />

            <button
              type="button"
              onClick={onOpenVoiceTest}
              className="group relative inline-flex h-9 items-center gap-1.5 rounded-full border border-[#B45309]/40 bg-[#F2EDE6]/95 px-3.5 text-sm font-semibold text-[#B45309] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B45309] hover:bg-[#FAF8F5] dark:border-[#E2A856]/45 dark:bg-[#16151C] dark:text-[#E2A856] dark:hover:border-[#E2A856] cursor-pointer"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#B45309] dark:bg-[#E2A856]" />
              </span>
              <Mic className="h-3.5 w-3.5 shrink-0" />
              <span>Тест голоса</span>
            </button>
          </nav>

          {/* Right: Booking CTA -> Mobile Burger -> ThemeToggle at very right edge */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onOpenBooking}
              className="btn-sheen inline-flex h-10 items-center gap-1.5 rounded-full bg-[#B45309] px-3.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#EBB86E] dark:gold-glow sm:px-4 sm:text-sm cursor-pointer"
            >
              <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Записаться</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Открыть меню навигации"
              aria-expanded={menuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-900/10 bg-[#F2EDE6] text-zinc-800 transition-colors hover:border-[#B45309]/40 hover:text-[#B45309] dark:border-white/10 dark:bg-[#16151C] dark:text-[#F5F3EF] dark:hover:border-[#E2A856]/50 dark:hover:text-[#E2A856] xl:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </div>
      </header>

      {/* Slide-out drawer for tablet & mobile (< 1280px) */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-50 xl:hidden transition-opacity duration-300 ${
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
          <div className="overflow-y-auto">
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

            <nav aria-label="Мобильная навигация" className="mt-5 flex flex-col gap-1.5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-base font-medium text-zinc-800 transition-colors hover:bg-[#F2EDE6] hover:text-[#B45309] dark:text-[#F5F3EF] dark:hover:bg-[#16151C] dark:hover:text-[#E2A856]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="space-y-2.5 border-t border-zinc-900/10 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenVoiceTest();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#B45309]/40 bg-[#F2EDE6] px-5 py-3 text-sm font-semibold text-[#B45309] dark:border-[#E2A856]/40 dark:bg-[#16151C] dark:text-[#E2A856] cursor-pointer"
            >
              <AudioWaveform className="h-4 w-4" />
              Пройти тест голоса
            </button>

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
