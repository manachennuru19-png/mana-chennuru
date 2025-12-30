import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Store, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/SectionHeader";
import { subscribeToCollection, addDocument, updateDocument, deleteDocument, orderBy } from "@/integrations/firebase/firestore";
import { Shop } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { AddEditModal } from "@/components/AddEditModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { ImageModal } from "@/components/ImageModal";
import { useTranslation } from "react-i18next";

const Shops = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [userShops, setUserShops] = useState<Shop[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Shop>('shops', (items) => {
      setAllShops(items);
      setLoading(false);
    }, orderBy('createdAt', 'desc'));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setUserShops([]);
      return;
    }
    const unsubscribe = subscribeToCollection<Shop>('shops', (items) => {
      const userFiltered = items.filter(i => i.userId === user.uid).sort((a, b) => {
        const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
        const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
        return dateB - dateA;
      });
      setUserShops(userFiltered);
    });
    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  const handleAdd = async () => {
    if (!user?.uid || !name.trim() || !description.trim() || !address.trim() || !contact.trim()) {
      toast({ title: t("common.error"), description: t("forms.pleaseFillAllFields"), variant: 'destructive' });
      return;
    }
    try {
      await addDocument<Shop>('shops', { name: name.trim(), description: description.trim(), address: address.trim(), contact: contact.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined, userId: user.uid });
      toast({ title: t("common.success"), description: t("pages.shops.addShop") + " " + t("messages.addedSuccessfully") });
      setIsAddModalOpen(false);
      setName(""); setDescription(""); setAddress(""); setContact(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message || t("messages.failedToAdd"), variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    if (!editingShop?.id || !user?.uid || editingShop.userId !== user.uid || !name.trim() || !description.trim() || !address.trim() || !contact.trim()) {
      toast({ title: t("common.error"), description: t("forms.pleaseFillAllFields"), variant: 'destructive' });
      return;
    }
    try {
      await updateDocument<Shop>('shops', editingShop.id, { name: name.trim(), description: description.trim(), address: address.trim(), contact: contact.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined });
      toast({ title: t("common.success"), description: t("pages.shops.editShop") + " " + t("messages.updatedSuccessfully") });
      setIsEditModalOpen(false);
      setEditingShop(null);
      setName(""); setDescription(""); setAddress(""); setContact(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message || t("messages.failedToUpdate"), variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!user?.uid || userId !== user.uid || !confirm(t("messages.areYouSure"))) return;
    try {
      await deleteDocument('shops', id);
      toast({ title: t("common.success"), description: t("pages.shops.editShop") + " " + t("messages.deletedSuccessfully") });
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message || t("messages.failedToDelete"), variant: 'destructive' });
    }
  };

  const openEdit = (item: Shop) => {
    if (item.userId !== user?.uid) {
      toast({ title: t("common.error"), description: t("messages.onlyEditOwn"), variant: 'destructive' });
      return;
    }
    setEditingShop(item);
    setName(item.name);
    setDescription(item.description);
    setAddress(item.address);
    setContact(item.contact);
    setImageUrls(item.imageUrls || []);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          {/* Section Header with Login/Add buttons */}
          <SectionHeader
            title={t("pages.shops.title")}
            subtitle={t("pages.shops.subtitle")}
            sectionId="shops"
            onAddNew={() => {
              setName(""); setDescription(""); setAddress(""); setContact(""); setImageUrls([]);
              setIsAddModalOpen(true);
            }}
          />

          {/* Shops Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">{t("pages.shops.loading")}</p>
            </div>
          ) : allShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allShops.map((shop) => (
                <Card key={shop.id} className="p-6 hover:shadow-md transition-shadow relative group">
                  {isAuthenticated && shop.userId === user?.uid && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(shop)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {shop.imageUrls && shop.imageUrls.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      {shop.imageUrls.map((imgUrl, idx) => (
                        <img key={idx} src={imgUrl} alt={`${shop.name} ${idx + 1}`} className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedImage(imgUrl)} />
                      ))}
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2 pr-8">
                        {shop.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {shop.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{shop.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <a href={`tel:${shop.contact}`} className="hover:text-foreground transition-colors">
                            {shop.contact}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">{t("pages.shops.noShops")}</p>
            </div>
          )}

          {/* User's Shops Section - Only for authenticated users */}
          {isAuthenticated && userShops.length > 0 && (
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <h2 className="text-2xl font-bold text-primary-foreground mb-6">
                {t("auth.hereYourContent")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userShops.map((shop) => (
                  <Card key={shop.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(shop)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => shop.id && handleDelete(shop.id, shop.userId)}
                      >
                        ×
                      </Button>
                    </div>
                    {shop.imageUrls && shop.imageUrls.length > 0 && (
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        {shop.imageUrls.map((imgUrl, idx) => (
                          <img key={idx} src={imgUrl} alt={`${shop.name} ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        ))}
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 pr-16">
                          {shop.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {shop.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{shop.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <a href={`tel:${shop.contact}`} className="hover:text-foreground transition-colors">
                              {shop.contact}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Add Shop Modal */}
      <AddEditModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t("pages.shops.addShop")} onSave={handleAdd}>
        <div className="space-y-4">
          <div><Label>{t("forms.shopName")} *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("forms.enterShopName")} /></div>
          <div><Label>{t("forms.whatAvailable")} *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("forms.describeAvailable")} rows={4} /></div>
          <div><Label>{t("forms.address")} *</Label><Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("forms.enterAddress")} rows={3} /></div>
          <div><Label>{t("forms.contactDetails")} *</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t("forms.enterContactNumber")} /></div>
          <MultiImageUpload
            onImagesUploaded={setImageUrls}
            currentImageUrls={imageUrls}
            label={t("forms.uploadImages")}
            maxImages={2}
          />
        </div>
      </AddEditModal>

      {/* Edit Shop Modal */}
      <AddEditModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingShop(null); setImageUrls([]); }} title={t("pages.shops.editShop")} onSave={handleEdit}>
        <div className="space-y-4">
          <div><Label>{t("forms.shopName")} *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("forms.enterShopName")} /></div>
          <div><Label>{t("forms.whatAvailable")} *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("forms.describeAvailable")} rows={4} /></div>
          <div><Label>{t("forms.address")} *</Label><Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("forms.enterAddress")} rows={3} /></div>
          <div><Label>{t("forms.contactDetails")} *</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t("forms.enterContactNumber")} /></div>
          <MultiImageUpload
            onImagesUploaded={setImageUrls}
            currentImageUrls={imageUrls}
            label={t("forms.uploadImages")}
            maxImages={2}
          />
        </div>
      </AddEditModal>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
        alt="Shop image"
      />
    </div>
  );
};

export default Shops;
