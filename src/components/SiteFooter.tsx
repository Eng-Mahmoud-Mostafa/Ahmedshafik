import type { Locale } from "@/content/types";
import { dictionaryFor } from "@/i18n/dictionary";
import { profile } from "@/content/profile";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-charcoal-line/70 bg-ink-soft py-14">
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:px-12">
        <div className="flex flex-col gap-2">
          <p className="font-display text-lg font-bold tracking-[0.18em] text-bone uppercase rtl:tracking-normal">
            {profile.name}
          </p>
          <p dir="rtl" className="font-display text-base text-egypt-red-soft">
            {profile.nameArabic}
          </p>
          <p className="text-xs text-bone-faint">
            © {year} {t.footer.rights}
          </p>
        </div>

        <div className="max-w-md space-y-2 text-xs leading-relaxed text-bone-faint">
          <p>{t.footer.disclaimer}</p>
          <p>{t.footer.modelNote}</p>
        </div>
      </div>
    </footer>
  );
}