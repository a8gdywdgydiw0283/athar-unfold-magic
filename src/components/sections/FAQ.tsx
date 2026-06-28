import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/i18n/locale";
import SlashDivider from "@/components/ui/SlashDivider";

type FaqItem = { q: string; a: string };

export default function FAQ() {
  const t = useTranslations("faq");
  const items = (t.raw("items") as FaqItem[]) ?? [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <SlashDivider flip />
      <section id="faq" className="section-padding bg-athar-surface/50">
        <div className="max-w-3xl mx-auto">
          <span className="section-label">{t("eyebrow")}</span>
          <h2 className="section-title mb-4">{t("headline")}</h2>
          <p className="text-athar-muted mb-12">{t("subline")}</p>

          <div className="space-y-3">
            {items.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="border border-athar-border bg-athar-black">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-6 text-start hover:bg-athar-surface/50 transition-colors duration-200"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold">{item.q}</span>
                    <span
                      className={`text-athar-slash text-xl shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 text-athar-muted leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}