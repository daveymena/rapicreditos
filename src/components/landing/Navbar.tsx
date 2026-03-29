import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Banknote, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-xl shadow-soft border-b border-border" : ""
      }`}
    >
      <div className="container">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Banknote className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className={`text-xl font-bold transition-colors ${isScrolled ? "text-foreground" : "text-primary-foreground"}`}>
              Krédit
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              className={`text-sm font-medium transition-colors hover:text-primary ${isScrolled ? "text-foreground" : "text-primary-foreground/80"}`}
            >
              Características
            </a>
            <Link 
              to="/login" 
              className={`text-sm font-medium transition-colors hover:text-primary ${isScrolled ? "text-foreground" : "text-primary-foreground/80"}`}
            >
              Iniciar Sesión
            </Link>
            <Button asChild className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow">
              <Link to="/register">Comenzar Gratis</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? "text-foreground" : "text-primary-foreground"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? "text-foreground" : "text-primary-foreground"}`} />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-card rounded-2xl shadow-xl p-6 mb-4"
          >
            <div className="flex flex-col gap-4">
              <a 
                href="#features" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors py-2"
              >
                Características
              </a>
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors py-2"
              >
                Iniciar Sesión
              </Link>
              <Button asChild className="bg-gradient-primary text-primary-foreground w-full">
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  Comenzar Gratis
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Navbar;
