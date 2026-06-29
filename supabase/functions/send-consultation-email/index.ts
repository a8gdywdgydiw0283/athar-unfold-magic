import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, email, whatsapp } = await req.json();
    if (!name || !email || !whatsapp) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const AGENCY_EMAIL = Deno.env.get("AGENCY_EMAIL");
    if (!RESEND_API_KEY || !AGENCY_EMAIL) {
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const timestamp = new Date().toISOString();
    const html = `
      <h2>New Consultation Request — ATHAR</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>WhatsApp:</strong> ${whatsapp}</p>
      <p><strong>Time:</strong> ${timestamp}</p>
    `;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ATHAR <onboarding@resend.dev>",
        to: [AGENCY_EMAIL],
        subject: "New Consultation Request — ATHAR",
        html,
        reply_to: email,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return new Response(JSON.stringify({ error: "Resend failed", detail: txt }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Confirmation email to the client
    const clientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background:#0A0A0A; color:#fff;">
        <h2 style="color:#C8FF00; margin:0 0 16px;">ATHAR</h2>
        <p style="font-size:16px; line-height:1.6;">مرحباً <strong>${name}</strong>،</p>
        <p style="font-size:16px; line-height:1.6;">
          تم حجز موعدك بنجاح ✅<br/>
          هنتواصل معاك قريباً على رقم الواتساب: <strong>${whatsapp}</strong>
        </p>
        <hr style="border:none; border-top:1px solid #333; margin:24px 0;" />
        <p style="font-size:14px; line-height:1.6;">
          Hi <strong>${name}</strong>,<br/>
          Your consultation has been booked successfully. We'll reach out to you shortly on WhatsApp.
        </p>
        <p style="color:#888; font-size:12px; margin-top:24px;">— ATHAR Team</p>
      </div>
    `;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ATHAR <onboarding@resend.dev>",
        to: [email],
        subject: "تم حجز موعدك — ATHAR",
        html: clientHtml,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});