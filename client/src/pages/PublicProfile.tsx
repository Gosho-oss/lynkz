import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2, ExternalLink } from "lucide-react";
import type { PublicProfile, ThemeSettings } from "@shared/schema";
import { getThemeBackground, getButtonStyles, defaultThemes } from "@/lib/themes";
import { Link } from "wouter";

export default function PublicProfilePage() {
  const [match, params] = useRoute("/u/:username");
  const username = params?.username;

  const { data: profile, isLoading, error } = useQuery<PublicProfile>({
    queryKey: ["/api/public", username],
    enabled: !!username,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md flex flex-col items-center">
          <Skeleton className="w-32 h-32 rounded-full mb-4" />
          <Skeleton className="w-40 h-6 mb-2" />
          <Skeleton className="w-60 h-4 mb-8" />
          <div className="w-full space-y-3">
            <Skeleton className="w-full h-14 rounded-full" />
            <Skeleton className="w-full h-14 rounded-full" />
            <Skeleton className="w-full h-14 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-muted-foreground mb-6">
            The profile you're looking for doesn't exist.
          </p>
          <Link href="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // Get theme settings
  const theme = profile.theme;
  const settings: ThemeSettings = theme?.settings as ThemeSettings || defaultThemes[0].settings;
  const background = getThemeBackground(settings);
  const buttonStyles = getButtonStyles(settings);

  // Sort links by order
  const sortedLinks = [...(profile.links || [])].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background, fontFamily: settings.fontFamily }}
    >
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-16">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Profile Header */}
          <Avatar className="w-28 h-28 sm:w-32 sm:h-32 mb-4 border-4 border-white/20 shadow-lg">
            <AvatarImage 
              src={profile.avatarUrl || undefined} 
              alt={profile.displayName || profile.username} 
            />
            <AvatarFallback 
              className="text-4xl font-bold"
              style={{ 
                backgroundColor: settings.buttonBackground,
                color: settings.buttonTextColor,
              }}
            >
              {(profile.displayName || profile.username)[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h1 
            className="text-2xl sm:text-3xl font-bold text-center mb-2"
            style={{ color: settings.textColor }}
          >
            {profile.displayName || profile.username}
          </h1>

          {profile.bio && (
            <p 
              className="text-center max-w-xs mb-8 opacity-80"
              style={{ color: settings.textColor }}
            >
              {profile.bio}
            </p>
          )}

          {/* Links */}
          <div className="w-full space-y-3">
            {sortedLinks.length > 0 ? (
              sortedLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full h-14 px-6 flex items-center justify-center text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${settings.buttonShape}`}
                  style={buttonStyles}
                  data-testid={`public-link-${link.id}`}
                >
                  <span className="truncate">{link.title}</span>
                  <ExternalLink className="w-4 h-4 ml-2 opacity-60 flex-shrink-0" />
                </a>
              ))
            ) : (
              <p 
                className="text-center py-8 opacity-60"
                style={{ color: settings.textColor }}
              >
                No links yet
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: settings.textColor }}
        >
          <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
            <Link2 className="w-3 h-3" style={{ color: settings.textColor }} />
          </div>
          Powered by Lynkz
        </Link>
      </footer>
    </div>
  );
}
