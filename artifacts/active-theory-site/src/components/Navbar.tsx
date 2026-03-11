import { motion } from "framer-motion";
import { Link } from "wouter";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="fixed top-0 left-0 w-full z-40 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center mix-blend-difference text-white"
    >
      <Link href="/" className="text-2xl font-bold tracking-tighter uppercase leading-none hover:opacity-50 transition-opacity">
        AT
      </Link>
      
      <div className="flex gap-8 text-sm md:text-base font-light tracking-wide uppercase">
        <a href="#work" className="relative group overflow-hidden">
          <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">Work</span>
          <span className="absolute top-0 left-0 inline-block transition-transform duration-300 translate-y-full group-hover:translate-y-0">Work</span>
        </a>
        <a href="#about" className="relative group overflow-hidden hidden sm:block">
          <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">About</span>
          <span className="absolute top-0 left-0 inline-block transition-transform duration-300 translate-y-full group-hover:translate-y-0">About</span>
        </a>
        <a href="#contact" className="relative group overflow-hidden">
          <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">Contact</span>
          <span className="absolute top-0 left-0 inline-block transition-transform duration-300 translate-y-full group-hover:translate-y-0">Contact</span>
        </a>
      </div>
    </motion.nav>
  );
}
