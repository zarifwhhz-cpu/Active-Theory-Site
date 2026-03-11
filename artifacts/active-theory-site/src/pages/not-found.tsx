import { Link } from "wouter";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white px-6">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[15vw] font-bold leading-none tracking-tighter uppercase mb-8"
      >
        404
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg md:text-xl font-light uppercase tracking-widest mb-12 text-white/50"
      >
        Signal lost. Page not found.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Link 
          href="/" 
          data-cursor-hover="true"
          className="px-8 py-4 border border-white/20 text-xs md:text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-300"
        >
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}
