import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NewsDocumentModal } from "@/components/NewsDocumentModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageModal } from "@/components/ImageModal";
import { 
  subscribeToCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  orderBy
} from "@/integrations/firebase/firestore";
import { VillageNewsDocument } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";

const News = () => {
  const { user, isAuthenticated } = useAuth();
  const [allDocuments, setAllDocuments] = useState<VillageNewsDocument[]>([]);
  const [userDocuments, setUserDocuments] = useState<VillageNewsDocument[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<VillageNewsDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Subscribe to all documents (public view)
  useEffect(() => {
    const unsubscribe = subscribeToCollection<VillageNewsDocument>(
      'village_news_documents',
      (documents) => {
        setAllDocuments(documents);
        setLoading(false);
      },
      orderBy('date', 'desc')
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to user's documents (authenticated users only)
  // Filter by userId on client side to avoid composite index requirement
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setUserDocuments([]);
      return;
    }

    const unsubscribe = subscribeToCollection<VillageNewsDocument>(
      'village_news_documents',
      (documents) => {
        // Filter by userId and sort by date on client side
        const userDocs = documents
          .filter(doc => doc.userId === user.uid)
          .sort((a, b) => {
            const dateA = typeof a.date === 'string' ? new Date(a.date).getTime() : (a.date instanceof Date ? a.date.getTime() : 0);
            const dateB = typeof b.date === 'string' ? new Date(b.date).getTime() : (b.date instanceof Date ? b.date.getTime() : 0);
            return dateB - dateA; // Descending order
          });
        setUserDocuments(userDocs);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleAddDocument = async (data: { title: string; subject: string; date: string; imageUrls?: string[] }) => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add documents',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addDocument<VillageNewsDocument>('village_news_documents', {
        title: data.title,
        subject: data.subject,
        date: data.date,
        imageUrls: data.imageUrls,
        userId: user.uid,
      });
      toast({
        title: 'Success',
        description: 'Document added successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add document',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleEditDocument = async (data: { title: string; subject: string; date: string; imageUrls?: string[] }) => {
    if (!editingDocument?.id || !user?.uid) {
      toast({
        title: 'Error',
        description: 'Cannot edit this document',
        variant: 'destructive',
      });
      return;
    }

    // Verify user owns this document
    if (editingDocument.userId !== user.uid) {
      toast({
        title: 'Error',
        description: 'You can only edit your own documents',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateDocument<VillageNewsDocument>('village_news_documents', editingDocument.id, {
        title: data.title,
        subject: data.subject,
        date: data.date,
        imageUrls: data.imageUrls,
      });
      toast({
        title: 'Success',
        description: 'Document updated successfully!',
      });
      setEditingDocument(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update document',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteDocument = async (docId: string, docUserId: string) => {
    if (!user?.uid || docUserId !== user.uid) {
      toast({
        title: 'Error',
        description: 'You can only delete your own documents',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocument('village_news_documents', docId);
      toast({
        title: 'Success',
        description: 'Document deleted successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (document: VillageNewsDocument) => {
    if (document.userId !== user?.uid) {
      toast({
        title: 'Error',
        description: 'You can only edit your own documents',
        variant: 'destructive',
      });
      return;
    }
    setEditingDocument(document);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          {/* Section Header with Login/Add buttons */}
          <SectionHeader
            title="Village News"
            subtitle="Latest updates, announcements and festival information"
            sectionId="news"
            onAddNew={() => setIsAddModalOpen(true)}
          />

          {/* All News Documents (Public View) */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">Loading news...</p>
            </div>
          ) : allDocuments.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allDocuments.map((doc) => (
                  <Card key={doc.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    {isAuthenticated && doc.userId === user?.uid && (
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditModal(doc)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <h3 className="text-lg font-semibold text-foreground mb-3 pr-8">
                      {doc.title}
                    </h3>
                    
                    {doc.imageUrls && doc.imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {doc.imageUrls.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`News ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(imageUrl)}
                          />
                        ))}
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {doc.subject}
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(doc.date)}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">No news documents available yet.</p>
            </div>
          )}

          {/* User's Documents Section - Only for authenticated users */}
          {isAuthenticated && userDocuments.length > 0 && (
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <h2 className="text-2xl font-bold text-primary-foreground mb-6">
                Here's Your Updated Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userDocuments.map((doc) => (
                  <Card key={doc.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditModal(doc)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => doc.id && handleDeleteDocument(doc.id, doc.userId)}
                      >
                        ×
                      </Button>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-3 pr-16">
                      {doc.title}
                    </h3>
                    
                    {doc.imageUrls && doc.imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {doc.imageUrls.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`News ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(imageUrl)}
                          />
                        ))}
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {doc.subject}
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(doc.date)}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Document Modal */}
        <NewsDocumentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddDocument}
          mode="add"
        />

        {/* Edit Document Modal */}
        <NewsDocumentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingDocument(null);
          }}
          onSave={handleEditDocument}
          initialData={editingDocument ? {
            title: editingDocument.title,
            subject: editingDocument.subject,
            date: typeof editingDocument.date === 'string' 
              ? editingDocument.date 
              : editingDocument.date instanceof Date 
                ? editingDocument.date.toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            imageUrls: editingDocument.imageUrls
          } : null}
          mode="edit"
        />
      </main>

      <Footer />

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
        alt="News image"
      />
    </div>
  );
};

export default News;
