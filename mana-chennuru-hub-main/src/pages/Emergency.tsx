import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Phone, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/SectionHeader";
import { subscribeToCollection, addDocument, updateDocument, deleteDocument, orderBy } from "@/integrations/firebase/firestore";
import { EmergencyService } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { AddEditModal } from "@/components/AddEditModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiImageUpload } from "@/components/MultiImageUpload";

const Emergency = () => {
  const { user, isAuthenticated } = useAuth();
  const [allServices, setAllServices] = useState<EmergencyService[]>([]);
  const [userServices, setUserServices] = useState<EmergencyService[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<EmergencyService | null>(null);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<EmergencyService>('emergency_services', (items) => {
      setAllServices(items);
      setLoading(false);
    }, orderBy('createdAt', 'desc'));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setUserServices([]);
      return;
    }
    const unsubscribe = subscribeToCollection<EmergencyService>('emergency_services', (items) => {
      const userItems = items.filter(i => i.userId === user.uid).sort((a, b) => {
        const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
        const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
        return dateB - dateA;
      });
      setUserServices(userItems);
    });
    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  const handleAdd = async () => {
    if (!user?.uid || !service.trim() || !contact.trim() || !description.trim()) return;
    try {
      await addDocument<EmergencyService>('emergency_services', { service: service.trim(), contact: contact.trim(), description: description.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined, userId: user.uid });
      toast({ title: 'Success', description: 'Emergency service added successfully!' });
      setIsAddModalOpen(false);
      setService(""); setContact(""); setDescription(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add service', variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    if (!editingService?.id || !user?.uid || editingService.userId !== user.uid || !service.trim() || !contact.trim() || !description.trim()) return;
    try {
      await updateDocument<EmergencyService>('emergency_services', editingService.id, { service: service.trim(), contact: contact.trim(), description: description.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined });
      toast({ title: 'Success', description: 'Emergency service updated successfully!' });
      setIsEditModalOpen(false);
      setEditingService(null);
      setService(""); setContact(""); setDescription(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update service', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!user?.uid || userId !== user.uid || !confirm('Are you sure?')) return;
    try {
      await deleteDocument('emergency_services', id);
      toast({ title: 'Success', description: 'Emergency service deleted successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete service', variant: 'destructive' });
    }
  };

  const openEdit = (item: EmergencyService) => {
    if (item.userId !== user?.uid) {
      toast({ title: 'Error', description: 'You can only edit your own services', variant: 'destructive' });
      return;
    }
    setEditingService(item);
    setService(item.service);
    setContact(item.contact);
    setDescription(item.description);
    setImageUrls(item.imageUrls || []);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          <SectionHeader title="Emergency Services" subtitle="Quick access to police, medical, fire and ambulance services" sectionId="emergency" onAddNew={() => { setService(""); setContact(""); setDescription(""); setImageUrls([]); setIsAddModalOpen(true); }} />

          {loading ? <div className="text-center py-12"><p className="text-primary-foreground/80">Loading services...</p></div> :
            allServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allServices.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    {isAuthenticated && item.userId === user?.uid && (
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg"><AlertCircle className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1 pr-8">{item.service}</h3>
                        {item.imageUrls && item.imageUrls.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {item.imageUrls.map((imageUrl, index) => (
                              <img key={index} src={imageUrl} alt={`Emergency ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedImage(imageUrl)} />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Phone className="h-4 w-4" />
                          <span>{item.contact}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : <div className="text-center py-12"><p className="text-primary-foreground/80">No emergency services available yet.</p></div>
          }

          {isAuthenticated && userServices.length > 0 && (
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <h2 className="text-2xl font-bold text-primary-foreground mb-6">Here's Your Updated Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userServices.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => item.id && handleDelete(item.id, item.userId)}>×</Button>
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg"><AlertCircle className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1 pr-16">{item.service}</h3>
                        {item.imageUrls && item.imageUrls.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {item.imageUrls.map((imageUrl, index) => (
                              <img key={index} src={imageUrl} alt={`Emergency ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedImage(imageUrl)} />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Phone className="h-4 w-4" />
                          <span>{item.contact}</span>
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

      <AddEditModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Emergency Service" onSave={handleAdd}>
        <div className="space-y-4">
          <div><Label>Service *</Label><Input value={service} onChange={(e) => setService(e.target.value)} placeholder="e.g., Police, Ambulance" /></div>
          <div><Label>Contact *</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Enter contact number" /></div>
          <div><Label>Description *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={3} /></div>
          <div><MultiImageUpload onImagesUploaded={setImageUrls} currentImageUrls={imageUrls} label="Upload Images" maxImages={2} maxSizeMB={10} /></div>
        </div>
      </AddEditModal>

      <AddEditModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingService(null); setImageUrls([]); }} title="Edit Emergency Service" onSave={handleEdit}>
        <div className="space-y-4">
          <div><Label>Service *</Label><Input value={service} onChange={(e) => setService(e.target.value)} placeholder="e.g., Police, Ambulance" /></div>
          <div><Label>Contact *</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Enter contact number" /></div>
          <div><Label>Description *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={3} /></div>
          <div><MultiImageUpload onImagesUploaded={setImageUrls} currentImageUrls={imageUrls} label="Upload Images" maxImages={2} maxSizeMB={10} /></div>
        </div>
      </AddEditModal>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
        alt="Emergency service image"
      />
    </div>
  );
};

export default Emergency;


