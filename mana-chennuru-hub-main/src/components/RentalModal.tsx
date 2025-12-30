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
import { MultiImageUpload } from '@/components/MultiImageUpload';

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { address: string; street: string; cost?: string; contact?: string; imageUrls?: string[] }) => Promise<void>;
  initialData?: { address: string; street: string; cost?: string; contact?: string; imageUrls?: string[] } | null;
  mode: 'add' | 'edit';
}

export const RentalModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: RentalModalProps) => {
  const [address, setAddress] = useState('');
  const [street, setStreet] = useState('');
  const [cost, setCost] = useState('');
  const [contact, setContact] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setAddress(initialData.address || '');
        setStreet(initialData.street || '');
        setCost(initialData.cost || '');
        setContact(initialData.contact || '');
        setImageUrls(initialData.imageUrls || []);
      } else {
        // Reset form for add mode
        setAddress('');
        setStreet('');
        setCost('');
        setContact('');
        setImageUrls([]);
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim() || !street.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ 
        address: address.trim(), 
        street: street.trim(),
        cost: cost.trim() || undefined,
        contact: contact.trim() || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined
      });
      onClose();
      // Reset form
      setAddress('');
      setStreet('');
      setCost('');
      setContact('');
      setImageUrls([]);
    } catch (error) {
      console.error('Error saving rental:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Rental House' : 'Edit Rental House'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="street">Street *</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Enter street name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Enter rental cost (e.g., ₹5000/month)"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Enter contact number"
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
              disabled={isSubmitting || !address.trim() || !street.trim()}
            >
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Rental' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


