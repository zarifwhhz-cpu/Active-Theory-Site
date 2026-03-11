import { motion } from "framer-motion";

export function Contact() {
  return (
    <section id="contact" className="w-full h-screen flex flex-col justify-center px-6 md:px-12 relative overflow-hidden bg-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex justify-center"
      >
        <a 
          href="mailto:hello@activetheory.net" 
          data-cursor-hover="true"
          className="group relative inline-block text-center"
        >
          <span className="text-[15vw] leading-[0.8] font-bold uppercase tracking-tighter text-white/10 group-hover:text-white transition-colors duration-700 ease-out block">
            Let's
          </span>
          <span className="text-[15vw] leading-[0.8] font-bold uppercase tracking-tighter text-white/10 group-hover:text-white transition-colors duration-700 ease-out block">
            Talk
          </span>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="px-6 py-3 bg-white text-black text-sm uppercase tracking-widest font-bold whitespace-nowrap">
              hello@activetheory.net
            </div>
          </div>
        </a>
      </motion.div>
    </section>
  );
}
