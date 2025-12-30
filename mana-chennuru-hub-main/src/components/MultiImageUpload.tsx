import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImageToImgBB, validateImageFile } from '@/integrations/imgbb/service';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface MultiImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  currentImageUrls?: string[];
  label?: string;
  maxImages?: number;
  maxSizeMB?: number;
  className?: string;
}

export const MultiImageUpload = ({
  onImagesUploaded,
  currentImageUrls = [],
  label = 'Upload Images',
  maxImages = 2,
  maxSizeMB = 10,
  className = '',
}: MultiImageUploadProps) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>(currentImageUrls || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check total images limit
    if (previewUrls.length + files.length > maxImages) {
      toast({
        title: t("messages.tooManyImages"),
        description: t("messages.maxImagesMessage", { max: maxImages }),
        variant: 'destructive',
      });
      return;
    }

    // Validate all files
    for (const file of files) {
      const validation = validateImageFile(file, maxSizeMB);
      if (!validation.valid) {
        toast({
          title: t("messages.invalidImage"),
          description: validation.error || t("messages.invalidImage"),
          variant: 'destructive',
        });
        return;
      }
    }

    // Upload files in parallel for faster uploads
    setUploading(true);
    const filesToUpload = files.slice(0, maxImages - previewUrls.length);
    
    try {
      // Upload all files in parallel
      const uploadPromises = filesToUpload.map((file, index) => {
        setUploadingIndex(index);
        return uploadImageToImgBB(file, file.name);
      });

      const newUrls = await Promise.all(uploadPromises);
      
      // Update all at once after all uploads complete
      if (newUrls.length > 0) {
        const updatedUrls = [...previewUrls, ...newUrls];
        setPreviewUrls(updatedUrls);
        onImagesUploaded(updatedUrls);
      }

      setUploading(false);
      setUploadingIndex(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (newUrls.length > 0) {
        toast({
          title: t("common.success"),
          description: `${newUrls.length} ${t("messages.imagesUploaded")}`,
        });
      }
    } catch (error: any) {
      toast({
        title: t("messages.uploadFailed"),
        description: error.message || t("messages.uploadFailed"),
        variant: 'destructive',
      });
      setUploading(false);
      setUploadingIndex(null);
    }

  };

  const handleRemove = (index: number) => {
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newUrls);
    onImagesUploaded(newUrls);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label} (Max {maxImages})</Label>
      
      {/* Image Previews - Only show uploaded images */}
      {previewUrls.length > 0 && (
      <div className="grid grid-cols-2 gap-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border border-border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => handleRemove(index)}
              disabled={uploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        </div>
      )}

      {/* Upload Button - Always show if under max limit */}
      {previewUrls.length < maxImages && (
        <div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="multi-image-upload"
            multiple
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || previewUrls.length >= maxImages}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {previewUrls.length > 0 ? 'Add More Images' : 'Upload Images'}
              </>
            )}
          </Button>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, GIF, WebP. Max size: {maxSizeMB}MB per image. Max {maxImages} images.
      </p>
    </div>
  );
};

