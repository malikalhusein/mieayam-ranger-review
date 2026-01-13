import { Link } from "react-router-dom";
import { UtensilsCrossed, Instagram, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-bold text-foreground">{t.directory}</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t.directoryDesc}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">{t.navigation}</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t.home}
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t.about}
              </Link>
              <Link to="/compare" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t.compare}
              </Link>
              <Link to="/donation" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t.supportUs}
              </Link>
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">{t.contact}</h4>
            <div className="space-y-3">
              <a href="https://www.instagram.com/mieayamranger.id" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
                @mieayamranger.id
              </a>
              <a href="mailto:Halo@mieayamranger.web.id" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                Halo@mieayamranger.web.id
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Daerah Istimewa Yogyakarta
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Mie Ayam Ranger. {t.madeWith}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
