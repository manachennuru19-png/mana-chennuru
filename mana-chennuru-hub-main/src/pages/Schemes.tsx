import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/SectionHeader";
import { 
  subscribeToCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  orderBy
} from "@/integrations/firebase/firestore";
import { GovernmentScheme } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { AddEditModal } from "@/components/AddEditModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { ImageModal } from "@/components/ImageModal";

const Schemes = () => {
  const { user, isAuthenticated } = useAuth();
  const [allSchemes, setAllSchemes] = useState<GovernmentScheme[]>([]);
  const [userSchemes, setUserSchemes] = useState<GovernmentScheme[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<GovernmentScheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection<GovernmentScheme>(
      'government_schemes',
      (schemes) => {
        setAllSchemes(schemes);
        setLoading(false);
      },
      orderBy('createdAt', 'desc')
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setUserSchemes([]);
      return;
    }
    const unsubscribe = subscribeToCollection<GovernmentScheme>(
      'government_schemes',
      (schemes) => {
        const userItems = schemes.filter(s => s.userId === user.uid).sort((a, b) => {
          const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
          const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
          return dateB - dateA;
        });
        setUserSchemes(userItems);
      }
    );
    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  const handleAdd = async () => {
    if (!user?.uid || !title.trim() || !description.trim()) return;
    try {
      await addDocument<GovernmentScheme>('government_schemes', {
        title: title.trim(),
        description: description.trim(),
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        userId: user.uid,
      });
      toast({ title: 'Success', description: 'Scheme added successfully!' });
      setIsAddModalOpen(false);
      setTitle("");
      setDescription("");
      setImageUrls([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add scheme', variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    if (!editingScheme?.id || !user?.uid || editingScheme.userId !== user.uid || !title.trim() || !description.trim()) return;
    try {
      await updateDocument<GovernmentScheme>('government_schemes', editingScheme.id, {
        title: title.trim(),
        description: description.trim(),
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });
      toast({ title: 'Success', description: 'Scheme updated successfully!' });
      setIsEditModalOpen(false);
      setEditingScheme(null);
      setTitle("");
      setDescription("");
      setImageUrls([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update scheme', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!user?.uid || userId !== user.uid || !confirm('Are you sure?')) return;
    try {
      await deleteDocument('government_schemes', id);
      toast({ title: 'Success', description: 'Scheme deleted successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete scheme', variant: 'destructive' });
    }
  };

  const openEdit = (scheme: GovernmentScheme) => {
    if (scheme.userId !== user?.uid) {
      toast({ title: 'Error', description: 'You can only edit your own schemes', variant: 'destructive' });
      return;
    }
    setEditingScheme(scheme);
    setTitle(scheme.title);
    setDescription(scheme.description);
    setImageUrls(scheme.imageUrls || []);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          <SectionHeader
            title="Government Schemes"
            subtitle="Access welfare schemes, subsidies and benefits information"
            sectionId="schemes"
            onAddNew={() => {
              setTitle("");
              setDescription("");
              setImageUrls([]);
              setIsAddModalOpen(true);
            }}
          />

          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">Loading schemes...</p>
            </div>
          ) : allSchemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allSchemes.map((scheme) => (
                <Card key={scheme.id} className="p-6 hover:shadow-md transition-shadow relative group">
                  {isAuthenticated && scheme.userId === user?.uid && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(scheme)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2 pr-8">{scheme.title}</h3>
                      {scheme.imageUrls && scheme.imageUrls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {scheme.imageUrls.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`Scheme ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedImage(imageUrl)}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground leading-relaxed">{scheme.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">No schemes available yet.</p>
            </div>
          )}

          {isAuthenticated && userSchemes.length > 0 && (
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <h2 className="text-2xl font-bold text-primary-foreground mb-6">Here's Your Updated Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userSchemes.map((scheme) => (
                  <Card key={scheme.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(scheme)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => scheme.id && handleDelete(scheme.id, scheme.userId)}>×</Button>
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 pr-16">{scheme.title}</h3>
                        {scheme.imageUrls && scheme.imageUrls.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {scheme.imageUrls.map((imageUrl, index) => (
                              <img
                                key={index}
                                src={imageUrl}
                                alt={`Scheme ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-border"
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed">{scheme.description}</p>
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

      <AddEditModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Government Scheme" onSave={handleAdd}>
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter scheme title" />
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={4} />
          </div>
          <div>
            <MultiImageUpload
              onImagesUploaded={setImageUrls}
              currentImageUrls={imageUrls}
              label="Upload Images"
              maxImages={2}
              maxSizeMB={10}
            />
          </div>
        </div>
      </AddEditModal>

      <AddEditModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingScheme(null); setImageUrls([]); }} title="Edit Government Scheme" onSave={handleEdit}>
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter scheme title" />
          </div>
          <div>
            <Label>Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" rows={4} />
          </div>
          <div>
            <MultiImageUpload
              onImagesUploaded={setImageUrls}
              currentImageUrls={imageUrls}
              label="Upload Images"
              maxImages={2}
              maxSizeMB={10}
            />
          </div>
        </div>
      </AddEditModal>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
        alt="Government scheme image"
      />
    </div>
  );
};

export default Schemes;


