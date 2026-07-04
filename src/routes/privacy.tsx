import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية — ATHAR" },
      { name: "description", content: "كيف تجمع وكالة ATHAR بيانات عملائها وتحميها — سرية المعلومات، بيانات العيادات، واستخدام أدوات الذكاء الاصطناعي." },
      { property: "og:title", content: "سياسة الخصوصية — ATHAR" },
      { property: "og:description", content: "سياسة الخصوصية الرسمية لوكالة ATHAR." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-bold text-athar-white mb-4">{title}</h2>
      <div className="space-y-3 text-athar-muted leading-relaxed text-[15px]">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-athar-black text-athar-white">
      <div className="max-w-3xl mx-auto section-padding py-16">
        <Link to="/" className="text-xs text-athar-muted hover:text-athar-slash">← الرئيسية</Link>

        <header className="mt-6 border-b border-athar-border pb-8">
          <p className="text-xs uppercase tracking-widest text-athar-slash">ATHAR</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold">سياسة الخصوصية</h1>
          <p className="mt-3 text-sm text-athar-muted">إصدار: يونيو 2026 · جميع الحقوق محفوظة © 2026 لوكالة ATHAR</p>
          <p className="text-sm text-athar-muted">athar.agency · ai@athar.agency</p>
        </header>

        <Section title="١. البيانات التي نجمعها">
          <p>عند طلبك استشارة أو التعاقد مع وكالة ATHAR، نقوم بجمع الحد الأدنى من البيانات اللازمة لتقديم الخدمة:</p>
          <ul className="list-disc pr-6 space-y-2">
            <li>الاسم، البريد الإلكتروني، ورقم الواتساب للتواصل معك بشأن طلبك.</li>
            <li>بيانات النشاط التجاري (اسم المنشأة، القطاع، حجم العمليات، الوصف التقني) لتقييم نطاق المشروع.</li>
            <li>أي بيانات إضافية تشاركها معنا طوعاً خلال مراحل تنفيذ المشروع.</li>
          </ul>
        </Section>

        <Section title="٢. سرية المعلومات والبيانات">
          <p>تلتزم وكالة ATHAR بحماية سرية جميع المعلومات التجارية الخاصة بالعميل، وتشمل:</p>
          <ul className="list-disc pr-6 space-y-2">
            <li>بيانات المرضى أو العملاء التي يوفرها العميل لأغراض الأتمتة أو التدريب.</li>
            <li>المعلومات التجارية السرية، استراتيجيات العمل، والبيانات المالية.</li>
            <li>أي معلومات يُصنِّفها العميل صراحةً على أنها سرية.</li>
          </ul>
          <p>لا نشارك بيانات العميل مع أي أطراف ثالثة إلا لأغراض تنفيذ الخدمة المتفق عليها.</p>
          <p className="rounded-md border border-athar-slash/40 bg-athar-slash/5 p-3 text-athar-white text-sm"><strong>بند خاص بالعيادات والمنشآت الطبية:</strong> تلتزم وكالة ATHAR التزاماً صارماً بعدم الوصول إلى أي بيانات طبية شخصية إلا بما يستلزمه تنفيذ الخدمة المتفق عليها، وتتعامل مع هذه البيانات وفق أعلى معايير الخصوصية المتاحة.</p>
        </Section>

        <Section title="٣. كيف نستخدم بياناتك">
          <ul className="list-disc pr-6 space-y-2">
            <li>التواصل معك بشأن استشارتك أو مشروعك.</li>
            <li>تنفيذ الخدمات التقنية المتفق عليها في العقد.</li>
            <li>تحسين جودة خدماتنا بشكل مُجمّع (Aggregated) وبدون كشف هوية أي عميل.</li>
          </ul>
        </Section>

        <Section title="٤. حقوقك في بياناتك">
          <ul className="list-disc pr-6 space-y-2">
            <li>حق الوصول إلى بياناتك الشخصية التي نحتفظ بها.</li>
            <li>حق تصحيح أي بيانات غير دقيقة.</li>
            <li>حق طلب حذف بياناتك بعد انتهاء التعاقد وبما لا يخالف الالتزامات القانونية.</li>
          </ul>
          <p>لممارسة أي من هذه الحقوق، تواصل معنا على: <a className="text-athar-slash" href="mailto:ai@athar.agency">ai@athar.agency</a></p>
        </Section>

        <Section title="٥. استخدام أدوات الذكاء الاصطناعي">
          <p>قد تستخدم وكالة ATHAR أدوات الذكاء الاصطناعي التوليدي في تطوير مكونات المشاريع. جميع المخرجات تخضع لمراجعة بشرية قبل التسليم، والمحتوى المُدرج في نماذج الذكاء الاصطناعي من بيانات العميل يبقى ملكاً حصرياً للعميل.</p>
        </Section>

        <Section title="٦. أمن البيانات">
          <p>نستخدم آليات مصادقة آمنة، صلاحيات دقيقة (Row-Level Security) على قاعدة البيانات، وسياسات وصول مقيدة على لوحة التحكم الإدارية بحيث لا يصل إليها إلا مسؤولون مصرَّح لهم.</p>
        </Section>

        <Section title="٧. التعديلات على هذه السياسة">
          <p>تحتفظ وكالة ATHAR بحق تعديل سياسة الخصوصية في أي وقت، مع إخطار العملاء الحاليين قبل ٧ أيام من سريان أي تعديلات جوهرية.</p>
          <p>لمزيد من التفاصيل حول العلاقة التعاقدية، راجع <Link to="/terms" className="text-athar-slash hover:underline">الشروط والأحكام</Link>.</p>
        </Section>

        <footer className="mt-16 pt-8 border-t border-athar-border text-center text-sm text-athar-muted">
          <p className="text-athar-white font-semibold">ATHAR — نبني المستقبل بالذكاء الاصطناعي</p>
          <p className="mt-1">athar.agency · <a className="text-athar-slash" href="mailto:ai@athar.agency">ai@athar.agency</a></p>
        </footer>
      </div>
    </main>
  );
}