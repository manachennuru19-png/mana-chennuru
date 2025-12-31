import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

/**
 * Converts a Cloudinary URL to use fl_attachment transformation for forced download
 * Example: https://res.cloudinary.com/dpi1webfs/raw/upload/v123/file.pdf
 * Becomes: https://res.cloudinary.com/dpi1webfs/raw/upload/fl_attachment/v123/file.pdf
 */
const getDownloadUrl = (url: string): string => {
  try {
    // Parse the Cloudinary URL to insert fl_attachment transformation
    const urlObj = new URL(url);
    
    // Cloudinary URLs have the format: /raw/upload/[transformations]/[version]/[public_id]
    // We need to insert fl_attachment after /upload/
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    
    if (uploadIndex !== -1 && uploadIndex < pathParts.length - 1) {
      // Insert fl_attachment after 'upload'
      pathParts.splice(uploadIndex + 1, 0, 'fl_attachment');
      urlObj.pathname = pathParts.join('/');
    }
    
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return original URL
    console.error('Error processing download URL:', error);
    return url;
  }
};

export const PDFViewerModal = ({ isOpen, onClose, pdfUrl, title = "PDF Document" }: PDFViewerModalProps) => {
  const handleDownload = () => {
    const downloadUrl = getDownloadUrl(pdfUrl);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold truncate">{title}</DialogTitle>
              <DialogDescription className="mt-1">
                PDF Document Viewer
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden p-6 min-h-0">
          {pdfUrl ? (
            <div className="w-full h-full border border-border rounded-lg bg-background overflow-hidden" style={{ minHeight: '600px' }}>
              {/* 
                Display PDF using iframe with direct Cloudinary secure_url
                This URL should be publicly accessible if upload preset allows public access.
                If you see 401 errors, verify in Cloudinary Dashboard:
                1. Settings > Security > "PDF and ZIP files delivery" is ENABLED
                2. Settings > Upload > Upload presets > Access mode is "Public"
              */}
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title={title}
                style={{ minHeight: '600px', border: 'none' }}
                allow="fullscreen"
                onError={(e) => {
                  console.error('PDF iframe load error:', e);
                  console.error('PDF URL:', pdfUrl);
                  console.error('If you see 401 errors, check Cloudinary security settings for PDF delivery');
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[600px]">
              <p className="text-muted-foreground">No PDF document to display.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

