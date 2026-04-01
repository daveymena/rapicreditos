import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronRight, 
  CheckCircle2, 
  Users, 
  Banknote, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "¡Bienvenido a Krédit Pro!",
    description: "Estamos emocionados de ayudarte a llevar tu negocio de préstamos al siguiente nivel con Inteligencia Artificial.",
    icon: <Rocket className="w-12 h-12 text-primary" />,
    color: "from-primary/20 to-primary-glow/10"
  },
  {
    title: "Gestión de Clientes",
    description: "Empieza registrando a tus clientes. Puedes hacerlo manualmente o importar una lista masiva desde un archivo CSV.",
    icon: <Users className="w-12 h-12 text-blue-500" />,
    color: "from-blue-500/20 to-blue-600/10"
  },
  {
    title: "Préstamos Inteligentes",
    description: "Crea préstamos en segundos. El sistema calculará automáticamente las cuotas e intereses por ti.",
    icon: <Banknote className="w-12 h-12 text-emerald-500" />,
    color: "from-emerald-500/20 to-emerald-600/10"
  },
  {
    title: "Automatización WhatsApp",
    description: "Conecta tu WhatsApp para que nuestra IA envíe recordatorios de cobro y responda dudas de tus clientes 24/7.",
    icon: <MessageSquare className="w-12 h-12 text-purple-500" />,
    color: "from-purple-500/20 to-purple-600/10"
  },
  {
    title: "Seguridad Robusta",
    description: "Activa el Doble Factor (2FA) en tu perfil para que solo tú puedas acceder. ¡Seguridad de nivel bancario!",
    icon: <ShieldCheck className="w-12 h-12 text-amber-500" />,
    color: "from-amber-500/20 to-amber-600/10"
  }
];

const WelcomeTour = () => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 means closed, but we check localStorage
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const tourStatus = localStorage.getItem("rc_tour_completed");
    if (!tourStatus) {
      setTimeout(() => {
        setIsVisible(true);
        setCurrentStep(0);
      }, 1500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("rc_tour_completed", "true");
    setIsVisible(false);
  };

  if (!isVisible || currentStep === -1) return null;

  const step = STEPS[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          onClick={handleComplete}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-muted flex">
            {STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-full transition-all duration-500 ${idx <= currentStep ? 'bg-primary' : 'bg-transparent'}`}
                style={{ width: `${100 / STEPS.length}%` }}
              />
            ))}
          </div>

          {/* Decorative Backlight */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[100px] bg-gradient-to-tr ${step.color} opacity-40`} />

          <div className="relative p-10 pt-14 text-center">
            <button 
              onClick={handleComplete}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Icon */}
            <motion.div
              key={currentStep + "-icon"}
              initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="mx-auto w-24 h-24 rounded-3xl bg-card border border-border/50 shadow-inner flex items-center justify-center mb-8"
            >
              {step.icon}
            </motion.div>

            {/* Text */}
            <motion.div
              key={currentStep + "-text"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 mb-10"
            >
              <h2 className="text-2xl font-black tracking-tight">{step.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed px-2">
                {step.description}
              </p>
            </motion.div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={handleComplete}
                className="flex-1 rounded-2xl h-14 font-bold text-muted-foreground"
              >
                Omitir
              </Button>
              <Button 
                onClick={handleNext}
                className="flex-[2] rounded-2xl h-14 font-black shadow-xl shadow-primary/20 bg-primary hover:bg-primary-glow text-primary-foreground group"
              >
                {currentStep === STEPS.length - 1 ? (
                  <>¡Empezar ahora! <Rocket className="ml-2 w-5 h-5" /></>
                ) : (
                  <>Siguiente <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" /></>
                )}
              </Button>
            </div>

            {/* Step indicator */}
            <div className="mt-8 flex justify-center gap-1.5">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-primary w-4' : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WelcomeTour;
