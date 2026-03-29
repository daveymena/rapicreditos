import { Link } from "react-router-dom";
import { Banknote } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Banknote className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Krédit</span>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Planes
            </Link>
            <Link to="/privacidad" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Privacidad
            </Link>
            <Link to="/terminos" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Términos
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2026 Krédit. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
