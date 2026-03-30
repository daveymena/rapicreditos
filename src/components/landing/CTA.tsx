import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />

      <div className="container relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-8"
          >
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground">Comienza hoy mismo</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Transforma tu negocio de
            <span className="text-gradient-gold block mt-2">préstamos hoy</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Únete a los prestamistas que ya están cobrando más rápido y manejando su cartera de forma profesional.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="group bg-gradient-gold hover:opacity-90 text-accent-foreground shadow-glow-gold transition-all duration-300 hover:shadow-xl text-base sm:text-lg px-8 py-6 w-full sm:w-auto">
              <Link to="/register">
                Crear cuenta gratis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          <p className="mt-6 text-sm text-muted-foreground">
            No requiere tarjeta de crédito • Configuración en 2 minutos
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
