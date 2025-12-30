import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Home, Pencil, IndianRupee, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RentalModal } from "@/components/RentalModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageModal } from "@/components/ImageModal";
import { 
  subscribeToCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  orderBy
} from "@/integrations/firebase/firestore";
import { RentalHouse } from "@/integrations/firebase/types";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Rentals = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [allRentals, setAllRentals] = useState<RentalHouse[]>([]);
  const [userRentals, setUserRentals] = useState<RentalHouse[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalHouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Subscribe to all rentals (public view)
  useEffect(() => {
    const unsubscribe = subscribeToCollection<RentalHouse>(
      'rental_houses',
      (rentals) => {
        setAllRentals(rentals);
        setLoading(false);
      },
      orderBy('createdAt', 'desc')
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to user's rentals (authenticated users only)
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setUserRentals([]);
      return;
    }

    const unsubscribe = subscribeToCollection<RentalHouse>(
      'rental_houses',
      (rentals) => {
        // Filter by userId and sort by createdAt on client side
        const userRents = rentals
          .filter(rental => rental.userId === user.uid)
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
            const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
            return dateB - dateA; // Descending order
          });
        setUserRentals(userRents);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  const handleAddRental = async (data: { address: string; street: string; cost?: string; contact?: string; imageUrls?: string[] }) => {
    if (!user?.uid) {
      toast({
        title: t("common.error"),
        description: t("auth.loginToAdd"),
        variant: 'destructive',
      });
      return;
    }

    try {
      await addDocument<RentalHouse>('rental_houses', {
        address: data.address,
        street: data.street,
        cost: data.cost,
        contact: data.contact,
        imageUrls: data.imageUrls,
        userId: user.uid,
      });
      toast({
        title: t("common.success"),
        description: t("pages.rentals.addRental") + " " + t("messages.addedSuccessfully"),
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

  const handleEditRental = async (data: { address: string; street: string; cost?: string; contact?: string; imageUrls?: string[] }) => {
    if (!editingRental?.id || !user?.uid) {
      toast({
        title: t("common.error"),
        description: t("messages.onlyEditOwn"),
        variant: 'destructive',
      });
      return;
    }

    // Verify user owns this rental
    if (editingRental.userId !== user.uid) {
      toast({
        title: t("common.error"),
        description: t("messages.onlyEditOwn"),
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateDocument<RentalHouse>('rental_houses', editingRental.id, {
        address: data.address,
        street: data.street,
        cost: data.cost,
        contact: data.contact,
        imageUrls: data.imageUrls,
      });
      toast({
        title: t("common.success"),
        description: t("pages.rentals.editRental") + " " + t("messages.updatedSuccessfully"),
      });
      setEditingRental(null);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("messages.failedToUpdate"),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteRental = async (rentalId: string, rentalUserId: string) => {
    if (!user?.uid || rentalUserId !== user.uid) {
      toast({
        title: t("common.error"),
        description: t("messages.onlyEditOwn"),
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(t("messages.areYouSure"))) {
      return;
    }

    try {
      await deleteDocument('rental_houses', rentalId);
      toast({
        title: t("common.success"),
        description: t("pages.rentals.editRental") + " " + t("messages.deletedSuccessfully"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("messages.failedToDelete"),
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (rental: RentalHouse) => {
    if (rental.userId !== user?.uid) {
      toast({
        title: t("common.error"),
        description: t("messages.onlyEditOwn"),
        variant: 'destructive',
      });
      return;
    }
    setEditingRental(rental);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 bg-primary/95">
          {/* Section Header with Login/Add buttons */}
          <SectionHeader
            title={t("pages.rentals.title")}
            subtitle={t("pages.rentals.subtitle")}
            sectionId="rentals"
            onAddNew={() => setIsAddModalOpen(true)}
          />

          {/* All Rentals (Public View) */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">{t("pages.rentals.loading")}</p>
            </div>
          ) : allRentals.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allRentals.map((rental) => (
                  <Card key={rental.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    {isAuthenticated && rental.userId === user?.uid && (
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditModal(rental)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 pr-8">
                          Rental House
                        </h3>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {rental.imageUrls && rental.imageUrls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {rental.imageUrls.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`Rental ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedImage(imageUrl)}
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">{rental.address}</div>
                          <div className="text-muted-foreground">{rental.street}</div>
                        </div>
                      </div>
                      {rental.cost && (
                        <div className="flex items-center gap-2 text-sm">
                          <IndianRupee className="h-4 w-4 text-accent" />
                          <span className="font-semibold text-accent">{rental.cost}</span>
                        </div>
                      )}
                      {rental.contact && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{rental.contact}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-primary-foreground/80">{t("pages.rentals.noRentals")}</p>
            </div>
          )}

          {/* User's Rentals Section - Only for authenticated users */}
          {isAuthenticated && userRentals.length > 0 && (
            <div className="mt-12 pt-8 border-t border-primary-foreground/20">
              <h2 className="text-2xl font-bold text-primary-foreground mb-6">
                {t("auth.hereYourContent")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRentals.map((rental) => (
                  <Card key={rental.id} className="p-6 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditModal(rental)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => rental.id && handleDeleteRental(rental.id, rental.userId)}
                      >
                        ×
                      </Button>
                    </div>
                    
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 pr-16">
                          {t("pages.rentals.title")}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {rental.imageUrls && rental.imageUrls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {rental.imageUrls.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`Rental ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedImage(imageUrl)}
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">{rental.address}</div>
                          <div className="text-muted-foreground">{rental.street}</div>
                        </div>
                      </div>
                      {rental.cost && (
                        <div className="flex items-center gap-2 text-sm">
                          <IndianRupee className="h-4 w-4 text-accent" />
                          <span className="font-semibold text-accent">{rental.cost}</span>
                        </div>
                      )}
                      {rental.contact && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{rental.contact}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Add Rental Modal */}
      <RentalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddRental}
        mode="add"
      />

      {/* Edit Rental Modal */}
      <RentalModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRental(null);
        }}
        onSave={handleEditRental}
        initialData={editingRental ? {
          address: editingRental.address,
          street: editingRental.street,
          cost: editingRental.cost,
          contact: editingRental.contact,
          imageUrls: editingRental.imageUrls
        } : null}
        mode="edit"
      />

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
        alt="Rental image"
      />
    </div>
  );
};

export default Rentals;


