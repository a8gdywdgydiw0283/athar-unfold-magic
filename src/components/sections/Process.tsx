import { motion } from "framer-motion";
import { useTranslations } from "@/i18n/locale";
import SlashDivider from "@/components/ui/SlashDivider";

type Step = { number: string; title: string; body: string };

export default function Process() {
  const t = useTranslations("process");
  const steps = (t.raw("steps") as Step[]) ?? [];

  return (
    <>
      <SlashDivider flip />
      <section id="process" className="section-padding bg-athar-surface/50">
        <div className="max-w-7xl mx-auto">
          <span className="section-label">{t("eyebrow")}</span>
          <h2 className="section-title max-w-3xl mb-4">{t("headline")}</h2>
          <p className="text-athar-muted text-lg max-w-2xl mb-16">{t("subline")}</p>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative bg-athar-black border border-athar-border p-8"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span className="text-4xl font-bold text-athar-slash/30 block mb-4">
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                <p className="text-athar-muted text-sm leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}