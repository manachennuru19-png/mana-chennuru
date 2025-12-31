import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Newspaper, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PDFViewerModal } from "@/components/PDFViewerModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  subscribeToCollection, 
  orderBy 
} from "@/integrations/firebase/firestore";
import { ElectionCommissionDocument } from "@/integrations/firebase/types";
import { VillageNewsDocument } from "@/integrations/firebase/types";

interface NoticeItem {
  id: string;
  title: string;
  description: string;
  source: 'election' | 'news';
  date: Date | any;
  pdfUrl?: string;
  href?: string;
}

export const LatestNotices = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [electionNotices, setElectionNotices] = useState<NoticeItem[]>([]);
  const [newsNotices, setNewsNotices] = useState<NoticeItem[]>([]);
  
  // PDF viewer modal state
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string>("");
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>("");

  // Merge and sort notices whenever either source updates
  useEffect(() => {
    const allNotices = [...electionNotices, ...newsNotices];
    
    // Sort by date (newest first)
    allNotices.sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate().getTime() : (a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime());
      const dateB = b.date?.toDate ? b.date.toDate().getTime() : (b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime());
      return dateB - dateA;
    });

    // Take only the latest 3
    const latestNotices = allNotices.slice(0, 3);
    setNotices(latestNotices);
    setLoading(false);
  }, [electionNotices, newsNotices]);

  useEffect(() => {
    // Subscribe to Election Commission documents
    const unsubscribeElection = subscribeToCollection<ElectionCommissionDocument>(
      'election_commission_documents',
      (documents) => {
        const notices: NoticeItem[] = [];
        documents.forEach((doc) => {
          // Only include PDF documents
          if (doc.fileType === 'pdf' && doc.fileUrl) {
            notices.push({
              id: doc.id || '',
              title: doc.title,
              description: doc.title, // Use title as description for now
              source: 'election',
              date: doc.createdAt || new Date(),
              pdfUrl: doc.fileUrl,
            });
          }
        });
        setElectionNotices(notices);
      },
      orderBy('createdAt', 'desc')
    );

    // Subscribe to Village News documents
    const unsubscribeNews = subscribeToCollection<VillageNewsDocument>(
      'village_news_documents',
      (documents) => {
        const notices: NoticeItem[] = [];
        documents.forEach((doc) => {
          notices.push({
            id: doc.id || '',
            title: doc.title,
            description: doc.subject || doc.title,
            source: 'news',
            date: doc.date || doc.createdAt || new Date(),
            href: '/news', // Link to news page
          });
        });
        setNewsNotices(notices);
      },
      orderBy('date', 'desc')
    );

    return () => {
      unsubscribeElection();
      unsubscribeNews();
    };
  }, []);

  const formatDate = (date: Date | any) => {
    if (!date) return 'N/A';
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleViewNotice = (notice: NoticeItem) => {
    if (notice.pdfUrl) {
      // On mobile, open PDF directly in new tab (mobile browsers don't support PDFs in iframes well)
      // On desktop, open in modal with iframe
      if (isMobile) {
        window.open(notice.pdfUrl, '_blank');
      } else {
        setViewingPdfUrl(notice.pdfUrl);
        setViewingPdfTitle(notice.title);
        setIsPdfViewerOpen(true);
      }
    } else if (notice.href) {
      // Navigate to the page
      window.location.href = notice.href;
    }
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">{t("latestNotices.loading")}</p>
          </div>
        </div>
      </section>
    );
  }

  if (notices.length === 0) {
    return null; // Don't show section if there are no notices
  }

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("latestNotices.title")}
          </h2>
          <p className="text-foreground/80 text-lg max-w-2xl mx-auto">
            {t("latestNotices.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <Card key={notice.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <Badge 
                  variant={notice.source === 'election' ? 'default' : 'secondary'}
                  className="mb-2"
                >
                  {notice.source === 'election' 
                    ? t("latestNotices.electionCommission")
                    : t("latestNotices.villageNews")
                  }
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {notice.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-4 flex-1" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {notice.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(notice.date)}</span>
              </div>

              <Button
                onClick={() => handleViewNotice(notice)}
                variant="outline"
                className="w-full"
              >
                {notice.pdfUrl ? (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    {t("latestNotices.viewFullNotice")}
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t("latestNotices.viewNotice")}
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={isPdfViewerOpen}
        onClose={() => {
          setIsPdfViewerOpen(false);
          setViewingPdfUrl("");
          setViewingPdfTitle("");
        }}
        pdfUrl={viewingPdfUrl}
        title={viewingPdfTitle}
      />
    </section>
  );
};

