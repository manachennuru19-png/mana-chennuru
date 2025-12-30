import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, LogIn, UserPlus, User, Chrome } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const returnTo = searchParams.get('returnTo') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      handleRedirect();
    }
  }, [isAuthenticated]);

  const handleRedirect = () => {
    if (returnTo.startsWith('/#')) {
      const sectionId = returnTo.replace('/#', '');
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate(returnTo);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t("common.error"),
        description: t("auth.enterEmailPassword"),
        variant: 'destructive',
      });
      return;
    }

    if (isSignup && !displayName.trim()) {
      toast({
        title: t("common.error"),
        description: t("auth.enterYourName"),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignup) {
        await signup(email, password, displayName.trim());
        toast({
          title: t("common.success"),
          description: t("auth.accountCreated"),
        });
      } else {
        await login(email, password);
        toast({
          title: t("common.success"),
          description: t("auth.loggedIn"),
        });
      }
      // Navigation will happen via useEffect when isAuthenticated changes
    } catch (error: any) {
      toast({
        title: isSignup ? t("auth.signupFailed") : t("auth.loginFailed"),
        description: error.message || (isSignup ? t("auth.failedToCreateAccount") : t("auth.invalidEmailPassword")),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: t("common.success"),
        description: isSignup ? t("auth.accountCreated") : t("auth.loggedIn"),
      });
      // Navigation will happen via useEffect when isAuthenticated changes
    } catch (error: any) {
      toast({
        title: isSignup ? t("auth.signupFailed") : t("auth.loginFailed"),
        description: error.message || (isSignup ? t("auth.failedToCreateAccount") : t("auth.invalidEmailPassword")),
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {isSignup ? t("auth.createAccount") : t("auth.loginToContribute")}
              </h1>
              <p className="text-sm text-primary font-medium mb-3">
                MANA CHENNURU
              </p>
              <p className="text-muted-foreground text-sm">
                {isSignup 
                  ? t("auth.createAccountDesc")
                  : t("auth.loginDesc")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-1.5">
                    {t("auth.fullName")}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={t("auth.yourName")}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.yourEmail")}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full font-bold text-base py-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5" 
                size="lg"
                disabled={isSubmitting || loading || isGoogleLoading}
              >
                {isSignup ? (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    {isSubmitting ? t("auth.creatingAccount") : t("auth.signup")}
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    {isSubmitting ? t("auth.loggingIn") : t("auth.login")}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              {/* Google Sign In/Sign Up Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full font-semibold border-2 py-5 hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting || loading}
              >
                <Chrome className="h-5 w-5" />
                {isGoogleLoading 
                  ? (isSignup ? t("auth.creatingAccount") : t("auth.loggingIn"))
                  : (isSignup ? t("auth.signupWithGoogle") : t("auth.loginWithGoogle"))
                }
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full font-semibold border-2 py-5 hover:bg-primary/5 transition-all duration-200"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setDisplayName('');
                }}
              >
                {isSignup ? (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    {t("auth.alreadyHaveAccount")}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t("auth.newUser")}
                  </>
                )}
              </Button>

              <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                  <strong>{t("auth.firebaseAuth")}</strong> - {isSignup ? t("auth.createAccountToStart") : t("auth.useRegisteredEmail")}
              </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
