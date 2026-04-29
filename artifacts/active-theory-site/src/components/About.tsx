import { motion } from "framer-motion";
import { useSetting } from "@/hooks/use-content";

export function About() {
  const paragraphHtml = useSetting(
    "about_paragraph",
    "Founded in 2012, we are an independent digital production studio. We partner with brands and agencies to craft <strong>unforgettable interactive experiences</strong> that live at the intersection of design and emerging technology.",
  );
  const buttonText = useSetting("about_button", "Learn More About Us");

  return (
    <section
      id="about"
      className="w-full py-32 md:py-48 px-6 md:px-12 bg-black border-b border-white/10 flex items-center justify-center"
    >
      <div className="max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-4xl lg:text-6xl font-light uppercase leading-tight md:leading-[1.1] tracking-tight [&_strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: paragraphHtml }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 md:mt-24"
        >
          <button
            data-cursor-hover="true"
            className="px-8 py-4 border border-white/20 text-xs md:text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-300"
          >
            {buttonText}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
