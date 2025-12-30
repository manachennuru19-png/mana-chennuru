import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-foreground">MANA CHENNURU</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-foreground">{t("footer.emergencyServices")}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t("sections.cultureTemples")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t("sections.villageNews")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t("sections.governmentSchemes")}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t("sections.emergencyServices")}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-foreground">{t("footer.contact")}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Chennuru Village, Andhra Pradesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 8317579761</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>mana.chennuru19@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MANA CHENNURU. {t("footer.allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
};
