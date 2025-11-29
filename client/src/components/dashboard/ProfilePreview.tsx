import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";
import type { User, Link as LinkType, Theme, ThemeSettings } from "@shared/schema";
import { getThemeBackground, getButtonStyles, defaultThemes } from "@/lib/themes";

interface ProfilePreviewProps {
  user: User;
  links: LinkType[];
  theme: Theme | undefined;
}

export default function ProfilePreview({ user, links, theme }: ProfilePreviewProps) {
  // Use default minimal theme if none selected
  const currentTheme = theme || (defaultThemes[0] as unknown as Theme);
  const settings = currentTheme?.settings as ThemeSettings || defaultThemes[0].settings;
  
  const background = getThemeBackground(settings);
  const buttonStyles = getButtonStyles(settings);
  
  // Sort links by order and filter active
  const activeLinks = [...links]
    .filter((l) => l.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="w-full h-full flex flex-col items-center">
      {/* Phone Frame */}
      <div className="w-full max-w-[280px] bg-foreground rounded-[2.5rem] p-2 shadow-xl">
        <div className="w-full aspect-[9/19] rounded-[2rem] overflow-hidden relative">
          {/* Screen content */}
          <div
            className="absolute inset-0 flex flex-col"
            style={{ background, fontFamily: settings.fontFamily }}
          >
            {/* Profile Header */}
            <div className="flex-shrink-0 pt-12 pb-6 px-6 flex flex-col items-center">
              <Avatar className="w-20 h-20 mb-3 border-2 border-white/20">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.username} />
                <AvatarFallback 
                  className="text-xl font-medium"
                  style={{ 
                    backgroundColor: settings.buttonBackground,
                    color: settings.buttonTextColor,
                  }}
                >
                  {(user.displayName || user.username || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 
                className="text-lg font-bold text-center"
                style={{ color: settings.textColor }}
              >
                {user.displayName || user.username}
              </h2>
              {user.bio && (
                <p 
                  className="text-xs text-center mt-1 max-w-[180px] line-clamp-2 opacity-80"
                  style={{ color: settings.textColor }}
                >
                  {user.bio}
                </p>
              )}
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              <div className="flex flex-col gap-2">
                {activeLinks.length > 0 ? (
                  activeLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`h-10 px-4 flex items-center justify-center text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${settings.buttonShape}`}
                      style={buttonStyles}
                    >
                      <span className="truncate">{link.title}</span>
                    </a>
                  ))
                ) : (
                  <div 
                    className="text-center py-8 text-xs opacity-60"
                    style={{ color: settings.textColor }}
                  >
                    No links yet
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 pb-6 pt-2">
              <p 
                className="text-[10px] text-center opacity-50"
                style={{ color: settings.textColor }}
              >
                Powered by Lynkz
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Theme: <span className="font-medium">{currentTheme?.name || "Minimal"}</span>
        </p>
      </div>
    </div>
  );
}
