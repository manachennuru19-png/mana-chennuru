import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export const ImageModal = ({ isOpen, onClose, imageUrl, alt = "Image" }: ImageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 bg-black/95 border-none">
        <div className="relative w-full h-[95vh] flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full h-10 w-10"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={imageUrl}
            alt={alt}
            className="w-full h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

