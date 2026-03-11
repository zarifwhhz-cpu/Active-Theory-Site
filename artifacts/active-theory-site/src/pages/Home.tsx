import { Hero } from "@/components/Hero";
import { WorkGrid } from "@/components/WorkGrid";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Marquee } from "@/components/Marquee";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Hero />
      <WorkGrid />
      <About />
      <Services />
      <Marquee />
      <Contact />
      <Footer />
    </main>
  );
}
