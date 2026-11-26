import { Clock, ExternalLink, Globe, MapPin, MessageCircle, Send } from 'lucide-react';
import { CONTACTS_CONTENT, SITE_CONFIG } from '../data/content';
import { useReveal } from '../hooks/useReveal';

export function Contacts() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="contacts" className="relative z-10 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`reveal-item rounded-3xl border border-zinc-900/10 bg-[#F2EDE6]/90 p-6 dark:border-white/10 dark:bg-[#16151C]/95 sm:p-10 lg:p-12 ${
            isVisible ? 'is-visible' : ''
          }`}
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12 items-stretch">
            {/* Left: Heading, Messengers, Studio details & Socials */}
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B45309] dark:text-[#E2A856]">
                  {CONTACTS_CONTENT.eyebrow}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-zinc-900 dark:text-[#F5F3EF] sm:text-4xl lg:text-[2.75rem]">
                  {CONTACTS_CONTENT.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
                  {CONTACTS_CONTENT.subtitle}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={SITE_CONFIG.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-sheen inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#B45309] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9A4407] dark:bg-[#E2A856] dark:text-[#0D0C10] dark:hover:bg-[#EBB86E] dark:gold-glow"
                  >
                    <Send className="h-4 w-4" />
                    <span>Написать в Telegram</span>
                  </a>
                  <a
                    href={SITE_CONFIG.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-zinc-900/15 bg-[#FAF8F5] px-6 py-3.5 text-sm font-semibold text-zinc-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B45309]/40 hover:text-[#B45309] dark:border-white/15 dark:bg-[#0D0C10] dark:text-[#F5F3EF] dark:hover:border-[#E2A856]/50 dark:hover:text-[#E2A856]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Написать в WhatsApp</span>
                  </a>
                </div>

                <div className="mt-7 space-y-3.5 border-t border-zinc-900/10 pt-6 dark:border-white/10">
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
              </div>

              <div className="mt-7 border-t border-zinc-900/10 pt-5 dark:border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Социальные сети и материалы
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {CONTACTS_CONTENT.socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-900/10 bg-[#FAF8F5] px-3.5 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-[#B45309]/40 hover:text-[#B45309] dark:border-white/10 dark:bg-[#0D0C10] dark:text-zinc-200 dark:hover:border-[#E2A856]/45 dark:hover:text-[#E2A856]"
                    >
                      <span>{social.label}</span>
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Yandex Map with marker on Ватутинки, Москва */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-900/10 bg-[#FAF8F5]/85 dark:border-white/10 dark:bg-[#0D0C10]/80">
              <div className="relative min-h-[280px] flex-1 w-full sm:min-h-[340px]">
                <iframe
                  title="Карта студии — г. Москва, Ватутинки"
                  src={SITE_CONFIG.yandexMapWidgetUrl}
                  className="h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-zinc-900/10 px-4 py-3 text-xs dark:border-white/10">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Москва, Ватутинки
                </span>
                <a
                  href={SITE_CONFIG.yandexMapDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#B45309] hover:underline dark:text-[#E2A856]"
                >
                  <span>Открыть в Яндекс Картах</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
