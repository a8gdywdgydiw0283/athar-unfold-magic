import { motion } from "framer-motion";
import { useTranslations } from "@/i18n/locale";
import SlashDivider from "@/components/ui/SlashDivider";

export default function Founder() {
  const t = useTranslations("founder");
  return (
    <>
      <SlashDivider />
      <section id="founder" className="section-padding bg-athar-black">
        <div className="max-w-3xl mx-auto">
          <span className="section-label">{t("eyebrow")}</span>
          <motion.h2
            className="section-title mb-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            {t("headline")}
          </motion.h2>
          <motion.p
            className="text-athar-muted text-lg leading-relaxed mb-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t("body")}
          </motion.p>
          <p className="text-athar-slash text-sm font-medium">{t("signature")}</p>
        </div>
      </section>
    </>
  );
}