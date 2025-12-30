import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImageToImgBB, validateImageFile } from '@/integrations/imgbb/service';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  label?: string;
  maxSizeMB?: number;
  className?: string;
}

export const ImageUpload = ({
  onImageUploaded,
  currentImageUrl,
  label = 'Upload Image',
  maxSizeMB = 10,
  className = '',
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file, maxSizeMB);
    if (!validation.valid) {
      toast({
        title: 'Invalid Image',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload to ImgBB
    setUploading(true);
    try {
      const imageUrl = await uploadImageToImgBB(file, file.name);
      onImageUploaded(imageUrl);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
      // Clean up preview URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      {previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full max-w-xs h-48 object-cover rounded-lg border border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
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
              {previewUrl ? 'Change Image' : 'Upload Image'}
            </>
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, GIF, WebP. Max size: {maxSizeMB}MB
      </p>
    </div>
  );
};


