import { motion } from "framer-motion";
import { useLocale, useTranslations } from "@/i18n/locale";
import SlashDivider from "@/components/ui/SlashDivider";
import { getWhatsAppUrl } from "@/lib/whatsapp";

type Pillar = { number: string; title: string; body: string };

export default function Solution() {
  const t = useTranslations("solution");
  const locale = useLocale();
  const pillars = (t.raw("pillars") as Pillar[]) ?? [];

  return (
    <>
      <SlashDivider flip />
      <section id="solution" className="section-padding bg-athar-surface/50">
        <div className="max-w-7xl mx-auto">
          <span className="section-label">{t("eyebrow")}</span>
          <h2 className="section-title max-w-3xl mb-4">{t("headline")}</h2>
          <p className="text-athar-muted text-lg max-w-2xl mb-16">{t("subline")}</p>

          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => (
              <motion.div
                key={i}
                className={`relative p-6 ${
                  i === 0
                    ? "border border-athar-slash bg-athar-black"
                    : "pl-6 border-s-2 border-athar-slash"
                }`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <span className="text-sm text-athar-slash font-bold block mb-2">
                  {pillar.number}
                </span>
                <h3 className={`font-semibold mb-3 ${i === 0 ? "text-xl md:text-2xl" : "text-xl"}`}>
                  {pillar.title}
                </h3>
                <p className="text-athar-muted leading-relaxed">{pillar.body}</p>
                {i === 1 && (
                  <a
                    href={getWhatsAppUrl(locale)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-sm text-athar-slash hover:underline"
                  >
                    {locale === "ar" ? "ابعت رسالة واتساب دلوقتي ←" : "Send a WhatsApp message now ←"}
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}