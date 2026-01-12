import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Loader2, Upload, X, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/SectionHeader";
import { AddEditModal } from "@/components/AddEditModal";
import { ImageModal } from "@/components/ImageModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { 
  subscribeToCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  orderBy
} from "@/integrations/firebase/firestore";
import { TiffinHotel } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { uploadImageToCloudinary } from "@/integrations/cloudinary";
import { Calendar } from "lucide-react";

const TiffinHotels = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [allHotels, setAllHotels] = useState<TiffinHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<TiffinHotel | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Image viewer modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string>("");
  const [viewingImageAlt, setViewingImageAlt] = useState<string>("");
  
  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string>("");

  // Subscribe to all hotels
  useEffect(() => {
    const unsubscribe = subscribeToCollection<TiffinHotel>(
      'tiffin_hotels',
      (hotels) => {
        setAllHotels(hotels);
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

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: t("messages.uploadFailed"),
        description: "Please select a valid image file (JPG, PNG, etc.)",
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: t("messages.uploadFailed"),
        description: "Image size should be less than 10MB",
        variant: 'destructive',
      });
      return;
    }

    setPreviewUrl(null);

    // Upload to Cloudinary
    setUploading(true);
    try {
      const uploadedUrl = await uploadImageToCloudinary(file);
      setImageUrl(uploadedUrl);
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

  const handleRemoveImage = () => {
    setImageUrl("");
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAdd = async () => {
    if (!user?.uid || !name.trim() || !imageUrl.trim()) {
      toast({ 
        title: t("common.error"), 
        description: t("forms.pleaseFillAllFields"), 
        variant: 'destructive' 
      });
      return;
    }

    try {
      await addDocument<TiffinHotel>('tiffin_hotels', {
        name: name.trim(),
        description: description.trim() || "",
        imageUrl: imageUrl.trim(),
        userId: user.uid,
      });
      toast({ 
        title: t("common.success"), 
        description: t("pages.tiffinHotels.addHotel") + " " + t("messages.addedSuccessfully") 
      });
      setIsAddModalOpen(false);
      setName("");
      setDescription("");
      setImageUrl("");
      setPreviewUrl(null);
    } catch (error: any) {
      toast({ 
        title: t("common.error"), 
        description: error.message || t("messages.failedToAdd"), 
        variant: 'destructive' 
      });
    }
  };

  const handleEdit = async () => {
    if (!editingHotel?.id || !user?.uid || !name.trim() || !imageUrl.trim()) {
      toast({ 
        title: t("common.error"), 
        description: t("forms.pleaseFillAllFields"), 
        variant: 'destructive' 
      });
      return;
    }

    if (editingHotel.userId !== user.uid) {
      toast({ 
        title: t("common.error"), 
        description: t("messages.onlyEditOwn"), 
        variant: 'destructive' 
      });
      return;
    }

    try {
      await updateDocument<TiffinHotel>('tiffin_hotels', editingHotel.id, {
        name: name.trim(),
        description: description.trim() || "",
        imageUrl: imageUrl.trim(),
      });
      toast({ 
        title: t("common.success"), 
        description: t("pages.tiffinHotels.editHotel") + " " + t("messages.updatedSuccessfully") 
      });
      setIsEditModalOpen(false);
      setEditingHotel(null);
      setName("");
      setDescription("");
      setImageUrl("");
      setPreviewUrl(null);
    } catch (error: any) {
      toast({ 
        title: t("common.error"), 
        description: error.message || t("messages.failedToUpdate"), 
        variant: 'destructive' 
      });
    }
  };

  const handleDeleteClick = (id: string, userId: string) => {
    if (!user?.uid || userId !== user.uid) {
      toast({ 
        title: t("common.error"), 
        description: t("messages.onlyEditOwn"), 
        variant: 'destructive' 
      });
      return;
    }
    setDeletingId(id);
    setDeletingUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId || !user?.uid) return;
    try {
      await deleteDocument('tiffin_hotels', deletingId);
      toast({ 
        title: t("common.success"), 
        description: t("pages.tiffinHotels.editHotel") + " " + t("messages.deletedSuccessfully") 
      });
      setDeletingId(null);
      setDeletingUserId("");
    } catch (error: any) {
      toast({ 
        title: t("common.error"), 
        description: error.message || t("messages.failedToDelete"), 
        variant: 'destructive' 
      });
    }
  };

  const openEdit = (hotel: TiffinHotel) => {
    if (hotel.userId !== user?.uid) {
      toast({ 
        title: t("common.error"), 
        description: t("messages.onlyEditOwn"), 
        variant: 'destructive' 
      });
      return;
    }
    setEditingHotel(hotel);
    setName(hotel.name);
    setDescription(hotel.description);
    setImageUrl(hotel.imageUrl);
    setPreviewUrl(hotel.imageUrl);
    setIsEditModalOpen(true);
  };

  const handleViewImage = (url: string, alt: string) => {
    setViewingImageUrl(url);
    setViewingImageAlt(alt);
    setIsImageModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          {/* Section Header with Login/Add buttons */}
          <SectionHeader
            title={t("pages.tiffinHotels.title")}
            subtitle={t("pages.tiffinHotels.subtitle")}
            sectionId="tiffin-hotels"
            onAddNew={() => {
              setName("");
              setDescription("");
              setImageUrl("");
              setPreviewUrl(null);
              setIsAddModalOpen(true);
            }}
          />

          {/* Hotels Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">{t("pages.tiffinHotels.loading")}</p>
            </div>
          ) : allHotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allHotels.map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden hover:shadow-md transition-shadow relative group">
                  {isAuthenticated && hotel.userId === user?.uid && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 bg-background/90" 
                        onClick={() => openEdit(hotel)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 bg-background/90"
                        onClick={() => hotel.id && handleDeleteClick(hotel.id, hotel.userId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Hotel Image */}
                  <div 
                    className="relative h-48 overflow-hidden cursor-pointer"
                    onClick={() => handleViewImage(hotel.imageUrl, hotel.name)}
                  >
                    <img 
                      src={hotel.imageUrl} 
                      alt={hotel.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-3 right-3 opacity-0 hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="bg-background/90">
                        <Eye className="h-4 w-4 mr-2" />
                        {t("pages.tiffinHotels.viewImage")}
                      </Button>
                    </div>
                  </div>

                  {/* Hotel Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2 pr-8 break-words">
                      {hotel.name}
                    </h3>
                    {hotel.description && (
                      <p className="text-sm text-muted-foreground mb-3" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {hotel.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(hotel.createdAt)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">{t("pages.tiffinHotels.noHotels")}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

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

      {/* Add Hotel Modal */}
      <AddEditModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setName("");
          setDescription("");
          setImageUrl("");
          setPreviewUrl(null);
        }} 
        title={t("pages.tiffinHotels.addHotel")} 
        onSave={handleAdd}
      >
        <div className="space-y-4">
          <div>
            <Label>{t("pages.tiffinHotels.hotelName")} *</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t("pages.tiffinHotels.enterHotelName")} 
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
            <Label>{t("pages.tiffinHotels.uploadImage")} *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              {t("pages.tiffinHotels.acceptedFormats")}
            </p>
            
            {/* Image Preview */}
            {previewUrl && (
              <div className="relative mb-3">
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
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              disabled={uploading}
              className="hidden"
              id="image-upload"
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
                  {t("pages.tiffinHotels.uploading")}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {previewUrl ? t("pages.tiffinHotels.changeImage") : t("pages.tiffinHotels.selectImage")}
                </>
              )}
            </Button>
          </div>
        </div>
      </AddEditModal>

      {/* Edit Hotel Modal */}
      <AddEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHotel(null);
          setName("");
          setDescription("");
          setImageUrl("");
          setPreviewUrl(null);
        }} 
        title={t("pages.tiffinHotels.editHotel")} 
        onSave={handleEdit}
      >
        <div className="space-y-4">
          <div>
            <Label>{t("pages.tiffinHotels.hotelName")} *</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t("pages.tiffinHotels.enterHotelName")} 
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
            <Label>{t("pages.tiffinHotels.uploadImage")} *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              {t("pages.tiffinHotels.acceptedFormats")}
            </p>
            
            {/* Current Image Preview */}
            {previewUrl && (
              <div className="relative mb-3">
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
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              disabled={uploading}
              className="hidden"
              id="image-upload-edit"
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
                  {t("pages.tiffinHotels.uploading")}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {previewUrl ? t("pages.tiffinHotels.changeImage") : t("pages.tiffinHotels.selectImage")}
                </>
              )}
            </Button>
          </div>
        </div>
      </AddEditModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
          setDeletingUserId("");
        }}
        onConfirm={handleDelete}
        title={t("messages.areYouSure")}
        description={t("messages.areYouSure")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
      />
    </div>
  );
};

export default TiffinHotels;

