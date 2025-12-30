import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel, { type EmblaOptionsType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

interface TempleImageCarouselProps {
  images: string[];
  /** Autoplay interval in milliseconds */
  intervalMs?: number;
  className?: string;
}

/**
 * Mobile‑first, 3-up image carousel with a larger centered image.
 *
 * - Shows exactly 3 images at a time (3/4 aspect ratio cards)
 * - Center image is larger, lifted, and fully opaque
 * - Side images are smaller with reduced opacity
 * - Autoplays from left to right in an infinite loop
 */
export const TempleImageCarousel: React.FC<TempleImageCarouselProps> = ({
  images,
  intervalMs = 3000,
  className,
}) => {
  if (!images || images.length === 0) return null;

  const options: EmblaOptionsType = {
    loop: true,
    align: "center",
    slidesToScroll: 1,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({
      delay: intervalMs,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={cn("w-full", className)}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((src, index) => {
            const isCenter = index === selectedIndex;

            return (
              <div
                key={index}
                className="basis-1/3 shrink-0 grow-0 px-1 md:px-2 flex items-center justify-center"
              >
                <div
                  className={cn(
                    "relative w-full overflow-visible rounded-xl",
                    "transition-all duration-500 ease-out",
                    "flex items-center justify-center",
                    isCenter ? "-translate-y-2" : "translate-y-2"
                  )}
                  style={{ aspectRatio: "3 / 4" }}
                >
                  <img
                    src={src}
                    alt={`Temple image ${index + 1}`}
                    className={cn(
                      "object-contain transition-all duration-500 ease-out",
                      "drop-shadow-[0_1px_4px_rgba(0,0,0,0.1)]",
                      "border border-white rounded-lg",
                      "max-w-[85%] max-h-[85%]"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


