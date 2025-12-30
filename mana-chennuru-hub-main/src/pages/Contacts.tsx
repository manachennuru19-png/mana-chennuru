import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SectionHeader } from "@/components/SectionHeader";
import { subscribeToCollection, addDocument, updateDocument, deleteDocument, orderBy } from "@/integrations/firebase/firestore";
import { GovernmentContact } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { AddEditModal } from "@/components/AddEditModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Contacts = () => {
  const { user, isAuthenticated } = useAuth();
  const [allContacts, setAllContacts] = useState<GovernmentContact[]>([]);
  const [userContacts, setUserContacts] = useState<GovernmentContact[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<GovernmentContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToCollection<GovernmentContact>('government_contacts', (items) => {
      setAllContacts(items);
      setLoading(false);
    }, orderBy('createdAt', 'desc'));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setUserContacts([]);
      return;
    }
    const unsubscribe = subscribeToCollection<GovernmentContact>('government_contacts', (items) => {
      const userItems = items.filter(i => i.userId === user.uid).sort((a, b) => {
        const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
        const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
        return dateB - dateA;
      });
      setUserContacts(userItems);
    });
    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  const handleAdd = async () => {
    if (!user?.uid || !name.trim() || !position.trim() || !contact.trim()) return;
    try {
      await addDocument<GovernmentContact>('government_contacts', { name: name.trim(), position: position.trim(), contact: contact.trim(), userId: user.uid });
      toast({ title: 'Success', description: 'Contact added successfully!' });
      setIsAddModalOpen(false);
      setName(""); setPosition(""); setContact("");
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add contact', variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    if (!editingContact?.id || !user?.uid || editingContact.userId !== user.uid || !name.trim() || !position.trim() || !contact.trim()) return;
    try {
      await updateDocument<GovernmentContact>('government_contacts', editingContact.id, { name: name.trim(), position: position.trim(), contact: contact.trim() });
      toast({ title: 'Success', description: 'Contact updated successfully!' });
      setIsEditModalOpen(false);
      setEditingContact(null);
      setName(""); setPosition(""); setContact("");
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update contact', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    if (!user?.uid || userId !== user.uid || !confirm('Are you sure?')) return;
    try {
      await deleteDocument('government_contacts', id);
      toast({ title: 'Success', description: 'Contact deleted successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete contact', variant: 'destructive' });
    }
  };

  const openEdit = (item: GovernmentContact) => {
    if (item.userId !== user?.uid) {
      toast({ title: 'Error', description: 'You can only edit your own contacts', variant: 'destructive' });
      return;
    }
    setEditingContact(item);
    setName(item.name);
    setPosition(item.position);
    setContact(item.contact);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          <SectionHeader title="Government Contacts" subtitle="Directory of officials, officers and their contact details" sectionId="contacts" onAddNew={() => { setName(""); setPosition(""); setContact(""); setIsAddModalOpen(true); }} />

          {loading ? <div className="text-center py-12"><p className="text-primary-foreground/80">Loading contacts...</p></div> :
            allContacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allContacts.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    {isAuthenticated && item.userId === user?.uid && (
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg"><User className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1 pr-8">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{item.position}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{item.contact}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : <div className="text-center py-12"><p className="text-primary-foreground/80">No contacts available yet.</p></div>
          }

          {isAuthenticated && userContacts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <h2 className="text-2xl font-bold text-primary-foreground mb-6">Here's Your Updated Content</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userContacts.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => item.id && handleDelete(item.id, item.userId)}>×</Button>
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg"><User className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1 pr-16">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{item.position}</p>
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

      <AddEditModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Government Contact" onSave={handleAdd}>
        <div className="space-y-4">
          <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" /></div>
          <div><Label>Position *</Label><Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Enter position" /></div>
          <div><Label>Contact *</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Enter contact number" /></div>
        </div>
      </AddEditModal>

      <AddEditModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingContact(null); }} title="Edit Government Contact" onSave={handleEdit}>
        <div className="space-y-4">
          <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" /></div>
          <div><Label>Position *</Label><Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Enter position" /></div>
          <div><Label>Contact *</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Enter contact number" /></div>
        </div>
      </AddEditModal>
    </div>
  );
};

export default Contacts;


