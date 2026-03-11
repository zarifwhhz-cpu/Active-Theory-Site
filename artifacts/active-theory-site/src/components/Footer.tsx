import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="w-full px-6 py-8 md:px-12 md:py-12 border-t border-white/10 bg-black flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0">
      <div className="flex flex-col gap-2">
        <span className="text-2xl font-bold uppercase tracking-tighter">Active Theory</span>
        <span className="text-xs text-white/40 uppercase tracking-widest">© {new Date().getFullYear()} All Rights Reserved.</span>
      </div>
      
      <div className="flex gap-8 text-xs font-light tracking-widest uppercase">
        <a href="#" data-cursor-hover="true" className="hover:text-white/50 transition-colors">Twitter</a>
        <a href="#" data-cursor-hover="true" className="hover:text-white/50 transition-colors">Instagram</a>
        <a href="#" data-cursor-hover="true" className="hover:text-white/50 transition-colors">LinkedIn</a>
      </div>
      
      <div className="text-xs font-light tracking-widest uppercase text-white/40">
        Los Angeles • Amsterdam
      </div>
    </footer>
  );
}
