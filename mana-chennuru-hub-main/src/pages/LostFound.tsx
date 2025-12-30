import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Phone, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/SectionHeader";
import { subscribeToCollection, addDocument, updateDocument, deleteDocument, orderBy } from "@/integrations/firebase/firestore";
import { LostFoundItem } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { AddEditModal } from "@/components/AddEditModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { ImageModal } from "@/components/ImageModal";

const LostFound = () => {
  const { user, isAuthenticated } = useAuth();
  const [allItems, setAllItems] = useState<LostFoundItem[]>([]);
  const [userItems, setUserItems] = useState<LostFoundItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [contact, setContact] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<LostFoundItem>('lost_found_items', (items) => {
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
    const unsubscribe = subscribeToCollection<LostFoundItem>('lost_found_items', (items) => {
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
    if (!user?.uid || !title.trim() || !description.trim() || !category.trim() || !contact.trim()) return;
    try {
      await addDocument<LostFoundItem>('lost_found_items', { title: title.trim(), description: description.trim(), category: category.trim(), contact: contact.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined, userId: user.uid });
      toast({ title: 'Success', description: 'Lost & Found item added successfully!' });
      setIsAddModalOpen(false);
      setTitle(""); setDescription(""); setCategory(""); setContact(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add item', variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    if (!editingItem?.id || !user?.uid || editingItem.userId !== user.uid || !title.trim() || !description.trim() || !category.trim() || !contact.trim()) return;
    try {
      await updateDocument<LostFoundItem>('lost_found_items', editingItem.id, { title: title.trim(), description: description.trim(), category: category.trim(), contact: contact.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined });
      toast({ title: 'Success', description: 'Lost & Found item updated successfully!' });
      setIsEditModalOpen(false);
      setEditingItem(null);
      setTitle(""); setDescription(""); setCategory(""); setContact(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update item', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!user?.uid || userId !== user.uid || !confirm('Are you sure?')) return;
    try {
      await deleteDocument('lost_found_items', id);
      toast({ title: 'Success', description: 'Lost & Found item deleted successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete item', variant: 'destructive' });
    }
  };

  const openEdit = (item: LostFoundItem) => {
    if (item.userId !== user?.uid) {
      toast({ title: 'Error', description: 'You can only edit your own items', variant: 'destructive' });
      return;
    }
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
    setContact(item.contact);
    setImageUrls(item.imageUrls || []);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          <SectionHeader title="Lost & Found" subtitle="Report lost items or found belongings in the village" sectionId="lost-found" onAddNew={() => { setTitle(""); setDescription(""); setCategory(""); setContact(""); setImageUrls([]); setIsAddModalOpen(true); }} />

          {loading ? <div className="text-center py-12"><p className="text-primary-foreground/80">Loading items...</p></div> :
            allItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allItems.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    {isAuthenticated && item.userId === user?.uid && (
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      </div>
                    )}
                    {item.imageUrls && item.imageUrls.length > 0 && (
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        {item.imageUrls.map((imgUrl, idx) => (
                          <img key={idx} src={imgUrl} alt={`${item.title} ${idx + 1}`} className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedImage(imgUrl)} />
                        ))}
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg"><Search className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1 pr-8">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{item.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{item.contact}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : <div className="text-center py-12"><p className="text-primary-foreground/80">No lost & found items available yet.</p></div>
          }

          {isAuthenticated && userItems.length > 0 && (
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <h2 className="text-2xl font-bold text-primary-foreground mb-6">Here's Your Updated Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userItems.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => item.id && handleDelete(item.id, item.userId)}>×</Button>
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg"><Search className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1 pr-16">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{item.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{item.contact}</span>
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

      <AddEditModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Lost & Found Item" onSave={handleAdd}>
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter item title" /></div>
          <div><Label>Category *</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Lost, Found" /></div>
          <div><Label>Description *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={4} /></div>
          <div><Label>Contact *</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Enter contact information" /></div>
          <MultiImageUpload
            onImagesUploaded={setImageUrls}
            currentImageUrls={imageUrls}
            label="Upload Images"
            maxImages={2}
          />
        </div>
      </AddEditModal>

      <AddEditModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingItem(null); setImageUrls([]); }} title="Edit Lost & Found Item" onSave={handleEdit}>
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter item title" /></div>
          <div><Label>Category *</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Lost, Found" /></div>
          <div><Label>Description *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={4} /></div>
          <div><Label>Contact *</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Enter contact information" /></div>
          <MultiImageUpload
            onImagesUploaded={setImageUrls}
            currentImageUrls={imageUrls}
            label="Upload Images"
            maxImages={2}
          />
        </div>
      </AddEditModal>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
        alt="Lost & Found image"
      />
    </div>
  );
};

export default LostFound;

