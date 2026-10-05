import type { Locale } from "@/content/types";
import { resolveContactConfig } from "@/content/contact";
import { dictionaryFor } from "@/i18n/dictionary";
import { SECTION_IDS } from "@/lib/sections";
import { SectionHeading, SectionShell } from "@/components/ui/Section";
import { ContactForm } from "./ContactForm";

/**
 * Contact section.
 *
 * `resolveContactConfig()` reads server-only environment variables, so the
 * public flag is computed on the server and passed down as a plain boolean.
 * No service credential ever reaches the client bundle.
 */
export function ContactSection({ locale }: { locale: Locale }) {
  const t = dictionaryFor(locale);
  const config = resolveContactConfig();

  return (
    <SectionShell id={SECTION_IDS.contact} labelledBy="contact-heading">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionHeading
          id="contact-heading"
          eyebrow={t.contact.eyebrow}
          title={t.contact.title}
          description={t.contact.intro}
        />

        <div className="rounded-3xl border border-charcoal-line bg-charcoal/40 p-6 sm:p-9">
          <ContactForm
            locale={locale}
            deliveryConfigured={config.isDeliveryConfigured}
            endpoint={config.endpoint}
          />
        </div>
      </div>
    </SectionShell>
  );
}