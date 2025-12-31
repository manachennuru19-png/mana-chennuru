import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Pencil, FileText, Image as ImageIcon, Download, Eye, Loader2, Upload, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/SectionHeader";
import { AddEditModal } from "@/components/AddEditModal";
import { PDFViewerModal } from "@/components/PDFViewerModal";
import { ImageModal } from "@/components/ImageModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  subscribeToCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  orderBy
} from "@/integrations/firebase/firestore";
import { ElectionCommissionDocument } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { uploadFileToCloudinary, uploadImageToCloudinary, uploadPdfToCloudinary, validateElectionFile } from "@/integrations/cloudinary";

const ElectionCommission = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [allDocuments, setAllDocuments] = useState<ElectionCommissionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ElectionCommissionDocument | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState<'pdf' | 'image'>('pdf');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // PDF viewer modal state
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string>("");
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>("");
  
  // Image viewer modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string>("");
  const [viewingImageAlt, setViewingImageAlt] = useState<string>("");

  // Subscribe to all documents (public view)
  useEffect(() => {
    const unsubscribe = subscribeToCollection<ElectionCommissionDocument>(
      'election_commission_documents',
      (documents) => {
        setAllDocuments(documents);
        setLoading(false);
      },
      orderBy('createdAt', 'desc')
    );

    return () => unsubscribe();
  }, []);

  const formatDate = (date: Date | any) => {
    if (!date) return 'N/A';
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateElectionFile(file, 10);
    if (!validation.valid) {
      toast({
        title: t("messages.uploadFailed"),
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    // Determine file type
    const detectedType = file.type === 'application/pdf' ? 'pdf' : 'image';
    setFileType(detectedType);
    setPreviewUrl(null);

    // Upload to Cloudinary
    setUploading(true);
    try {
      let uploadedUrl: string;
      if (detectedType === 'pdf') {
        uploadedUrl = await uploadPdfToCloudinary(file);
      } else {
        uploadedUrl = await uploadImageToCloudinary(file);
      }
      
      setFileUrl(uploadedUrl);
      setPreviewUrl(uploadedUrl);
      toast({
        title: t("common.success"),
        description: `${file.name} uploaded successfully!`,
      });
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      toast({
        title: t("messages.uploadFailed"),
        description: error.message || `Failed to upload ${file.name}. Please check your Cloudinary configuration.`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setFileUrl("");
    setPreviewUrl(null);
    setFileType('pdf');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAdd = async () => {
    if (!user?.uid || !title.trim() || !fileUrl.trim()) {
      toast({ 
        title: t("common.error"), 
        description: t("forms.pleaseFillAllFields"), 
        variant: 'destructive' 
      });
      return;
    }

    try {
      await addDocument<ElectionCommissionDocument>('election_commission_documents', {
        title: title.trim(),
        description: description.trim() || undefined,
        fileType,
        fileUrl: fileUrl.trim(),
        userId: user.uid,
      });
      toast({ 
        title: t("common.success"), 
        description: t("pages.electionCommission.addDocument") + " " + t("messages.addedSuccessfully") 
      });
      setIsAddModalOpen(false);
      setTitle("");
      setDescription("");
      setFileUrl("");
      setPreviewUrl(null);
      setFileType('pdf');
    } catch (error: any) {
      toast({ 
        title: t("common.error"), 
        description: error.message || t("messages.failedToAdd"), 
        variant: 'destructive' 
      });
    }
  };

  const handleEdit = async () => {
    if (!editingDocument?.id || !user?.uid || !title.trim() || !fileUrl.trim()) {
      toast({ 
        title: t("common.error"), 
        description: t("forms.pleaseFillAllFields"), 
        variant: 'destructive' 
      });
      return;
    }

    if (editingDocument.userId !== user.uid) {
      toast({ 
        title: t("common.error"), 
        description: t("messages.onlyEditOwn"), 
        variant: 'destructive' 
      });
      return;
    }

    try {
      await updateDocument<ElectionCommissionDocument>('election_commission_documents', editingDocument.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        fileType,
        fileUrl: fileUrl.trim(),
      });
      toast({ 
        title: t("common.success"), 
        description: t("pages.electionCommission.editDocument") + " " + t("messages.updatedSuccessfully") 
      });
      setIsEditModalOpen(false);
      setEditingDocument(null);
      setTitle("");
      setDescription("");
      setFileUrl("");
      setPreviewUrl(null);
      setFileType('pdf');
    } catch (error: any) {
      toast({ 
        title: t("common.error"), 
        description: error.message || t("messages.failedToUpdate"), 
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!user?.uid || userId !== user.uid || !confirm(t("messages.areYouSure"))) return;
    try {
      await deleteDocument('election_commission_documents', id);
      toast({ 
        title: t("common.success"), 
        description: t("pages.electionCommission.editDocument") + " " + t("messages.deletedSuccessfully") 
      });
    } catch (error: any) {
      toast({ 
        title: t("common.error"), 
        description: error.message || t("messages.failedToDelete"), 
        variant: 'destructive' 
      });
    }
  };

  const openEdit = (doc: ElectionCommissionDocument) => {
    if (doc.userId !== user?.uid) {
      toast({ 
        title: t("common.error"), 
        description: t("messages.onlyEditOwn"), 
        variant: 'destructive' 
      });
      return;
    }
    setEditingDocument(doc);
    setTitle(doc.title);
    setDescription(doc.description || "");
    setFileUrl(doc.fileUrl);
    setFileType(doc.fileType);
    setPreviewUrl(doc.fileUrl);
    setIsEditModalOpen(true);
  };

  /**
   * Get download URL with fl_attachment transformation for forced download
   * Converts: https://res.cloudinary.com/dpi1webfs/raw/upload/v123/file.pdf
   * To: https://res.cloudinary.com/dpi1webfs/raw/upload/fl_attachment/v123/file.pdf
   */
  const getDownloadUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const uploadIndex = pathParts.indexOf('upload');
      
      if (uploadIndex !== -1 && uploadIndex < pathParts.length - 1) {
        // Insert fl_attachment after 'upload'
        pathParts.splice(uploadIndex + 1, 0, 'fl_attachment');
        urlObj.pathname = pathParts.join('/');
      }
      
      return urlObj.toString();
    } catch (error) {
      console.error('Error processing download URL:', error);
      return url;
    }
  };

  const handleView = (url: string, title: string, fileType: 'pdf' | 'image') => {
    if (fileType === 'pdf') {
      // Open PDF in modal with iframe (works on both desktop and mobile)
      setViewingPdfUrl(url);
      setViewingPdfTitle(title);
      setIsPdfViewerOpen(true);
    } else {
      // For images, open in image modal
      setViewingImageUrl(url);
      setViewingImageAlt(title);
      setIsImageModalOpen(true);
    }
  };

  const handleDownload = (url: string, title: string, fileType: 'pdf' | 'image') => {
    let downloadUrl = url;
    
    if (fileType === 'pdf') {
      // Use fl_attachment transformation for PDFs to force download
      downloadUrl = getDownloadUrl(url);
    }
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${title}.${fileType === 'pdf' ? 'pdf' : 'jpg'}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          {/* Section Header with Login/Add buttons */}
          <SectionHeader
            title={t("pages.electionCommission.title")}
            subtitle={t("pages.electionCommission.subtitle")}
            sectionId="election-commission"
            onAddNew={() => {
              setTitle("");
              setDescription("");
              setFileUrl("");
              setPreviewUrl(null);
              setFileType('pdf');
              setIsAddModalOpen(true);
            }}
          />

          {/* Documents Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">{t("pages.electionCommission.loading")}</p>
            </div>
          ) : allDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allDocuments.map((doc) => (
                <Card key={doc.id} className="p-6 hover:shadow-md transition-shadow relative group">
                  {isAuthenticated && doc.userId === user?.uid && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => openEdit(doc)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => doc.id && handleDelete(doc.id, doc.userId)}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      {doc.fileType === 'pdf' ? (
                        <FileText className="h-5 w-5 text-primary" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-2 pr-8 break-words">
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mb-2" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {doc.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={doc.fileType === 'pdf' ? 'default' : 'secondary'}>
                          {doc.fileType.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview for images */}
                  {doc.fileType === 'image' && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={doc.fileUrl} 
                        alt={doc.title}
                        className="w-full h-48 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleView(doc.fileUrl, doc.title, doc.fileType)}
                      />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleView(doc.fileUrl, doc.title, doc.fileType)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t("pages.electionCommission.view")}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(doc.fileUrl, doc.title, doc.fileType)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("pages.electionCommission.download")}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">{t("pages.electionCommission.noDocuments")}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={isPdfViewerOpen}
        onClose={() => {
          setIsPdfViewerOpen(false);
          setViewingPdfUrl("");
          setViewingPdfTitle("");
        }}
        pdfUrl={viewingPdfUrl}
        title={viewingPdfTitle}
      />

      {/* Image Viewer Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setViewingImageUrl("");
          setViewingImageAlt("");
        }}
        imageUrl={viewingImageUrl}
        alt={viewingImageAlt}
      />

      {/* Add Document Modal */}
      <AddEditModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setTitle("");
          setDescription("");
          setFileUrl("");
          setPreviewUrl(null);
          setFileType('pdf');
        }} 
        title={t("pages.electionCommission.addDocument")} 
        onSave={handleAdd}
      >
        <div className="space-y-4">
          <div>
            <Label>{t("forms.title")} *</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder={t("forms.enterTitle")} 
            />
          </div>

          <div>
            <Label>{t("forms.description")}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("forms.enterDescription")}
              rows={3}
            />
          </div>

          <div>
            <Label>{t("pages.electionCommission.uploadFile")} *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              {t("pages.electionCommission.acceptedFormats")}
            </p>
            
            {/* File Preview */}
            {previewUrl && (
              <div className="relative mb-3">
                {fileType === 'image' ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-w-xs h-48 object-cover rounded-lg border border-border"
                  />
                ) : (
                  <div className="w-full max-w-xs p-8 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("pages.electionCommission.uploading")}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {previewUrl ? t("pages.electionCommission.changeFile") : t("pages.electionCommission.selectFile")}
                </>
              )}
            </Button>
          </div>
        </div>
      </AddEditModal>

      {/* Edit Document Modal */}
      <AddEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDocument(null);
          setTitle("");
          setDescription("");
          setFileUrl("");
          setPreviewUrl(null);
          setFileType('pdf');
        }} 
        title={t("pages.electionCommission.editDocument")} 
        onSave={handleEdit}
      >
        <div className="space-y-4">
          <div>
            <Label>{t("forms.title")} *</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder={t("forms.enterTitle")} 
            />
          </div>

          <div>
            <Label>{t("forms.description")}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("forms.enterDescription")}
              rows={3}
            />
          </div>

          <div>
            <Label>{t("pages.electionCommission.uploadFile")} *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              {t("pages.electionCommission.acceptedFormats")}
            </p>
            
            {/* Current File Preview */}
            {previewUrl && (
              <div className="relative mb-3">
                {fileType === 'image' ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-w-xs h-48 object-cover rounded-lg border border-border"
                  />
                ) : (
                  <div className="w-full max-w-xs p-8 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="file-upload-edit"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("pages.electionCommission.uploading")}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {previewUrl ? t("pages.electionCommission.changeFile") : t("pages.electionCommission.selectFile")}
                </>
              )}
            </Button>
          </div>
        </div>
      </AddEditModal>
    </div>
  );
};

export default ElectionCommission;

