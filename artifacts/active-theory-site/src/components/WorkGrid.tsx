import { motion } from "framer-motion";
import { useContent, useSetting } from "@/hooks/use-content";

export function WorkGrid() {
  const { data, isLoading } = useContent();
  const eyebrow = useSetting("works_eyebrow", "01");
  const title = useSetting("works_title", "Selected Works");
  const projects = data?.projects ?? [];

  if (isLoading && projects.length === 0) {
    return (
      <section
        id="work"
        className="min-h-screen w-full flex items-center justify-center border-t border-white/10"
      >
        <div className="text-white/50 text-sm uppercase tracking-widest animate-pulse">
          Loading Archive...
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="w-full border-t border-white/10">
      <div className="px-6 md:px-12 py-24">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-4xl font-light uppercase tracking-tight mb-16"
        >
          <sup className="text-xs mr-2 opacity-50">{eyebrow}</sup> {title}
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border-y border-white/10">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            data-cursor-hover="true"
            className="group relative bg-[#0a0a0a] p-6 md:p-16 aspect-square flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            {/* Background Image Reveal */}
            <div className="absolute inset-0 z-0">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover opacity-50 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-700 ease-out grayscale-0 md:grayscale md:group-hover:grayscale-0"
              />
            </div>

            {/* Color Accent Overlay */}
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-700 ease-out mix-blend-multiply ${project.accentColor}`}
            />

            <div className="relative z-10 flex justify-between items-start">
              <span className="text-xs md:text-sm tracking-widest uppercase opacity-50 group-hover:opacity-100 transition-opacity">
                {project.category}
              </span>
              <span className="text-xs md:text-sm tracking-widest uppercase opacity-50 group-hover:opacity-100 transition-opacity">
                {project.year}
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold uppercase tracking-tighter leading-[0.9] break-words transform group-hover:-translate-y-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                {project.title}
              </h3>
            </div>

            {/* Minimal line indicator */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-10" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
