import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Leaf, Video, Compass, GraduationCap, Gem, Activity, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: Leaf,
    title: "Atendimento de Campo Presencial",
    description: "Blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá.",
    videoUrl: "",
  },
  {
    icon: Video,
    title: "Atendimento à Distância",
    description: "Blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá.",
    videoUrl: "",
  },
  {
    icon: Compass,
    title: "Constelação",
    description: "Blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá.",
    videoUrl: "",
  },
  {
    icon: Activity,
    title: "Análise de Biorressonância Magnética",
    description: "Avaliação energética não invasiva que capta respostas eletromagnéticas sutis do organismo, revelando um panorama funcional do seu equilíbrio energético.",
    videoUrl: "",
    route: "/bioressonancia",
  },
  {
    icon: GraduationCap,
    title: "Curso",
    description: "Em desenvolvimento — em breve disponível.",
    videoUrl: "",
  },
  {
    icon: Gem,
    title: "Joias de Campo",
    description: "Blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá.",
    videoUrl: "",
  },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeService, setActiveService] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <section id="servicos" className="py-24 md:py-32 bg-secondary/30" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-4">
            Serviços
          </h2>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Blá blá blá blá blá blá blá blá blá blá blá
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service, i) => (
            <motion.button
              key={service.title}
              initial={{ y: 40, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onClick={() => {
                if ((service as any).route) {
                  navigate((service as any).route);
                } else {
                  setActiveService(i);
                }
              }}
              className="group text-left bg-card p-8 rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
            >
              <service.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-display text-xl font-medium text-foreground mb-2">
                {service.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Service detail modal */}
      {activeService !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveService(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveService(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              {(() => {
                const Icon = services[activeService].icon;
                return <Icon className="w-8 h-8 text-primary" />;
              })()}
              <h3 className="font-display text-2xl text-foreground">
                {services[activeService].title}
              </h3>
            </div>
            {/* Video placeholder */}
            <div className="aspect-video bg-muted rounded-xl mb-6 flex items-center justify-center border border-border">
              <Video className="w-12 h-12 text-muted-foreground/30" />
            </div>
            <p className="font-body text-muted-foreground leading-relaxed">
              {services[activeService].description} Blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá.
            </p>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default ServicesSection;
