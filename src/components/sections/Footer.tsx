import { useLocale, useTranslations } from "@/i18n/locale";
import SlashDivider from "@/components/ui/SlashDivider";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import logo from "@/assets/logo.png";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();

  return (
    <>
      <SlashDivider />
      <footer className="section-padding pt-16 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-athar-surface border border-athar-border p-8 md:p-12 mb-12 text-center">
            <h2 className="section-title text-2xl md:text-3xl mb-3">{t("cta_headline")}</h2>
            <p className="text-athar-muted mb-8">{t("cta_subline")}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#tiers"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-athar-slash text-athar-black font-semibold hover:brightness-110 transition-all duration-200"
              >
                {t("cta_primary")}
              </a>
              <a
                href={getWhatsAppUrl(locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-athar-border text-athar-white hover:border-athar-muted transition-colors duration-200"
              >
                {t("cta_whatsapp")}
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
            <div>
              <img src={logo} alt={tNav("logo_alt")} className="h-8 w-auto mb-4" />
              <p className="text-athar-muted text-sm">{t("tagline")}</p>
            </div>

            <div className="flex gap-6">
              <a href="#" className="text-sm text-athar-muted hover:text-athar-slash transition-colors duration-200">
                {t("links.privacy")}
              </a>
              <a href="#" className="text-sm text-athar-muted hover:text-athar-slash transition-colors duration-200">
                {t("links.terms")}
              </a>
            </div>
          </div>

          <div className="border-t border-athar-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-athar-muted">{t("copyright")}</p>
            <div className="w-6 h-1 bg-athar-slash rotate-[65deg]" aria-hidden="true" />
          </div>
        </div>
      </footer>
    </>
  );
}