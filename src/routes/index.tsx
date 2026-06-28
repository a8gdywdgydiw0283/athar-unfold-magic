import { createFileRoute } from "@tanstack/react-router";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import Tiers from "@/components/sections/Tiers";
import Process from "@/components/sections/Process";
import Founder from "@/components/sections/Founder";
import SocialProof from "@/components/sections/SocialProof";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ATHAR — WhatsApp Automation for Egyptian Clinics" },
      { name: "description", content: "From unread messages to every patient replied in 30 seconds. Less than a quarter of a receptionist. 14-day guarantee." },
      { property: "og:title", content: "ATHAR — WhatsApp Automation for Egyptian Clinics" },
      { property: "og:description", content: "From unread messages to every patient replied in 30 seconds." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen bg-athar-black overflow-hidden">
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0 m-auto w-[80vw] max-w-[900px] h-auto opacity-[0.04] z-0"
      />
      <div className="relative z-10">
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <Tiers />
      <Process />
      <Founder />
      <SocialProof />
      <FAQ />
      <Footer />
      </div>
    </main>
  );
}
