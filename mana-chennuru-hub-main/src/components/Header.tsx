import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glassmorphic Navigation Bar */}
      <div className="container mx-auto px-4 py-3">
        <div className="relative">
          {/* Glassmorphic Background */}
          <div className="absolute inset-0 rounded-full backdrop-blur-xl border border-white/20 shadow-lg" 
               style={{
                 background: 'rgba(62, 95, 68, 0.2)',
                 backdropFilter: 'blur(20px) saturate(180%)',
                 WebkitBackdropFilter: 'blur(20px) saturate(180%)',
               }}
          />
          
          {/* Content */}
          <div className="relative flex h-14 items-center justify-between px-6">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="block">
                <h1 className="text-sm sm:text-base font-bold tracking-wide text-white drop-shadow-md leading-tight">
                  {t("header.brand")}
                </h1>
                <p className="text-[10px] sm:text-xs text-white/90 drop-shadow-sm leading-tight">
                  {t("header.subtitle")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/30 transition-all"
                    aria-label={t("header.language")}
                    style={{
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    <Globe className="h-4 w-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-xl bg-white border border-gray-200 shadow-lg min-w-[140px]">
                  <DropdownMenuItem
                    onClick={() => changeLanguage("en")}
                    className={`cursor-pointer ${i18n.language === "en" ? "bg-accent/20 text-gray-900" : "text-gray-900 hover:bg-gray-100"}`}
                  >
                    {i18n.language === "en" && <Check className="mr-2 h-4 w-4 text-primary" />}
                    <span className={i18n.language === "en" ? "font-semibold text-gray-900" : "ml-6 text-gray-900"}>English</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeLanguage("te")}
                    className={`cursor-pointer ${i18n.language === "te" ? "bg-accent/20 text-gray-900" : "text-gray-900 hover:bg-gray-100"}`}
                  >
                    {i18n.language === "te" && <Check className="mr-2 h-4 w-4 text-primary" />}
                    <span className={i18n.language === "te" ? "font-semibold text-gray-900" : "ml-6 text-gray-900"}>తెలుగు</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
