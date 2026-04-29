import { motion } from "framer-motion";
import { useSetting } from "@/hooks/use-content";

export function Hero() {
  const line1 = useSetting("hero_line1", "WE BLEND STORY,");
  const line2 = useSetting("hero_line2", "ART & TECHNOLOGY");
  const subtitle = useSetting(
    "hero_subtitle",
    "An independent creative studio focused on high-end interactive experiences, immersive brand identities, and digital product design.",
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: "120%", rotate: 2 },
    show: {
      y: "0%",
      rotate: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative h-screen w-full flex flex-col justify-center px-6 md:px-12 overflow-hidden">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="z-10 mt-20"
      >
        <div className="overflow-hidden">
          <motion.h1
            variants={item}
            className="text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] font-bold leading-[0.85] tracking-tighter uppercase whitespace-nowrap"
          >
            {line1}
          </motion.h1>
        </div>
        <div className="overflow-hidden">
          <motion.h1
            variants={item}
            className="text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7vw] font-bold leading-[0.85] tracking-tighter uppercase whitespace-nowrap"
          >
            {line2}
          </motion.h1>
        </div>

        <div className="overflow-hidden mt-12">
          <motion.p
            variants={item}
            className="max-w-md text-sm md:text-base font-light text-white/60 tracking-wide leading-relaxed uppercase"
          >
            {subtitle}
          </motion.p>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-6 md:left-12 flex items-center gap-4 text-xs font-light tracking-widest uppercase opacity-50"
      >
        <span>Scroll</span>
        <div className="w-12 h-px bg-white/50 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full w-full bg-white"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
