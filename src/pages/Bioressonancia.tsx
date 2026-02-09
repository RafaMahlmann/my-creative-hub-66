import { motion } from "framer-motion";
import { ArrowLeft, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import bioressonanciaHero from "@/assets/bioressonancia-hero.jpg";

const analysisItems = [
  "Índices gerais de vitalidade energética",
  "Níveis de estresse fisiológico e emocional",
  "Equilíbrio energético dos principais sistemas: digestivo, respiratório, cardiovascular, endócrino, osteoarticular, nervoso e imunológico",
  "Tendências de sobrecarga hepática e renal (funcional energética)",
  "Compatibilidade energética com alimentos",
  "Sensibilidade energética a metais ou substâncias ambientais",
  "Perfil de vitaminas e minerais em nível vibracional",
  "Avaliação do terreno biológico (acidez/alcalinidade energética)",
  "Índice de oxidação/estresse oxidativo (parâmetro energético)",
  "Campo energético geral (biofrequência global)",
];

const Bioressonancia = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img
          src={bioressonanciaHero}
          alt="Análise de Biorressonância Magnética"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-background" />
        <div className="relative z-10 h-full flex flex-col justify-end container mx-auto px-6 pb-12">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="absolute top-6 left-6 flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors font-body text-sm bg-foreground/20 backdrop-blur-sm rounded-full px-4 py-2"
          >
            <ArrowLeft size={16} />
            Voltar
          </motion.button>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-7 h-7 text-primary-foreground" />
              <span className="font-body text-sm uppercase tracking-widest text-primary-foreground/80">
                Terapia Integrativa
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-primary-foreground leading-tight">
              Análise de Biorressonância
              <br />
              Magnética
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        {/* Intro */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <p className="font-display text-2xl md:text-3xl text-foreground font-light leading-relaxed italic mb-8">
            "Descubra o que o seu corpo está tentando comunicar — antes que ele precise gritar."
          </p>
          <p className="font-body text-muted-foreground leading-relaxed text-lg">
            O exame de biorressonância com bastão condutor é uma avaliação energética não invasiva que capta respostas eletromagnéticas sutis do organismo. Em poucos minutos, o sistema realiza uma leitura da biofrequência corporal e apresenta um panorama funcional do equilíbrio energético. É como se fosse um <strong className="text-foreground">"check-up vibracional"</strong>, permitindo identificar padrões de sobrecarga, estresse fisiológico e desequilíbrios energéticos antes que se manifestem de forma mais intensa.
          </p>
        </motion.div>

        {/* Section 2 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl md:text-3xl text-foreground font-light mb-6 flex items-center gap-3">
            <span className="text-primary">🌿</span> Tecnologia sutil, percepção ampliada
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed text-lg">
            O corpo humano é essencialmente eletroquímico. Cada tecido emite microfrequências específicas. O aparelho trabalha com comparação de padrões vibracionais, analisando como o organismo responde a diferentes estímulos frequenciais. O resultado é um <strong className="text-foreground">mapa energético detalhado</strong> que auxilia o terapeuta a compreender tendências funcionais, níveis de vitalidade e possíveis áreas que merecem atenção no campo integrativo.
          </p>
        </motion.div>

        {/* Section 3 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl md:text-3xl text-foreground font-light mb-6 flex items-center gap-3">
            <span className="text-primary">🔎</span> Autoconhecimento corporal em outro nível
          </h2>
          <p className="font-body text-muted-foreground leading-relaxed text-lg">
            Mais do que um exame, é uma ferramenta de consciência. Muitas vezes a pessoa sente que "algo não está bem", mas não consegue identificar o quê. A biorressonância oferece uma visão ampliada do terreno biológico, ajudando na personalização de estratégias naturais como ajustes alimentares, suplementação energética e práticas integrativas.
          </p>
        </motion.div>

        {/* What can be analyzed */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="mb-16"
        >
          <h2 className="font-display text-2xl md:text-3xl text-foreground font-light mb-8 flex items-center gap-3">
            <span className="text-primary">📊</span> O que pode ser analisado
          </h2>
          <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-6">
            Sempre descrito como análise energética ou funcional, não como diagnóstico clínico
          </p>
          <ul className="space-y-4">
            {analysisItems.map((item, i) => (
              <motion.li
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-start gap-3 font-body text-muted-foreground"
              >
                <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-accent/50 border border-border rounded-2xl p-8"
        >
          <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            ⚠️ Ressalvas Importantes
          </h3>
          <ul className="space-y-2 font-body text-sm text-muted-foreground">
            <li>• Este procedimento não substitui exames laboratoriais, diagnóstico médico ou tratamento clínico.</li>
            <li>• Não realiza diagnóstico de doenças.</li>
            <li>• Não prescreve medicamentos.</li>
            <li>• Trata-se de uma avaliação complementar de caráter integrativo e energético.</li>
            <li>• Em caso de sintomas persistentes, a orientação é procurar médico habilitado.</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Bioressonancia;
