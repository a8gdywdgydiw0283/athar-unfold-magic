import { useLocale, useSetLocale, useTranslations } from "@/i18n/locale";

export default function LanguageToggle() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const t = useTranslations("nav");
  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    <button
      onClick={() => setLocale(nextLocale)}
      className="text-sm text-athar-muted hover:text-athar-slash transition-colors duration-200 font-medium tracking-wide"
      aria-label={`Switch to ${nextLocale === "ar" ? "Arabic" : "English"}`}
    >
      {t("lang_toggle")}
    </button>
  );
}