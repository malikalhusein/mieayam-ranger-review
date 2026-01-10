import { Link } from "react-router-dom";
import { UtensilsCrossed, Instagram, Mail, MapPin } from "lucide-react";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-card border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Mie Ayam Ranger</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Direktori review warung mie ayam dengan sistem penilaian yang adil, transparan, dan objektif.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Navigasi</h4>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/donation" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Dukung Kami
              </Link>
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Kontak</h4>
            <div className="space-y-3">
              <a href="https://instagram.com/mieayamranger" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">@mieayamranger.id<Instagram className="h-4 w-4" />
                @mieayamranger
              </a>
              <a href="mailto:hello@mieayamranger.web.id" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                hello@mieayamranger.web.id
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
                Solo, Jawa Tengah
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Mie Ayam Ranger. Dibuat dengan ❤️ dan 🍜
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;