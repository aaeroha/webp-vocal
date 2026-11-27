import { CalendarCheck, Clock, ExternalLink, Globe, MapPin } from 'lucide-react';
import { CONTACTS_CONTENT, SITE_CONFIG, type SocialLink } from '../data/content';
import { useReveal } from '../hooks/useReveal';

interface ContactsProps {
  isDark: boolean;
  onOpenBooking: () => void;
}

function SocialLogo({ id }: { id: SocialLink['id'] }) {
  if (id === 'youtube') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="none">
        <rect x="2" y="4.5" width="20" height="15" rx="4.2" fill="#FF0000" />
        <path d="M10 9.2L15.5 12L10 14.8V9.2Z" fill="#FFFFFF" />
      </svg>
    );
  }
  // Rutube logo badge
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#001F3F" />
      <path
        d="M7.5 16.5V7.5H12.4C14.6 7.5 15.8 8.6 15.8 10.3C15.8 11.7 15 12.6 13.7 12.9L16 16.5H13.5L11.5 13.2H9.7V16.5H7.5ZM9.7 11.4H12.1C13.1 11.4 13.6 11 13.6 10.3C13.6 9.6 13.1 9.2 12.1 9.2H9.7V11.4Z"
        fill="#FFFFFF"
      />
      <circle cx="17.8" cy="6.4" r="1.4" fill="#EF4444" />
    </svg>
  );
}

export function Contacts({ isDark, onOpenBooking }: ContactsProps) {
  const { ref, isVisible } = useReveal({ threshold: 0.08 });

  const mapSrc = isDark
    ? SITE_CONFIG.yandexMapWidgetDarkUrl
    : SITE_CONFIG.yandexMapWidgetLightUrl;

  return (
    <section id="contacts" className="relative z-10 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`reveal-scale overflow-hidden rounded-3xl border border-zinc-900/10 bg-[#F2EDE6]/90 dark:border-white/10 dark:bg-[#16151C]/95 ${
            isVisible ? 'is-visible' : ''
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* 1. Heading + Primary CTA (Top on mobile, top-left on desktop) */}
            <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1 p-6 pb-5 sm:p-8 sm:pb-6 lg:px-10 lg:pt-10 lg:pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
                {CONTACTS_CONTENT.eyebrow}
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-4xl lg:text-[2.75rem]">
                {CONTACTS_CONTENT.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
                {CONTACTS_CONTENT.subtitle}
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="btn-sheen inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-[#B45309] px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#EBB86E] dark:gold-glow cursor-pointer"
                >
                  <CalendarCheck className="h-4.5 w-4.5" />
                  <span>Записаться на урок</span>
                </button>
              </div>
            </div>

            {/* 2. Yandex Map mounted only when visible so heavy map scripts never slow initial page load */}
            <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:row-span-2 flex flex-col bg-[#FAF8F5]/85 dark:bg-[#0D0C10]/80">
              <div className="relative min-h-[300px] flex-1 w-full sm:min-h-[360px] lg:min-h-[460px]">
                {isVisible ? (
                  <iframe
                    key={isDark ? 'yandex-dark' : 'yandex-light'}
                    title="Карта студии — г. Москва, Ватутинки"
                    src={mapSrc}
                    className="h-full w-full border-0"
                    loading="lazy"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full min-h-[300px] w-full items-center justify-center bg-[#E8E2D9] text-sm text-zinc-500 dark:bg-[#100F14] dark:text-zinc-400">
                    Загрузка карты студии...
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-b lg:border-b-0 border-zinc-900/10 px-5 py-3.5 text-xs dark:border-white/10">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Москва, Ватутинки
                </span>
                <a
                  href={SITE_CONFIG.yandexMapRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#B45309] hover:underline dark:text-[#E2A856]"
                >
                  <span>Построить маршрут в Яндекс Картах</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* 3. Studio Address & Larger Social Buttons (Below map on mobile, bottom-left on desktop) */}
            <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2 flex flex-col justify-between p-6 pt-5 sm:p-8 sm:pt-6 lg:px-10 lg:pt-2 lg:pb-10">
              <div className="space-y-3.5 border-t border-zinc-900/10 pt-5 dark:border-white/10">
                <div className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309] dark:text-[#E2A856]" />
                  <span>{SITE_CONFIG.studioAddress}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309] dark:text-[#E2A856]" />
                  <span>{SITE_CONFIG.onlinePlatform}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309] dark:text-[#E2A856]" />
                  <span>{SITE_CONFIG.schedule}</span>
                </div>
              </div>

              <div className="mt-6 border-t border-zinc-900/10 pt-5 dark:border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Социальные сети и материалы
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                  {CONTACTS_CONTENT.socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-1 items-center justify-center gap-2.5 rounded-2xl border border-zinc-900/12 bg-[#FAF8F5] px-4 py-3 text-sm font-semibold text-zinc-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#B45309]/45 hover:text-[#B45309] dark:border-white/12 dark:bg-[#0D0C10] dark:text-zinc-200 dark:hover:border-[#E2A856]/45 dark:hover:text-[#E2A856] sm:flex-initial sm:px-5"
                    >
                      <SocialLogo id={social.id} />
                      <span className="truncate">{social.label}</span>
                      <ExternalLink className="h-4 w-4 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
