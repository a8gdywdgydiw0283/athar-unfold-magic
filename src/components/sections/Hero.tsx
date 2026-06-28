import { motion } from "framer-motion";
import { useLocale, useTranslations } from "@/i18n/locale";
import { SlashMotif } from "@/components/ui/Slash";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export default function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();

  return (
    <section className="relative min-h-screen flex items-center section-padding pt-32 overflow-hidden">
      <SlashMotif />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {t("eyebrow") && (
          <motion.span
            className="inline-block section-label border border-athar-border px-4 py-1.5 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("eyebrow")}
          </motion.span>
        )}

        <motion.h1
          className="section-title max-w-4xl mb-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          {t("headline_1")}
          <br />
          {t("headline_2")}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-athar-muted max-w-2xl mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {t("subline")}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
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
            className="inline-flex items-center justify-center px-8 py-3.5 border border-athar-slash/50 text-athar-white hover:border-athar-slash hover:text-athar-slash transition-colors duration-200"
          >
            {t("cta_secondary")}
          </a>
        </motion.div>

        <motion.p
          className="text-sm text-athar-slash/90 border-s-2 border-athar-slash ps-4 max-w-2xl leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {t("badge")}
        </motion.p>
      </div>
    </section>
  );
}