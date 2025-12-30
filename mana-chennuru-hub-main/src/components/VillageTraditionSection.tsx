import { useEffect, useRef } from 'react';
import villageImage from '@/assets/images/beauty 2.jpg';
import { useTranslation } from 'react-i18next';

export const VillageTraditionSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0');
            entry.target.classList.add('opacity-100');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="container mx-auto px-4 py-12 md:py-16 opacity-0 transition-opacity duration-1000 ease-out"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Image Section */}
        <div className="order-2 lg:order-1">
          <div className="relative rounded-xl overflow-hidden shadow-xl">
            <div className="relative">
              <img
                src={villageImage}
                alt="Village life with bullock cart and children"
                className="w-full h-auto object-cover brightness-75"
                style={{ aspectRatio: '16/9' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Text Section */}
        <div className="order-1 lg:order-2 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {t("hero.traditionTitle")}
          </h2>
          <div className="space-y-4 text-sm md:text-base text-foreground/90 leading-relaxed">
            <p>{t("hero.traditionDescription1")}</p>
            <p>{t("hero.traditionDescription2")}</p>
            <p>{t("hero.traditionDescription3")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

