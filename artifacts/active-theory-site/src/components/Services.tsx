import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SERVICES = [
  "Web Experiences",
  "Brand Identity",
  "Interactive Campaigns",
  "Motion & 3D Design",
  "Spatial Computing"
];

export function Services() {
  return (
    <section className="w-full py-24 bg-black border-b border-white/10">
      <div className="px-6 md:px-12 mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-4xl font-light uppercase tracking-tight"
        >
          <sup className="text-xs mr-2 opacity-50">02</sup> Capabilities
        </motion.h2>
      </div>

      <div className="border-t border-white/10">
        {SERVICES.map((service, i) => (
          <motion.div 
            key={service}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            data-cursor-hover="true"
            className="border-b border-white/10 py-10 md:py-16 px-6 md:px-12 flex justify-between items-center group hover:bg-white hover:text-black transition-colors duration-500 cursor-pointer"
          >
            <h3 className="text-3xl md:text-5xl lg:text-7xl uppercase font-light tracking-tighter">
              <sup className="text-sm md:text-xl font-normal mr-4 md:mr-8 opacity-50 group-hover:opacity-100">0{i+1}</sup>
              {service}
            </h3>
            <ArrowRight className="w-8 h-8 md:w-16 md:h-16 opacity-0 group-hover:opacity-100 transform -translate-x-8 group-hover:translate-x-0 transition-all duration-500 ease-out" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
