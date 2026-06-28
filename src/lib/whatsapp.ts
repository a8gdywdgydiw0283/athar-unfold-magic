export const WHATSAPP_NUMBER = "201234567890";

const DEMO_MESSAGES = {
  ar: "مساء الخير. نظام أثر استلم رسالتك في 4 ثوانٍ. ده بالظبط اللي بيحصل مع كل مريض بيتواصل مع عيادتك — رد فوري، تأهيل، تسجيل. هنتواصل معاك خلال 24 ساعة.",
  en: "Good evening. ATHAR received your message in 4 seconds. This is exactly what happens when every patient contacts your clinic — instant reply, qualification, registration. We'll follow up within 24 hours.",
} as const;

export function getWhatsAppUrl(locale: "ar" | "en"): string {
  const text = encodeURIComponent(DEMO_MESSAGES[locale]);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}