import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface SectionCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  color?: "primary" | "secondary" | "accent";
}

export const SectionCard = ({ 
  title, 
  description, 
  image,
  href,
  color = "primary" 
}: SectionCardProps) => {
  const colorClasses = {
    primary: "group-hover:border-primary/60",
    secondary: "group-hover:border-secondary/60",
    accent: "group-hover:border-accent/60"
  };

  return (
    <a href={href} className="group">
      <Card className={`h-full overflow-hidden transition-all duration-300 hover:shadow-xl ${colorClasses[color]} border-2`}>
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {description}
          </p>

          <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
            Explore Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </a>
  );
};
