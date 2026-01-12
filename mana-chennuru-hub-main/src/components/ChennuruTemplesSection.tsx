import { useState, useEffect } from "react";
import { Search, MapPin, Landmark, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { TempleImageCarousel } from "@/components/TempleImageCarousel";
import { TempleModal } from "@/components/TempleModal";
import { ImageModal } from "@/components/ImageModal";
import { useTranslation } from "react-i18next";
import { 
  subscribeToCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  orderBy
} from "@/integrations/firebase/firestore";
import { Temple } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export const ChennuruTemplesSection = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [allTemples, setAllTemples] = useState<Temple[]>([]);
  const [userTemples, setUserTemples] = useState<Temple[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemple, setEditingTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string>("");

  // Subscribe to all temples (public view)
  useEffect(() => {
    const unsubscribe = subscribeToCollection<Temple>(
      'temples',
      (temples) => {
        setAllTemples(temples);
        setLoading(false);
      },
      orderBy('createdAt', 'desc')
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to user's temples (authenticated users only)
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setUserTemples([]);
      return;
    }

    const unsubscribe = subscribeToCollection<Temple>(
      'temples',
      (temples) => {
        const userOwned = temples.filter(temple => temple.userId === user.uid);
        setUserTemples(userOwned);
      },
      orderBy('createdAt', 'desc')
    );

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  const filteredTemples = searchQuery.trim() === "" 
    ? allTemples 
    : allTemples.filter(
        (temple) =>
          (temple.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (temple.area?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      );

  const handleAddTemple = async (data: {
    name: string;
    fullName?: string;
    area: string;
    landmark: string;
    importance?: string;
    timings?: string;
    imageUrl?: string;
    galleryImageUrls?: string[];
  }) => {
    if (!user?.uid) {
      toast({
        title: t("common.error"),
        description: t("auth.loginToAdd"),
        variant: 'destructive',
      });
      return;
    }

    try {
      // Build document data, excluding undefined fields (Firebase doesn't accept undefined)
      const templeData: any = {
        name: data.name,
        area: data.area,
        landmark: data.landmark,
        userId: user.uid,
      };
      
      // Only add optional fields if they have values
      if (data.fullName) templeData.fullName = data.fullName;
      if (data.importance) templeData.importance = data.importance;
      if (data.timings) templeData.timings = data.timings;
      if (data.imageUrl) templeData.imageUrl = data.imageUrl;
      if (data.galleryImageUrls && data.galleryImageUrls.length > 0) {
        templeData.galleryImageUrls = data.galleryImageUrls;
      }
      
      await addDocument<Temple>('temples', templeData);
      toast({
        title: t("common.success"),
        description: t("pages.culture.addTemple") + " " + t("messages.addedSuccessfully"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("messages.failedToAdd"),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleEditTemple = async (data: {
    name: string;
    fullName?: string;
    area: string;
    landmark: string;
    importance?: string;
    timings?: string;
    imageUrl?: string;
    galleryImageUrls?: string[];
  }) => {
    if (!editingTemple?.id || !user?.uid) {
      toast({
        title: t("common.error"),
        description: t("messages.onlyEditOwn"),
        variant: 'destructive',
      });
      return;
    }

    // Verify user owns this temple
    if (editingTemple.userId !== user.uid) {
      toast({
        title: t("common.error"),
        description: t("messages.onlyEditOwn"),
        variant: 'destructive',
      });
      return;
    }

    try {
      // Build update data, excluding undefined fields (Firebase doesn't accept undefined)
      const updateData: any = {
        name: data.name,
        area: data.area,
        landmark: data.landmark,
      };
      
      // Only add optional fields if they have values
      if (data.fullName) updateData.fullName = data.fullName;
      if (data.importance) updateData.importance = data.importance;
      if (data.timings) updateData.timings = data.timings;
      if (data.imageUrl) updateData.imageUrl = data.imageUrl;
      if (data.galleryImageUrls && data.galleryImageUrls.length > 0) {
        updateData.galleryImageUrls = data.galleryImageUrls;
      }
      
      await updateDocument<Temple>('temples', editingTemple.id, updateData);
      toast({
        title: t("common.success"),
        description: t("pages.culture.editTemple") + " " + t("messages.updatedSuccessfully"),
      });
      setEditingTemple(null);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("messages.failedToUpdate"),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteClick = (templeId: string, templeUserId: string) => {
    if (!user?.uid || templeUserId !== user.uid) {
      toast({
        title: t("common.error"),
        description: t("messages.onlyEditOwn"),
        variant: 'destructive',
      });
      return;
    }
    setDeletingId(templeId);
    setDeletingUserId(templeUserId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTemple = async () => {
    if (!deletingId || !user?.uid) return;
    try {
      await deleteDocument('temples', deletingId);
      toast({
        title: t("common.success"),
        description: t("pages.culture.editTemple") + " " + t("messages.deletedSuccessfully"),
      });
      setDeletingId(null);
      setDeletingUserId("");
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("messages.failedToDelete"),
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (temple: Temple) => {
    if (temple.userId !== user?.uid) {
      toast({
        title: t("common.error"),
        description: t("messages.onlyEditOwn"),
        variant: 'destructive',
      });
      return;
    }
    setEditingTemple(temple);
    setIsEditModalOpen(true);
  };

  return (
    <section id="culture" className="py-12 md:py-16 bg-primary/95">
      <div className="container mx-auto px-4">
        {/* Header with Login */}
        <SectionHeader
          title={t("pages.culture.title")}
          subtitle={t("pages.culture.subtitle")}
          sectionId="culture"
          onAddNew={() => setIsAddModalOpen(true)}
        />

        {/* Search Bar */}
        <div className="max-w-md mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/60" />
            <Input
              type="text"
              placeholder={t("pages.culture.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50 focus:ring-primary-foreground/50 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Temples Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-primary-foreground/80">{t("pages.culture.loading")}</p>
          </div>
        ) : filteredTemples.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredTemples.map((temple, index) => {
              const isImageLeft = index % 2 === 0;
              
              return (
                <div
                  key={temple.id || index}
                  className="relative rounded-lg overflow-hidden border border-primary-foreground/10 hover:border-primary-foreground/20 transition-all duration-300 hover:shadow-xl group"
                >
                  <div className={`flex flex-col ${isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-0`}>
                    {/* Temple Image */}
                    {temple.imageUrl && (
                      <div className="relative md:w-1/2 overflow-hidden">
                        <img
                          src={temple.imageUrl}
                          alt={temple.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                          style={{ minHeight: '300px', maxHeight: '400px' }}
                          onClick={() => setSelectedImage(temple.imageUrl)}
                        />
                        {isAuthenticated && temple.userId === user?.uid && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-3 right-3 z-10 opacity-100 bg-primary/90 hover:bg-primary text-primary-foreground border-primary-foreground/30 shadow-md"
                            onClick={() => openEditModal(temple)}
                            aria-label={`Edit ${temple.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {/* Content Section - On Background */}
                    <div className={`p-8 md:p-10 md:w-1/2 flex flex-col justify-center ${!temple.imageUrl ? 'md:w-full' : ''} relative`}>
                      {isAuthenticated && temple.userId === user?.uid && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-4 right-4 opacity-100 z-10 bg-primary/90 hover:bg-primary text-primary-foreground border-primary-foreground/30"
                          onClick={() => openEditModal(temple)}
                          aria-label={`Edit ${temple.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3 pr-12">
                        {temple.name}
                      </h3>
                      {temple.fullName && temple.fullName !== temple.name && (
                        <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 italic">
                          {temple.fullName}
                        </p>
                      )}
                      
                      <div className="space-y-4 mt-2">
                        <div className="flex items-center gap-3 text-primary-foreground/90">
                          <MapPin className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                          <span className="text-lg md:text-xl">{temple.area}</span>
                        </div>
                        
                        {temple.landmark && (
                          <div className="flex items-center gap-3 text-primary-foreground/90">
                            <Landmark className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                            <span className="text-lg md:text-xl">{temple.landmark}</span>
                          </div>
                        )}

                        {temple.timings && (
                          <div className="text-primary-foreground/80 text-base">
                            <strong>{t("forms.timings")}:</strong> {temple.timings}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gallery Images Carousel and Importance Text */}
                  {temple.galleryImageUrls && temple.galleryImageUrls.length > 0 && (
                    <div className="px-8 md:px-10 pb-8 md:pb-10 pt-6 border-t border-primary-foreground/10">
                      <TempleImageCarousel
                        images={temple.galleryImageUrls}
                        className="mb-6"
                      />

                      {temple.importance && (
                        <div className="mt-6">
                          <h4 className="text-xl md:text-2xl font-bold text-primary-foreground mb-3">
                            {t("pages.culture.importance")}
                          </h4>
                          <p className="text-base md:text-lg text-primary-foreground/90 leading-relaxed">
                            {temple.importance}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-primary-foreground/80">{t("pages.culture.noTemples")}</p>
          </div>
        )}

        {/* User's Temples Section */}
        {isAuthenticated && userTemples.length > 0 && (
          <div className="mt-12 pt-8 border-t border-primary-foreground/20">
            <h2 className="text-2xl font-bold text-primary-foreground mb-6">
              {t("auth.hereYourContent")}
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {userTemples.map((temple, index) => {
                const isImageLeft = index % 2 === 0;
                
                return (
                  <div
                    key={temple.id || index}
                    className="relative rounded-lg overflow-hidden border border-primary-foreground/10 hover:border-primary-foreground/20 transition-all duration-300 hover:shadow-xl group"
                  >
                    <div className={`flex flex-col ${isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-0`}>
                      {temple.imageUrl && (
                        <div className="relative md:w-1/2 overflow-hidden">
                          <img
                            src={temple.imageUrl}
                            alt={temple.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            style={{ minHeight: '300px', maxHeight: '400px' }}
                          />
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-primary/90 hover:bg-primary text-primary-foreground"
                              onClick={() => openEditModal(temple)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => temple.id && handleDeleteTemple(temple.id, temple.userId)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className={`p-8 md:p-10 md:w-1/2 flex flex-col justify-center ${!temple.imageUrl ? 'md:w-full' : ''}`}>
                        <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
                          {temple.name}
                        </h3>
                        {temple.fullName && temple.fullName !== temple.name && (
                          <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 italic">
                            {temple.fullName}
                          </p>
                        )}
                        
                        <div className="space-y-4 mt-2">
                          <div className="flex items-center gap-3 text-primary-foreground/90">
                            <MapPin className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                            <span className="text-lg md:text-xl">{temple.area}</span>
                          </div>
                          
                          {temple.landmark && (
                            <div className="flex items-center gap-3 text-primary-foreground/90">
                              <Landmark className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                              <span className="text-lg md:text-xl">{temple.landmark}</span>
                            </div>
                          )}

                          {temple.timings && (
                            <div className="text-primary-foreground/80 text-base">
                              <strong>{t("forms.timings")}:</strong> {temple.timings}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {temple.galleryImageUrls && temple.galleryImageUrls.length > 0 && (
                      <div className="px-8 md:px-10 pb-8 md:pb-10 pt-6 border-t border-primary-foreground/10">
                        <TempleImageCarousel
                          images={temple.galleryImageUrls}
                          className="mb-6"
                        />

                        {temple.importance && (
                          <div className="mt-6">
                            <h4 className="text-xl md:text-2xl font-bold text-primary-foreground mb-3">
                              {t("pages.culture.importance")}
                            </h4>
                            <p className="text-base md:text-lg text-primary-foreground/90 leading-relaxed">
                              {temple.importance}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Modal */}
        <TempleModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddTemple}
          mode="add"
        />

        {/* Edit Modal */}
        <TempleModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTemple(null);
          }}
          onSave={handleEditTemple}
          initialData={editingTemple ? {
            name: editingTemple.name,
            fullName: editingTemple.fullName,
            area: editingTemple.area,
            landmark: editingTemple.landmark,
            importance: editingTemple.importance,
            timings: editingTemple.timings,
            imageUrl: editingTemple.imageUrl,
            galleryImageUrls: editingTemple.galleryImageUrls,
          } : null}
          mode="edit"
        />

        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage || ""}
          alt="Temple image"
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeletingId(null);
            setDeletingUserId("");
          }}
          onConfirm={handleDeleteTemple}
          title={t("messages.areYouSure")}
          description={t("messages.areYouSure")}
          confirmText={t("common.delete")}
          cancelText={t("common.cancel")}
          variant="destructive"
        />
      </div>
    </section>
  );
};
