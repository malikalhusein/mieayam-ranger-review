import { useState } from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Menu, Scale } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const NavLinks = ({ mobile = false, onLinkClick }: { mobile?: boolean; onLinkClick?: () => void }) => (
    <>
      <Link 
        to="/" 
        className={`${mobile ? 'block py-2' : ''} text-sm font-medium transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4`}
        onClick={onLinkClick}
      >
        {t.home}
      </Link>
      <Link 
        to="/compare" 
        className={`${mobile ? 'block py-2' : ''} text-sm font-medium transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 flex items-center gap-1`}
        onClick={onLinkClick}
      >
        <Scale className="h-4 w-4" />
        {t.compare}
      </Link>
      <Link 
        to="/about" 
        className={`${mobile ? 'block py-2' : ''} text-sm font-medium transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4`}
        onClick={onLinkClick}
      >
        {t.about}
      </Link>
      <Link 
        to="/donation" 
        className={`${mobile ? 'block py-2' : ''} text-sm font-medium transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4`}
        onClick={onLinkClick}
      >
        {t.supportUs}
      </Link>
      <Link to="/login" onClick={onLinkClick}>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          {t.admin}
        </Button>
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60" role="navigation" aria-label="Main navigation">
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
          aria-label="Mie Ayam Ranger - Home"
        >
          <UtensilsCrossed className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Mie Ayam Ranger
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLinks />
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px]">
            <div className="flex flex-col space-y-4 mt-6">
              <NavLinks mobile onLinkClick={() => setOpen(false)} />
              <div className="flex items-center gap-2 pt-4 border-t">
                <span className="text-sm text-muted-foreground">{t.theme}:</span>
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
