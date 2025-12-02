import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Check, Lock, Sparkles } from "lucide-react";
import type { Theme, ThemeSettings } from "@shared/schema";
import { defaultThemes, getThemeBackground } from "@/lib/themes";

interface ThemeSelectorProps {
  themes: Theme[];
  currentThemeId: string | null;
  isPremium: boolean;
  onUpdate: () => Promise<void>;
  isLoading: boolean;
}

export default function ThemeSelector({
  themes,
  currentThemeId,
  isPremium,
  onUpdate,
  isLoading,
}: ThemeSelectorProps) {
  const { toast } = useToast();
  const { getToken } = useAuth();

  // Use default themes if none from database, or merge with database themes
  const allThemes = themes.length > 0 ? themes : defaultThemes.map((t) => ({
    ...t,
    createdAt: new Date(),
  })) as Theme[];

  const updateThemeMutation = useMutation({
    mutationFn: async (themeId: string) => {
      return apiRequest("PATCH", "/api/users/me", { themeId });
    },
    onSuccess: async () => {
      toast({ title: "Theme updated", description: "Your profile now uses the new theme." });
      await onUpdate();
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update theme",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectTheme = (theme: Theme) => {
    if (theme.isPremium && !isPremium) {
      toast({
        title: "Premium theme",
        description: "Upgrade to premium to unlock this theme.",
      });
      return;
    }
    updateThemeMutation.mutate(theme.id);
  };

  // Separate free and premium themes
  const freeThemes = allThemes.filter((t) => !t.isPremium && (!t.settings.requiredTier || t.settings.requiredTier === 'free'));
  const starterThemes = allThemes.filter((t) => !t.isPremium && t.settings.requiredTier === 'starter');
  const premiumThemes = allThemes.filter((t) => t.isPremium);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose a Theme</CardTitle>
          <CardDescription>
            Select a theme for your public profile page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Free Themes */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Free Themes
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {freeThemes.map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isSelected={currentThemeId === theme.id}
                      isLocked={false}
                      onClick={() => handleSelectTheme(theme)}
                      isUpdating={updateThemeMutation.isPending}
                    />
                  ))}
                </div>
              </div>

              {/* Starter Pack Themes */}
              {starterThemes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Starter Pack Themes
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {starterThemes.map((theme) => (
                      <ThemeCard
                        key={theme.id}
                        theme={theme}
                        isSelected={currentThemeId === theme.id}
                        isLocked={false}
                        tierBadge="starter"
                        onClick={() => handleSelectTheme(theme)}
                        isUpdating={updateThemeMutation.isPending}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Premium Themes */}
              {premiumThemes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Premium Themes
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {premiumThemes.map((theme) => (
                      <ThemeCard
                        key={theme.id}
                        theme={theme}
                        isSelected={currentThemeId === theme.id}
                        isLocked={!isPremium}
                        tierBadge="premium"
                        onClick={() => handleSelectTheme(theme)}
                        isUpdating={updateThemeMutation.isPending}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!isPremium && (
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Unlock Premium Themes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get access to exclusive themes, custom colors, and advanced customization options.
                </p>
                <Badge variant="secondary" className="cursor-pointer hover-elevate">
                  Coming Soon
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ThemeCardProps {
  theme: Theme;
  isSelected: boolean;
  isLocked: boolean;
  onClick: () => void;
  isUpdating: boolean;
  tierBadge?: "starter" | "premium";
}

function ThemeCard({ theme, isSelected, isLocked, onClick, isUpdating, tierBadge }: ThemeCardProps) {
  const settings = theme.settings as ThemeSettings;
  const background = getThemeBackground(settings);

  return (
    <button
      onClick={onClick}
      disabled={isUpdating}
      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-transparent hover:border-border"
      } ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
      data-testid={`theme-card-${theme.id}`}
    >
      {/* Theme Preview */}
      <div
        className="absolute inset-0 p-3 flex flex-col items-center justify-center gap-2"
        style={{ background }}
      >
        {/* Avatar placeholder */}
        <div
          className="w-8 h-8 rounded-full"
          style={{ 
            backgroundColor: settings.buttonBackground,
            border: settings.buttonStyle === "outlined" 
              ? `2px solid ${settings.buttonBorderColor || settings.buttonTextColor}` 
              : "none",
          }}
        />
        {/* Name placeholder */}
        <div
          className="w-12 h-2 rounded-full"
          style={{ backgroundColor: `${settings.textColor}40` }}
        />
        {/* Link buttons placeholder */}
        <div className="space-y-1.5 w-full px-2 mt-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-4 w-full ${settings.buttonShape}`}
              style={{
                backgroundColor: settings.buttonStyle === "outlined" 
                  ? "transparent" 
                  : settings.buttonBackground,
                border: settings.buttonStyle === "outlined"
                  ? `1px solid ${settings.buttonBorderColor || settings.buttonTextColor}`
                  : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Theme name */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
        <p className="text-xs font-medium text-white text-center truncate">
          {theme.name}
        </p>
      </div>

      {/* Premium badge */}
      {theme.isPremium && tierBadge === "premium" && (
        <div className="absolute top-2 left-2">
          <Badge className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white px-1.5 py-0.5">
            PRO
          </Badge>
        </div>
      )}
      
      {/* Starter badge */}
      {tierBadge === "starter" && (
        <div className="absolute top-2 left-2">
          <Badge className="text-[10px] bg-gradient-to-r from-blue-500 to-cyan-500 border-0 text-white px-1.5 py-0.5">
            STARTER
          </Badge>
        </div>
      )}
      
      {/* Animation indicator */}
      {settings.animations && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded-full bg-purple-500/80 flex items-center justify-center" title="Animated">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
    </button>
  );
}
