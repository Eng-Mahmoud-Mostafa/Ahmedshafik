import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/Hero";
import { SiteFooter } from "@/components/SiteFooter";
import { ProfileSection } from "@/components/sections/ProfileSection";
import { CareerSection } from "@/components/sections/CareerSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { MediaSection } from "@/components/sections/MediaSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { getRequestLocale } from "@/i18n/server";

export default async function HomePage() {
  const locale = await getRequestLocale();

  return (
    <>
      <SiteNav />
      <main id="main">
        <Hero locale={locale} />
        <ProfileSection locale={locale} />
        <CareerSection locale={locale} />
        <AchievementsSection locale={locale} />
        <MediaSection locale={locale} />
        <ContactSection locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}