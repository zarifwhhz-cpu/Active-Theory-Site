import { motion } from "framer-motion";

const AWARDS = [
  "Awwwards Site of the Month",
  "FWA of the Day",
  "Webby Awards",
  "Cannes Lions",
  "D&AD",
  "One Show",
];

export function Marquee() {
  // Duplicate array multiple times for seamless infinity scroll
  const marqueeItems = [...AWARDS, ...AWARDS, ...AWARDS, ...AWARDS];

  return (
    <section className="w-full py-16 md:py-24 bg-[#0a0a0a] border-b border-white/10 overflow-hidden flex whitespace-nowrap">
      <motion.div 
        className="flex items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
      >
        {marqueeItems.map((award, index) => (
          <div key={index} className="flex items-center">
            <span className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>
              {award}
            </span>
            <div className="w-4 h-4 bg-white/20 mx-8 md:mx-16 rounded-full" />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
