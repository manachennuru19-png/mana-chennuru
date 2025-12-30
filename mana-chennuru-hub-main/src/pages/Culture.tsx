import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChennuruTemplesSection } from "@/components/ChennuruTemplesSection";

const Culture = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Chennuru Temples Section with Search and Login */}
        <ChennuruTemplesSection />
      </main>

      <Footer />
    </div>
  );
};

export default Culture;
