import { useTranslations } from "@/i18n/locale";
import SlashDivider from "@/components/ui/SlashDivider";
import { Facebook, Linkedin, Instagram, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <>
      <SlashDivider />
      <footer className="section-padding pt-16 pb-8">
        <div className="max-w-7xl mx-auto">
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

          <div className="border-t border-athar-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs text-athar-muted">{t("copyright")}</p>

            <div className="flex items-center gap-5">
              <a
                href="https://facebook.com/atharclinics"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("social.facebook")}
                className="text-athar-muted hover:text-athar-slash transition-colors duration-200"
              >
                <Facebook size={20} strokeWidth={1.5} />
              </a>
              <a
                href="https://linkedin.com/company/atharclinics"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("social.linkedin")}
                className="text-athar-muted hover:text-athar-slash transition-colors duration-200"
              >
                <Linkedin size={20} strokeWidth={1.5} />
              </a>
              <a
                href="https://instagram.com/atharclinics"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("social.instagram")}
                className="text-athar-muted hover:text-athar-slash transition-colors duration-200"
              >
                <Instagram size={20} strokeWidth={1.5} />
              </a>
              <a
                href="https://x.com/atharclinics"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("social.twitter")}
                className="text-athar-muted hover:text-athar-slash transition-colors duration-200"
              >
                <Twitter size={20} strokeWidth={1.5} />
              </a>
            </div>

            <div className="w-6 h-1 bg-athar-slash rotate-[65deg]" aria-hidden="true" />
          </div>
        </div>
      </footer>
    </>
  );
}