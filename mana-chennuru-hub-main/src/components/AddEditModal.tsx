import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSave?: () => void;
}

export const AddEditModal = ({ isOpen, onClose, title, children, onSave }: AddEditModalProps) => {
  const { t } = useTranslation();
  const handleSave = () => {
    onSave?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {children}
        </div>

        <DialogFooter className="gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="font-semibold px-6"
          >
            {t("common.cancel")}
          </Button>
          <Button 
            onClick={handleSave}
            className="font-bold px-6 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
