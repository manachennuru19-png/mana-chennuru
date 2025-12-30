import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bus, User, Phone, MapPin, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/SectionHeader";
import { subscribeToCollection, addDocument, updateDocument, deleteDocument, orderBy } from "@/integrations/firebase/firestore";
import { TransportInfo } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { AddEditModal } from "@/components/AddEditModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { useTranslation } from "react-i18next";

const Transport = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [allItems, setAllItems] = useState<TransportInfo[]>([]);
  const [userItems, setUserItems] = useState<TransportInfo[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TransportInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverName, setDriverName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<TransportInfo>('transport_info', (items) => {
      setAllItems(items);
      setLoading(false);
    }, orderBy('createdAt', 'desc'));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setUserItems([]);
      return;
    }
    const unsubscribe = subscribeToCollection<TransportInfo>('transport_info', (items) => {
      const userFiltered = items.filter(i => i.userId === user.uid).sort((a, b) => {
        const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
        const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
        return dateB - dateA;
      });
      setUserItems(userFiltered);
    });
    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  const handleAdd = async () => {
    if (!user?.uid || !driverName.trim() || !mobileNumber.trim() || !address.trim()) {
      toast({ title: t("common.error"), description: t("forms.pleaseFillAllFields"), variant: 'destructive' });
      return;
    }
    try {
      await addDocument<TransportInfo>('transport_info', { driverName: driverName.trim(), mobileNumber: mobileNumber.trim(), address: address.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined, userId: user.uid });
      toast({ title: t("common.success"), description: t("pages.transport.addInfo") + " " + t("messages.addedSuccessfully") });
      setIsAddModalOpen(false);
      setDriverName(""); setMobileNumber(""); setAddress(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message || t("messages.failedToAdd"), variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    if (!editingItem?.id || !user?.uid || editingItem.userId !== user.uid || !driverName.trim() || !mobileNumber.trim() || !address.trim()) {
      toast({ title: t("common.error"), description: t("forms.pleaseFillAllFields"), variant: 'destructive' });
      return;
    }
    try {
      await updateDocument<TransportInfo>('transport_info', editingItem.id, { driverName: driverName.trim(), mobileNumber: mobileNumber.trim(), address: address.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined });
      toast({ title: t("common.success"), description: t("pages.transport.editInfo") + " " + t("messages.updatedSuccessfully") });
      setIsEditModalOpen(false);
      setEditingItem(null);
      setDriverName(""); setMobileNumber(""); setAddress(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message || t("messages.failedToUpdate"), variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!user?.uid || userId !== user.uid || !confirm(t("messages.areYouSure"))) return;
    try {
      await deleteDocument('transport_info', id);
      toast({ title: t("common.success"), description: t("pages.transport.editInfo") + " " + t("messages.deletedSuccessfully") });
    } catch (error: any) {
      toast({ title: t("common.error"), description: error.message || t("messages.failedToDelete"), variant: 'destructive' });
    }
  };

  const openEdit = (item: TransportInfo) => {
    if (item.userId !== user?.uid) {
      toast({ title: t("common.error"), description: t("messages.onlyEditOwn"), variant: 'destructive' });
      return;
    }
    setEditingItem(item);
    setDriverName(item.driverName);
    setMobileNumber(item.mobileNumber);
    setAddress(item.address);
    setImageUrls(item.imageUrls || []);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          <SectionHeader title="Transport Info" subtitle="Bus routes, timings, train schedules and local transport" sectionId="transport" onAddNew={() => { setDriverName(""); setMobileNumber(""); setAddress(""); setImageUrls([]); setIsAddModalOpen(true); }} />

          {loading ? <div className="text-center py-12"><p className="text-primary-foreground/80">Loading transport info...</p></div> :
            allItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allItems.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    {isAuthenticated && item.userId === user?.uid && (
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      </div>
                    )}
                    {item.imageUrls && item.imageUrls.length > 0 && (
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        {item.imageUrls.map((imgUrl, idx) => (
                          <img key={idx} src={imgUrl} alt={`Transport ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        ))}
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg"><Bus className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 pr-8">{item.driverName}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{item.mobileNumber}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{item.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : <div className="text-center py-12"><p className="text-primary-foreground/80">{t("pages.transport.noInfo")}</p></div>
          }

          {isAuthenticated && userItems.length > 0 && (
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <h2 className="text-2xl font-bold text-primary-foreground mb-6">{t("auth.hereYourContent")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userItems.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => item.id && handleDelete(item.id, item.userId)}>×</Button>
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg"><Bus className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1 pr-16">{item.route}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-4 w-4" />
                          <span>{item.timings}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
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

      <AddEditModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t("pages.transport.addInfo")} onSave={handleAdd}>
        <div className="space-y-4">
          <div><Label>{t("forms.driverName")} *</Label><Input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder={t("forms.enterDriverName")} /></div>
          <div><Label>{t("forms.mobileNumber")} *</Label><Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder={t("forms.enterMobileNumber")} /></div>
          <div><Label>{t("forms.address")} *</Label><Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("forms.enterAddress")} rows={3} /></div>
          <MultiImageUpload
            onImagesUploaded={setImageUrls}
            currentImageUrls={imageUrls}
            label={t("forms.uploadImages")}
            maxImages={2}
          />
        </div>
      </AddEditModal>

      <AddEditModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingItem(null); setImageUrls([]); }} title={t("pages.transport.editInfo")} onSave={handleEdit}>
        <div className="space-y-4">
          <div><Label>{t("forms.driverName")} *</Label><Input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder={t("forms.enterDriverName")} /></div>
          <div><Label>{t("forms.mobileNumber")} *</Label><Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder={t("forms.enterMobileNumber")} /></div>
          <div><Label>{t("forms.address")} *</Label><Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("forms.enterAddress")} rows={3} /></div>
          <MultiImageUpload
            onImagesUploaded={setImageUrls}
            currentImageUrls={imageUrls}
            label={t("forms.uploadImages")}
            maxImages={2}
          />
        </div>
      </AddEditModal>
    </div>
  );
};

export default Transport;

