import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, ArrowRight } from "lucide-react";

const posts = [
  { title: "Título do Artigo", summary: "Blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá.", date: "12 Jan 2026" },
  { title: "Título do Artigo", summary: "Blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá.", date: "5 Jan 2026" },
  { title: "Título do Artigo", summary: "Blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá blá.", date: "28 Dez 2025" },
];

const BlogSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="blog" className="py-24 md:py-32 bg-secondary/30" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-4">
            Blog & Artigos
          </h2>
          <p className="font-body text-muted-foreground">
            Reflexões e conhecimento
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {posts.map((post, i) => (
            <motion.article
              key={i}
              initial={{ y: 40, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group bg-card p-6 rounded-2xl border border-border hover:border-primary/20 hover:shadow-md transition-all duration-500 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Calendar size={14} />
                <span className="font-body text-xs">{post.date}</span>
              </div>
              <h3 className="font-display text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                {post.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                {post.summary}
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-primary font-body group-hover:gap-2 transition-all duration-300">
                Ler mais <ArrowRight size={14} />
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
