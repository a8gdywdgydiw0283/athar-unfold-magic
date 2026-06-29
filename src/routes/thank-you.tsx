import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/thank-you")({
  head: () => ({ meta: [{ title: "ATHAR — Thank You" }, { name: "robots", content: "noindex" }] }),
  component: ThankYou,
});

function ThankYou() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-athar-white flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-athar-slash/20 flex items-center justify-center text-athar-slash text-3xl">✓</div>
        <h1 className="mt-6 text-3xl font-bold">شكراً!</h1>
        <p className="mt-3 text-athar-muted">
          سنتواصل معك قريباً — Thank you! We'll be in touch shortly.
        </p>
        <Link to="/" className="inline-block mt-8 rounded-md border border-athar-slash text-athar-slash px-5 py-2.5 text-sm font-semibold hover:bg-athar-slash hover:text-athar-black transition-colors">
          الرجوع للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}