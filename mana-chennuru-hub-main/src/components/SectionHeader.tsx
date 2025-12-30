import { useAuth } from '@/hooks/useAuth';
import { LogIn, Plus, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  sectionId: string;
  onAddNew?: () => void;
}

export const SectionHeader = ({ title, subtitle, sectionId, onAddNew }: SectionHeaderProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const handleLoginClick = () => {
    window.location.href = `/login?returnTo=/#${sectionId}`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">{title}</h2>
        {subtitle && <p className="text-primary-foreground/80 mt-1">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-primary-foreground/90 font-medium">
              {t("auth.hi")}, {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </span>
            {onAddNew && (
              <button
                onClick={onAddNew}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-lg hover:bg-primary/90 active:bg-primary/95 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`Add new ${title} content`}
              >
                <Plus className="h-4 w-4" />
                {t("auth.addNew")}
              </button>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t("auth.logout")}
            </button>
          </>
        ) : (
          <button
            onClick={handleLoginClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-lg hover:bg-primary/90 active:bg-primary/95 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={`Login to add or update ${title}`}
          >
            <LogIn className="h-4 w-4" />
            {t("auth.loginToAdd")}
          </button>
        )}
      </div>
    </div>
  );
};
