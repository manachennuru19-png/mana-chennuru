import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/SectionHeader";
import { subscribeToCollection, addDocument, updateDocument, deleteDocument, orderBy } from "@/integrations/firebase/firestore";
import { Complaint } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { AddEditModal } from "@/components/AddEditModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { ImageModal } from "@/components/ImageModal";

const Complaints = () => {
  const { user, isAuthenticated } = useAuth();
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<Complaint>('complaints', (items) => {
      setAllComplaints(items);
      setLoading(false);
    }, orderBy('createdAt', 'desc'));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setUserComplaints([]);
      return;
    }
    const unsubscribe = subscribeToCollection<Complaint>('complaints', (items) => {
      const userItems = items.filter(i => i.userId === user.uid).sort((a, b) => {
        const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
        const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
        return dateB - dateA;
      });
      setUserComplaints(userItems);
    });
    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  const handleAdd = async () => {
    if (!user?.uid || !title.trim() || !description.trim() || !category.trim()) return;
    try {
      await addDocument<Complaint>('complaints', { title: title.trim(), description: description.trim(), category: category.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined, userId: user.uid });
      toast({ title: 'Success', description: 'Complaint added successfully!' });
      setIsAddModalOpen(false);
      setTitle(""); setDescription(""); setCategory(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add complaint', variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    if (!editingComplaint?.id || !user?.uid || editingComplaint.userId !== user.uid || !title.trim() || !description.trim() || !category.trim()) return;
    try {
      await updateDocument<Complaint>('complaints', editingComplaint.id, { title: title.trim(), description: description.trim(), category: category.trim(), imageUrls: imageUrls.length > 0 ? imageUrls : undefined });
      toast({ title: 'Success', description: 'Complaint updated successfully!' });
      setIsEditModalOpen(false);
      setEditingComplaint(null);
      setTitle(""); setDescription(""); setCategory(""); setImageUrls([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update complaint', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!user?.uid || userId !== user.uid || !confirm('Are you sure?')) return;
    try {
      await deleteDocument('complaints', id);
      toast({ title: 'Success', description: 'Complaint deleted successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete complaint', variant: 'destructive' });
    }
  };

  const openEdit = (item: Complaint) => {
    if (item.userId !== user?.uid) {
      toast({ title: 'Error', description: 'You can only edit your own complaints', variant: 'destructive' });
      return;
    }
    setEditingComplaint(item);
    setTitle(item.title);
    setDescription(item.description);
    setCategory(item.category);
    setImageUrls(item.imageUrls || []);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          <SectionHeader title="Report Problems" subtitle="File complaints about infrastructure, utilities or civic issues" sectionId="complaints" onAddNew={() => { setTitle(""); setDescription(""); setCategory(""); setImageUrls([]); setIsAddModalOpen(true); }} />

          {loading ? <div className="text-center py-12"><p className="text-primary-foreground/80">Loading complaints...</p></div> :
            allComplaints.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allComplaints.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    {isAuthenticated && item.userId === user?.uid && (
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg"><AlertTriangle className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 pr-8">{item.title}</h3>
                        {item.imageUrls && item.imageUrls.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {item.imageUrls.map((imageUrl, index) => (
                              <img key={index} src={imageUrl} alt={`Complaint ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedImage(imageUrl)} />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : <div className="text-center py-12"><p className="text-primary-foreground/80">No complaints available yet.</p></div>
          }

          {isAuthenticated && userComplaints.length > 0 && (
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <h2 className="text-2xl font-bold text-primary-foreground mb-6">Here's Your Updated Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userComplaints.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => item.id && handleDelete(item.id, item.userId)}>×</Button>
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg"><AlertTriangle className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 pr-16">{item.title}</h3>
                        {item.imageUrls && item.imageUrls.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {item.imageUrls.map((imageUrl, index) => (
                              <img key={index} src={imageUrl} alt={`Complaint ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedImage(imageUrl)} />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
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

      <AddEditModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Complaint" onSave={handleAdd}>
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter complaint title" /></div>
          <div><Label>Category *</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Infrastructure, Utilities" /></div>
          <div><Label>Description *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={4} /></div>
          <div><MultiImageUpload onImagesUploaded={setImageUrls} currentImageUrls={imageUrls} label="Upload Images" maxImages={2} maxSizeMB={10} /></div>
        </div>
      </AddEditModal>

      <AddEditModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingComplaint(null); setImageUrls([]); }} title="Edit Complaint" onSave={handleEdit}>
        <div className="space-y-4">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter complaint title" /></div>
          <div><Label>Category *</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Infrastructure, Utilities" /></div>
          <div><Label>Description *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={4} /></div>
          <div><MultiImageUpload onImagesUploaded={setImageUrls} currentImageUrls={imageUrls} label="Upload Images" maxImages={2} maxSizeMB={10} /></div>
        </div>
      </AddEditModal>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
        alt="Complaint image"
      />
    </div>
  );
};

export default Complaints;


