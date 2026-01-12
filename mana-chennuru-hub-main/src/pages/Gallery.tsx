import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/SectionHeader";
import { subscribeToCollection, addDocument, updateDocument, deleteDocument, orderBy } from "@/integrations/firebase/firestore";
import { GalleryItem } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { AddEditModal } from "@/components/AddEditModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const Gallery = () => {
  const { user, isAuthenticated } = useAuth();
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [userItems, setUserItems] = useState<GalleryItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string>("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<GalleryItem>('gallery_items', (items) => {
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
    const unsubscribe = subscribeToCollection<GalleryItem>('gallery_items', (items) => {
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
    if (!user?.uid || !title.trim() || !description.trim()) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    try {
      await addDocument<GalleryItem>('gallery_items', { title: title.trim(), description: description.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined, userId: user.uid });
      toast({ title: 'Success', description: 'Gallery item added successfully!' });
      setIsAddModalOpen(false);
      setTitle(""); setDescription(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add gallery item', variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    if (!editingItem?.id || !user?.uid || editingItem.userId !== user.uid || !title.trim() || !description.trim()) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    try {
      await updateDocument<GalleryItem>('gallery_items', editingItem.id, { title: title.trim(), description: description.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined });
      toast({ title: 'Success', description: 'Gallery item updated successfully!' });
      setIsEditModalOpen(false);
      setEditingItem(null);
      setTitle(""); setDescription(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update gallery item', variant: 'destructive' });
    }
  };

  const handleDeleteClick = (id: string, userId: string) => {
    if (!user?.uid || userId !== user.uid) {
      toast({ title: 'Error', description: 'You can only delete your own items', variant: 'destructive' });
      return;
    }
    setDeletingId(id);
    setDeletingUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId || !user?.uid) return;
    try {
      await deleteDocument('gallery_items', deletingId);
      toast({ title: 'Success', description: 'Gallery item deleted successfully!' });
      setDeletingId(null);
      setDeletingUserId("");
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete gallery item', variant: 'destructive' });
    }
  };

  const openEdit = (item: GalleryItem) => {
    if (item.userId !== user?.uid) {
      toast({ title: 'Error', description: 'You can only edit your own items', variant: 'destructive' });
      return;
    }
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setImageUrls(item.imageUrls || []);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          <SectionHeader title="Gallery" subtitle="Photos and videos of village events, festivals and memories" sectionId="gallery" onAddNew={() => { setTitle(""); setDescription(""); setImageUrls([]); setIsAddModalOpen(true); }} />

          {loading ? <div className="text-center py-12"><p className="text-primary-foreground/80">Loading gallery...</p></div> :
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
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg"><ImageIcon className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 pr-8">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : <div className="text-center py-12"><p className="text-primary-foreground/80">No gallery items available yet.</p></div>
          }

          {isAuthenticated && userItems.length > 0 && (
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <h2 className="text-2xl font-bold text-primary-foreground mb-6">Here's Your Updated Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userItems.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => item.id && handleDeleteClick(item.id, item.userId)}>×</Button>
                    </div>
                    {item.imageUrls && item.imageUrls.length > 0 && (
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        {item.imageUrls.map((imgUrl, idx) => (
                          <img key={idx} src={imgUrl} alt={`${item.title} ${idx + 1}`} className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedImage(imgUrl)} />
                        ))}
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg"><ImageIcon className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 pr-16">{item.title}</h3>
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

      <AddEditModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Gallery Item" onSave={handleAdd}>
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" /></div>
          <div><Label>Description *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={4} /></div>
          <MultiImageUpload
            onImagesUploaded={setImageUrls}
            currentImageUrls={imageUrls}
            label="Upload Images"
            maxImages={2}
          />
        </div>
      </AddEditModal>

      <AddEditModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingItem(null); setImageUrls([]); }} title="Edit Gallery Item" onSave={handleEdit}>
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" /></div>
          <div><Label>Description *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={4} /></div>
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
        alt="Gallery image"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
          setDeletingUserId("");
        }}
        onConfirm={handleDelete}
        title="Are you sure you want to delete this gallery item?"
        description="Are you sure you want to delete this gallery item?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default Gallery;

