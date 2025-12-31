import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Shops from "./pages/Shops";
import News from "./pages/News";
import Culture from "./pages/Culture";
import ElectionCommission from "./pages/ElectionCommission";
import Rentals from "./pages/Rentals";
import Schemes from "./pages/Schemes";
import Complaints from "./pages/Complaints";
import Contacts from "./pages/Contacts";
import Emergency from "./pages/Emergency";
import Education from "./pages/Education";
import Gallery from "./pages/Gallery";
import Transport from "./pages/Transport";
import Agriculture from "./pages/Agriculture";
import LostFound from "./pages/LostFound";
import Donations from "./pages/Donations";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/news" element={<News />} />
          <Route path="/culture" element={<Culture />} />
          <Route path="/election-commission" element={<ElectionCommission />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/education" element={<Education />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/agriculture" element={<Agriculture />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/login" element={<Login />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
