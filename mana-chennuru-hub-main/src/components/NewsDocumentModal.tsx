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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiImageUpload } from '@/components/MultiImageUpload';

interface NewsDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; subject: string; date: string; imageUrls?: string[] }) => Promise<void>;
  initialData?: { title: string; subject: string; date: string; imageUrls?: string[] } | null;
  mode: 'add' | 'edit';
}

export const NewsDocumentModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: NewsDocumentModalProps) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setTitle(initialData.title || '');
        setSubject(initialData.subject || '');
        setDate(initialData.date || '');
        setImageUrls(initialData.imageUrls || []);
      } else {
        // Reset form for add mode
        setTitle('');
        setSubject('');
        setDate(new Date().toISOString().split('T')[0]);
        setImageUrls([]);
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !subject.trim() || !date) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ 
        title: title.trim(), 
        subject: subject.trim(), 
        date,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined
      });
      onClose();
      // Reset form
      setTitle('');
      setSubject('');
      setDate('');
      setImageUrls([]);
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Document' : 'Edit Document'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Textarea
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter document subject/content"
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <MultiImageUpload
                onImagesUploaded={setImageUrls}
                currentImageUrls={imageUrls}
                label="Upload Images"
                maxImages={2}
                maxSizeMB={10}
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !subject.trim() || !date}
            >
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Document' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

