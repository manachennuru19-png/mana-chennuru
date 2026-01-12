import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MultiImageUpload } from '@/components/MultiImageUpload';
import { useTranslation } from 'react-i18next';

interface TempleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    fullName?: string;
    area: string;
    landmark: string;
    importance?: string;
    timings?: string;
    imageUrl?: string;
    galleryImageUrls?: string[];
  }) => Promise<void>;
  initialData?: {
    name: string;
    fullName?: string;
    area: string;
    landmark: string;
    importance?: string;
    timings?: string;
    imageUrl?: string;
    galleryImageUrls?: string[];
  } | null;
  mode: 'add' | 'edit';
}

export const TempleModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: TempleModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [importance, setImportance] = useState('');
  const [timings, setTimings] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setName(initialData.name || '');
        setFullName(initialData.fullName || '');
        setArea(initialData.area || '');
        setLandmark(initialData.landmark || '');
        setImportance(initialData.importance || '');
        setTimings(initialData.timings || '');
        setImageUrl(initialData.imageUrl);
        setGalleryImageUrls(initialData.galleryImageUrls || []);
      } else {
        // Reset form for add mode
        setName('');
        setFullName('');
        setArea('');
        setLandmark('');
        setImportance('');
        setTimings('');
        setImageUrl(undefined);
        setGalleryImageUrls([]);
      }
    }
  }, [isOpen, mode, initialData]);

  const handleMainImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setImageUrl(urls[0]);
    } else {
      setImageUrl(undefined);
    }
  };

  const handleGalleryImagesUpload = (urls: string[]) => {
    setGalleryImageUrls(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !area.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        fullName: fullName.trim() || undefined,
        area: area.trim(),
        landmark: landmark.trim(),
        importance: importance.trim() || undefined,
        timings: timings.trim() || undefined,
        imageUrl,
        galleryImageUrls: galleryImageUrls.length > 0 ? galleryImageUrls : undefined,
      });
      onClose();
      // Reset form
      setName('');
      setFullName('');
      setArea('');
      setLandmark('');
      setImportance('');
      setTimings('');
      setImageUrl(undefined);
      setGalleryImageUrls([]);
    } catch (error) {
      console.error('Error saving temple:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? t("pages.culture.addTemple") : t("pages.culture.editTemple")}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">{t("pages.culture.templeName")} *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("forms.enterTitle")}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="fullName">{t("pages.culture.fullName")} ({t("common.optional")})</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("pages.culture.enterFullName")}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="area">{t("forms.area")} *</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder={t("forms.enterAddress")}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="landmark">{t("pages.culture.landmark")} ({t("common.optional")})</Label>
              <Input
                id="landmark"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder={t("pages.culture.enterLandmark")}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="timings">{t("forms.timings")} ({t("common.optional")})</Label>
              <Input
                id="timings"
                value={timings}
                onChange={(e) => setTimings(e.target.value)}
                placeholder={t("forms.enterTimings")}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label>{t("pages.culture.mainImage")} ({t("common.optional")})</Label>
              <MultiImageUpload
                maxImages={1}
                initialImages={imageUrl ? [imageUrl] : []}
                onImagesUploaded={handleMainImageUpload}
              />
            </div>

            <div>
              <Label>{t("pages.culture.galleryImages")} ({t("common.optional")})</Label>
              <MultiImageUpload
                maxImages={4}
                initialImages={galleryImageUrls}
                onImagesUploaded={handleGalleryImagesUpload}
              />
            </div>

            <div>
              <Label htmlFor="importance">{t("pages.culture.importance")} ({t("common.optional")})</Label>
              <Textarea
                id="importance"
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
                placeholder={t("pages.culture.enterImportance")}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !area.trim()}
            >
              {isSubmitting ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};







