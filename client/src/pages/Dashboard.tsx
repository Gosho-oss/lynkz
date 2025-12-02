import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Link2, 
  User, 
  Palette, 
  Settings, 
  LogOut, 
  ExternalLink,
  Eye,
  LayoutDashboard,
  Crown,
  Sparkles,
} from "lucide-react";
import type { User as UserType, Link as LinkType, Theme } from "@shared/schema";
import ProfileEditor from "@/components/dashboard/ProfileEditor";
import LinkManager from "@/components/dashboard/LinkManager";
import ThemeSelector from "@/components/dashboard/ThemeSelector";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import SetupUsername from "@/components/dashboard/SetupUsername";
import AdminSwitcher from "@/components/dashboard/AdminSwitcher";
import AdminDashboard from "@/pages/AdminDashboard";
import QRCodeDialog from "@/components/dashboard/QRCodeDialog";

type DashboardTab = "profile" | "links" | "themes" | "settings";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, firebaseUser, loading, signOut, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("links");
  const [showPreview, setShowPreview] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  // Fetch user's links
  const { data: links = [], isLoading: linksLoading, refetch: refetchLinks } = useQuery<LinkType[]>({
    queryKey: ["/api/links"],
    enabled: !!user,
  });

  // Fetch all themes
  const { data: themes = [], isLoading: themesLoading } = useQuery<Theme[]>({
    queryKey: ["/api/themes"],
    enabled: !!user,
  });

  // Find current theme
  const currentTheme = themes.find((t) => t.id === user?.themeId) || themes[0];

  const handleAdminModeChange = (enabled: boolean, password: string) => {
    setIsAdminMode(enabled);
    setAdminPassword(password);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <Link2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!firebaseUser) {
    navigate("/login");
    return null;
  }

  // Need to set up username (for Google OAuth users)
  if (firebaseUser && !user) {
    return <SetupUsername firebaseUser={firebaseUser} onComplete={refreshUser} />;
  }

  // Show admin dashboard if in admin mode
  if (isAdminMode && user?.role === "admin") {
    return (
      <AdminDashboard 
        adminPassword={adminPassword} 
        onBack={() => setIsAdminMode(false)} 
      />
    );
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  const menuItems = [
    { id: "links" as const, label: "Links", icon: Link2 },
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "themes" as const, label: "Themes", icon: Palette },
  ];

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r border-sidebar-border">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Link2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Lynkz</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-2 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Dashboard
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                        className="w-full"
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-sidebar-border">
            {user && (user.subscriptionTier === 'starter' || user.subscriptionTier === 'premium') && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
                <div className="flex items-center gap-2">
                  {user.subscriptionTier === 'premium' ? (
                    <Crown className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="text-sm font-medium">
                    {user.subscriptionTier === 'premium' ? 'Premium' : 'Starter'}
                  </span>
                </div>
              </div>
            )}
            {user && user.subscriptionTier === 'free' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mb-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0 hover:from-orange-600 hover:to-yellow-600"
                onClick={() => {
                  // Placeholder for Stripe upgrade
                  alert('Upgrade to Premium!\n\nStripe integration coming soon...\n\nPremium features:\n• Custom themes\n• Advanced analytics\n• Priority support\n• Remove branding');
                }}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || user?.username} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {(user?.displayName || user?.username || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.displayName || user?.username}</p>
                <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-border flex items-center justify-between px-4 gap-4 bg-background sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold capitalize">{activeTab}</h1>
            </div>
            <div className="flex items-center gap-2">
              {user?.role === "admin" && (
                <AdminSwitcher
                  isAdmin={user.role === "admin"}
                  onAdminModeChange={handleAdminModeChange}
                  isAdminMode={isAdminMode}
                />
              )}
              {user?.username && (
                <QRCodeDialog username={user.username} />
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hidden sm:flex"
                onClick={() => window.open(`/u/${user?.username}`, "_blank")}
                data-testid="button-view-profile"
              >
                <ExternalLink className="w-4 h-4" />
                View Profile
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 lg:hidden"
                onClick={() => setShowPreview(!showPreview)}
                data-testid="button-toggle-preview"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-2xl mx-auto">
                {activeTab === "profile" && (
                  <ProfileEditor user={user!} onUpdate={refreshUser} />
                )}
                {activeTab === "links" && (
                  <LinkManager 
                    links={links} 
                    isLoading={linksLoading}
                    onUpdate={refetchLinks}
                  />
                )}
                {activeTab === "themes" && (
                  <ThemeSelector 
                    themes={themes}
                    currentThemeId={user?.themeId || null}
                    isPremium={user?.isPremium || false}
                    onUpdate={refreshUser}
                    isLoading={themesLoading}
                  />
                )}
              </div>
            </main>

            {/* Preview Panel (Desktop) */}
            <aside className="hidden lg:flex w-80 xl:w-96 border-l border-border bg-muted/30 p-6 overflow-y-auto">
              <ProfilePreview 
                user={user!}
                links={links}
                theme={currentTheme}
              />
            </aside>
          </div>
        </div>

        {/* Mobile Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 lg:hidden bg-background/80 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
            <div 
              className="absolute inset-4 sm:inset-8 bg-background rounded-2xl border border-border overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-12 border-b border-border flex items-center justify-between px-4">
                <span className="font-medium">Preview</span>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} data-testid="button-close-preview">
                  Close
                </Button>
              </div>
              <div className="h-[calc(100%-3rem)] overflow-y-auto p-4">
                <ProfilePreview 
                  user={user!}
                  links={links}
                  theme={currentTheme}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
