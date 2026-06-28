import { motion } from "framer-motion";
import { useLocale, useTranslations } from "@/i18n/locale";
import SlashDivider from "@/components/ui/SlashDivider";

type TierItem = {
  id: string;
  name: string;
  arabic_name: string;
  tagline: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
};

function isMetaFeature(feature: string): boolean {
  return feature.startsWith("⏱") || feature.startsWith("💰") || feature.startsWith("✓");
}

export default function Tiers() {
  const t = useTranslations("tiers");
  const locale = useLocale();
  const items = (t.raw("items") as TierItem[]) ?? [];
  const youGetLabel = locale === "ar" ? "تحصل على:" : "You get:";

  return (
    <>
      <SlashDivider />
      <section id="tiers" className="section-padding">
        <div className="max-w-7xl mx-auto">
          <span className="section-label">{t("eyebrow")}</span>
          <h2 className="section-title max-w-3xl mb-4">{t("headline")}</h2>
          <p className="text-athar-muted text-lg max-w-2xl mb-16">{t("subline")}</p>

          <div className="grid md:grid-cols-3 gap-6">
            {items.map((tier, i) => {
              const deliverables = tier.features.filter((f) => !isMetaFeature(f));
              const meta = tier.features.filter((f) => isMetaFeature(f));

              return (
                <motion.div
                  key={tier.id}
                  className={`relative flex flex-col bg-athar-surface border p-8 ${
                    tier.popular ? "border-athar-slash md:-translate-y-2" : "border-athar-border"
                  }`}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                >
                  {tier.popular && (
                    <>
                      <div className="absolute top-0 inset-x-0 h-1 bg-athar-slash" />
                      <span className="absolute top-4 end-4 text-xs font-semibold text-athar-black bg-athar-slash px-2 py-0.5">
                        {t("popular_badge")}
                      </span>
                    </>
                  )}

                  <h3 className="text-xl font-bold text-athar-white mb-2 leading-snug">
                    {tier.tagline}
                  </h3>
                  <p className="text-athar-muted text-sm mb-4">
                    {tier.arabic_name} · {tier.name}
                  </p>
                  <p className="text-athar-white text-sm italic mb-6 leading-relaxed">
                    {tier.description}
                  </p>

                  <p className="text-xs font-semibold text-athar-slash uppercase tracking-wider mb-3">
                    {youGetLabel}
                  </p>
                  <ul className="space-y-3 mb-6 flex-1">
                    {deliverables.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-athar-slash shrink-0 rotate-45" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2 mb-8 pt-4 border-t border-athar-border">
                    {meta.map((line, mi) => (
                      <p
                        key={mi}
                        className={`text-sm leading-relaxed ${
                          line.startsWith("✓") ? "text-athar-slash font-medium" : "text-athar-muted"
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  <a
                    href="#"
                    className="inline-flex items-center justify-center w-full py-3 bg-athar-slash text-athar-black font-semibold hover:brightness-110 transition-all duration-200"
                  >
                    {tier.cta}
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}