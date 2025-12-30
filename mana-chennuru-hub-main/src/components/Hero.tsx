import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, Store, Church } from "lucide-react";
import logoImage from "@/assets/images/logooo.png";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              {t("hero.welcome")}<br />
              <span className="text-accent">MANA CHENNURU</span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-xl">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="group bg-accent text-primary hover:bg-accent/90 font-bold text-base px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1"
                onClick={() => {
                  // Scroll to the services section
                  setTimeout(() => {
                    const servicesSection = document.getElementById('all-services');
                    if (servicesSection) {
                      servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
              >
                {t("hero.exploreServices")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/shops'}
                className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2 bg-primary/20 border-primary/30 hover:bg-primary/30"
              >
                <Store className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-foreground">Explore Shops</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/culture'}
                className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2 bg-primary/20 border-primary/30 hover:bg-primary/30"
              >
                <Church className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-foreground">Explore Temples</span>
              </Button>
              <div className="text-center p-4 rounded-lg bg-primary/20 border border-primary/30 backdrop-blur flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-accent">24/7</div>
                <div className="text-sm text-foreground/90">{t("hero.support")}</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex items-center justify-center">
            <img
              src={logoImage}
              alt="Mana Chennuru Logo"
              className="w-full max-w-xs md:max-w-sm lg:max-w-md h-auto mx-auto my-8 border border-white/20 rounded-lg shadow-sm"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
