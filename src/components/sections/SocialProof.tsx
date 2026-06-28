import { motion } from "framer-motion";
import { useTranslations } from "@/i18n/locale";
import SlashDivider from "@/components/ui/SlashDivider";

type Stat = { value: string; label: string };
type Testimonial = { quote: string; name: string; role: string };

export default function SocialProof() {
  const t = useTranslations("proof");
  const stats = (t.raw("stats") as Stat[]) ?? [];
  const testimonials = (t.raw("testimonials") as Testimonial[]) ?? [];

  return (
    <>
      <SlashDivider />
      <section id="proof" className="section-padding">
        <div className="max-w-7xl mx-auto">
          <span className="section-label">{t("eyebrow")}</span>
          <h2 className="section-title max-w-3xl mb-4">{t("headline")}</h2>
          <p className="text-athar-muted text-lg max-w-2xl mb-16">{t("subline")}</p>

          <div className="grid grid-cols-3 gap-6 mb-16 max-w-2xl">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="text-center md:text-start"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-athar-slash mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-athar-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <h3 className="text-xl font-semibold mb-8">{t("testimonials_headline")}</h3>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((item, i) => (
              <motion.blockquote
                key={i}
                className="bg-athar-surface border border-athar-border p-8"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <p className="text-athar-white leading-relaxed">
                  <span className="text-athar-slash text-2xl leading-none">&ldquo;</span>
                  {item.quote}
                </p>
                <footer className="mt-6 pt-6 border-t border-athar-border">
                  <cite className="not-italic font-semibold block">{item.name}</cite>
                  <span className="text-sm text-athar-muted">{item.role}</span>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}