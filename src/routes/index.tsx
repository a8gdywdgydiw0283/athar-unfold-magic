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
    <main className="min-h-screen bg-athar-black">
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
    </main>
  );
}
