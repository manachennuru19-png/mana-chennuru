import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { LatestNotices } from "@/components/LatestNotices";
import { VillageTraditionSection } from "@/components/VillageTraditionSection";
import { SectionCard } from "@/components/SectionCard";
import { 
  AlertCircle, 
  Store, 
  Newspaper
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImageModal } from "@/components/ImageModal";
import { useState } from "react";

// Import section images
import cultureImage from "@/assets/section-culture.jpg";
import newsImage from "@/assets/section-news.jpg";
import electionImage from "@/assets/images/National-voters-day-history-and-significance.jpg";
import shopsImage from "@/assets/section-shops.jpg";
import rentalsImage from "@/assets/section-rentals.jpg";
import schemesImage from "@/assets/section-schemes.jpg";
import complaintsImage from "@/assets/section-complaints.jpg";
import contactsImage from "@/assets/images/Untitled design.png";
import emergencyImage from "@/assets/images/Untitled design (1).png";
import educationImage from "@/assets/section-education.jpg";
import transportImage from "@/assets/section-transport.jpg";
import agricultureImage from "@/assets/section-agriculture.jpg";
import galleryImage from "@/assets/section-gallery.jpg";
import lostFoundImage from "@/assets/section-lost-found.jpg";
import donationsImage from "@/assets/section-donations.jpg";
import villageBeautyImage from "@/assets/images/beauty1.jpg";
import tiffinImage from "@/assets/images/tiffin.jpg";

const Index = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const sections = [
    {
      title: t("sections.cultureTemples"),
      description: t("sections.cultureTemplesDesc"),
      image: cultureImage,
      href: "/culture",
      color: "primary" as const
    },
    {
      title: t("sections.villageNews"),
      description: t("sections.villageNewsDesc"),
      image: newsImage,
      href: "/news",
      color: "secondary" as const
    },
    {
      title: t("sections.electionCommission"),
      description: t("sections.electionCommissionDesc"),
      image: electionImage,
      href: "/election-commission",
      color: "accent" as const
    },
    {
      title: t("sections.rentalHouses"),
      description: t("sections.rentalHousesDesc"),
      image: rentalsImage,
      href: "/rentals",
      color: "primary" as const
    },
    {
      title: t("sections.governmentSchemes"),
      description: t("sections.governmentSchemesDesc"),
      image: schemesImage,
      href: "/schemes",
      color: "secondary" as const
    },
    {
      title: t("sections.reportProblems"),
      description: t("sections.reportProblemsDesc"),
      image: complaintsImage,
      href: "/complaints",
      color: "accent" as const
    },
    {
      title: t("sections.governmentContacts"),
      description: t("sections.governmentContactsDesc"),
      image: contactsImage,
      href: "/contacts",
      color: "primary" as const
    },
    {
      title: t("sections.emergencyServices"),
      description: t("sections.emergencyServicesDesc"),
      image: emergencyImage,
      href: "/emergency",
      color: "secondary" as const
    },
    {
      title: t("sections.educationInfo"),
      description: t("sections.educationInfoDesc"),
      image: educationImage,
      href: "/education",
      color: "accent" as const
    },
    {
      title: t("sections.transportInfo"),
      description: t("sections.transportInfoDesc"),
      image: transportImage,
      href: "/transport",
      color: "primary" as const
    },
    {
      title: t("sections.agricultureZone"),
      description: t("sections.agricultureZoneDesc"),
      image: agricultureImage,
      href: "/agriculture",
      color: "secondary" as const
    },
    {
      title: t("sections.gallery"),
      description: t("sections.galleryDesc"),
      image: galleryImage,
      href: "/gallery",
      color: "accent" as const
    },
    {
      title: t("sections.lostFound"),
      description: t("sections.lostFoundDesc"),
      image: lostFoundImage,
      href: "/lost-found",
      color: "primary" as const
    },
    {
      title: t("sections.helpDonations"),
      description: t("sections.helpDonationsDesc"),
      image: donationsImage,
      href: "/donations",
      color: "secondary" as const
    },
    {
      title: t("sections.shopsDirectory"),
      description: t("sections.shopsDirectoryDesc"),
      image: shopsImage,
      href: "/shops",
      color: "accent" as const
    },
    {
      title: t("sections.tiffinHotels"),
      description: t("sections.tiffinHotelsDesc"),
      image: tiffinImage,
      href: "/tiffin-hotels",
      color: "primary" as const
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero />
        
        {/* Latest Notices Section */}
        <LatestNotices />
        
        {/* Village Tradition Section */}
        <VillageTraditionSection />
        
        {/* Sections Grid */}
        <section id="all-services" className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t("sections.villageServices")}
              </h2>
              <p className="text-foreground/80 text-lg max-w-2xl mx-auto">
                {t("sections.villageServicesDesc")}
              </p>
            </div>

            {/* First 3 Service Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 md:mb-16">
              {sections.slice(0, 3).map((section) => (
                <SectionCard key={section.title} {...section} />
              ))}
            </div>

            {/* Village Moments Section */}
            <section className="mb-12 md:mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Image Section - Left on desktop, Top on mobile */}
                <div>
                  <div className="relative rounded-xl overflow-hidden shadow-xl">
                    <img
                      src={villageBeautyImage}
                      alt="Village moments"
                      className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ aspectRatio: '16/9' }}
                      onClick={() => setSelectedImage(villageBeautyImage)}
                    />
                  </div>
                </div>

                {/* Text Section - Right on desktop, Bottom on mobile */}
                <div className="flex items-center">
                  <div className="space-y-3">
                    <p className="text-lg md:text-xl lg:text-2xl font-medium text-foreground leading-relaxed">
                      Where the sky listens to our dreams,
                    </p>
                    <p className="text-lg md:text-xl lg:text-2xl font-medium text-foreground leading-relaxed">
                      and the earth remembers our footsteps.
                    </p>
                    <p className="text-lg md:text-xl lg:text-2xl font-medium text-foreground leading-relaxed">
                      In these quiet village moments,
                    </p>
                    <p className="text-lg md:text-xl lg:text-2xl font-medium text-foreground leading-relaxed">
                      life feels pure, slow, and deeply meaningful.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Remaining Service Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.slice(3).map((section) => (
                <SectionCard key={section.title} {...section} />
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg p-6 border border-border">
                <AlertCircle className="h-8 w-8 text-destructive mb-3" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">{t("quickActions.emergencyAlert")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("quickActions.emergencyAlertDesc")}
                </p>
                <button className="text-sm font-medium text-accent hover:underline">
                  {t("quickActions.callNow")}
                </button>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <Store className="h-8 w-8 text-status-open mb-3" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">{t("quickActions.openShopsNow")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("quickActions.openShopsNowDesc")}
                </p>
                <button className="text-sm font-medium text-accent hover:underline">
                  {t("quickActions.viewAll")}
                </button>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <Newspaper className="h-8 w-8 text-secondary mb-3" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">{t("quickActions.latestUpdate")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("quickActions.latestUpdateDesc")}
                </p>
                <button className="text-sm font-medium text-accent hover:underline">
                  {t("quickActions.readMore")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
        alt="Village moments"
      />
    </div>
  );
};

export default Index;
