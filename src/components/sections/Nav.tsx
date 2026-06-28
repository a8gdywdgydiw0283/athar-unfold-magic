import { useTranslations } from "@/i18n/locale";
import LanguageToggle from "@/components/ui/LanguageToggle";
import logo from "@/assets/logo.png";

const navLinks = [
  { key: "services", href: "#tiers" },
  { key: "how", href: "#process" },
  { key: "proof", href: "#proof" },
  { key: "faq", href: "#faq" },
] as const;

export default function Nav() {
  const t = useTranslations("nav");

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-athar-black/80 backdrop-blur-md border-b border-athar-border">
      <nav className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt={t("logo_alt")} className="h-12 w-auto" />
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(({ key, href }) => (
            <li key={key}>
              <a
                href={href}
                className="text-sm text-athar-muted hover:text-athar-white transition-colors duration-200"
              >
                {t(`links.${key}`)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 md:gap-6">
          <LanguageToggle />
          <a
            href="/auth"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-athar-border text-athar-white text-sm font-medium hover:border-athar-slash hover:text-athar-slash transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            {t("login")}
          </a>
          <a
            href="#tiers"
            className="hidden sm:inline-flex items-center px-4 py-2 bg-athar-slash text-athar-black text-sm font-semibold hover:brightness-110 transition-all duration-200"
          >
            {t("cta")}
          </a>
        </div>
      </nav>
    </header>
  );
}