import type { ThemeSettings } from "@shared/schema";

// Pre-built themes for the application
export const defaultThemes: { id: string; name: string; description: string; isPremium: boolean; settings: ThemeSettings }[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple with high contrast",
    isPremium: false,
    settings: {
      background: "#ffffff",
      backgroundType: "solid",
      textColor: "#1a1a1a",
      buttonStyle: "outlined",
      buttonShape: "rounded-full",
      buttonBackground: "#ffffff",
      buttonTextColor: "#1a1a1a",
      buttonBorderColor: "#1a1a1a",
      fontFamily: "Inter",
      accentColor: "#3b82f6",
    },
  },
  {
    id: "dark-minimal",
    name: "Dark Minimal",
    description: "Sleek dark mode design",
    isPremium: false,
    settings: {
      background: "#0a0a0a",
      backgroundType: "solid",
      textColor: "#fafafa",
      buttonStyle: "outlined",
      buttonShape: "rounded-full",
      buttonBackground: "transparent",
      buttonTextColor: "#fafafa",
      buttonBorderColor: "#fafafa",
      fontFamily: "Inter",
      accentColor: "#8b5cf6",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm gradient with golden hues",
    isPremium: false,
    settings: {
      background: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
      backgroundType: "gradient",
      gradientFrom: "#ff6b6b",
      gradientTo: "#feca57",
      gradientDirection: "135deg",
      textColor: "#ffffff",
      buttonStyle: "filled",
      buttonShape: "rounded-full",
      buttonBackground: "rgba(255,255,255,0.25)",
      buttonTextColor: "#ffffff",
      fontFamily: "Poppins",
      accentColor: "#ff6b6b",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool blue tones with depth",
    isPremium: false,
    settings: {
      background: "linear-gradient(180deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)",
      backgroundType: "gradient",
      gradientFrom: "#0077b6",
      gradientTo: "#90e0ef",
      gradientDirection: "180deg",
      textColor: "#ffffff",
      buttonStyle: "filled",
      buttonShape: "rounded-xl",
      buttonBackground: "rgba(255,255,255,0.2)",
      buttonTextColor: "#ffffff",
      fontFamily: "Inter",
      accentColor: "#00b4d8",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural earthy greens",
    isPremium: false,
    settings: {
      background: "linear-gradient(180deg, #2d5016 0%, #4a7c23 100%)",
      backgroundType: "gradient",
      gradientFrom: "#2d5016",
      gradientTo: "#4a7c23",
      gradientDirection: "180deg",
      textColor: "#ffffff",
      buttonStyle: "filled",
      buttonShape: "rounded-lg",
      buttonBackground: "rgba(255,255,255,0.15)",
      buttonTextColor: "#ffffff",
      fontFamily: "Open Sans",
      accentColor: "#84cc16",
    },
  },
  {
    id: "neon",
    name: "Neon Nights",
    description: "Vibrant cyberpunk aesthetic",
    isPremium: true,
    settings: {
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      backgroundType: "gradient",
      gradientFrom: "#0f0c29",
      gradientTo: "#24243e",
      gradientDirection: "135deg",
      textColor: "#ffffff",
      buttonStyle: "outlined",
      buttonShape: "rounded-lg",
      buttonBackground: "transparent",
      buttonTextColor: "#f472b6",
      buttonBorderColor: "#f472b6",
      fontFamily: "Space Grotesk",
      accentColor: "#f472b6",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Mesmerizing northern lights",
    isPremium: true,
    settings: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #6B8DD6 50%, #8E37D7 75%, #667eea 100%)",
      backgroundType: "mesh",
      gradientFrom: "#667eea",
      gradientTo: "#764ba2",
      gradientDirection: "135deg",
      textColor: "#ffffff",
      buttonStyle: "soft",
      buttonShape: "rounded-full",
      buttonBackground: "rgba(255,255,255,0.2)",
      buttonTextColor: "#ffffff",
      fontFamily: "Plus Jakarta Sans",
      accentColor: "#a78bfa",
    },
  },
  {
    id: "glassmorphism",
    name: "Glass",
    description: "Modern frosted glass effect",
    isPremium: true,
    settings: {
      background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 50%, #1e3a5f 100%)",
      backgroundType: "gradient",
      gradientFrom: "#1e3a5f",
      gradientTo: "#2d5a7b",
      gradientDirection: "135deg",
      textColor: "#ffffff",
      buttonStyle: "soft",
      buttonShape: "rounded-xl",
      buttonBackground: "rgba(255,255,255,0.1)",
      buttonTextColor: "#ffffff",
      fontFamily: "Inter",
      accentColor: "#60a5fa",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep purple elegance",
    isPremium: true,
    settings: {
      background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      backgroundType: "gradient",
      gradientFrom: "#1a1a2e",
      gradientTo: "#0f3460",
      gradientDirection: "180deg",
      textColor: "#e0e0e0",
      buttonStyle: "filled",
      buttonShape: "rounded-full",
      buttonBackground: "rgba(233, 69, 96, 0.8)",
      buttonTextColor: "#ffffff",
      fontFamily: "Outfit",
      accentColor: "#e94560",
    },
  },
  {
    id: "candy",
    name: "Candy",
    description: "Sweet pastel vibes",
    isPremium: true,
    settings: {
      background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)",
      backgroundType: "gradient",
      gradientFrom: "#ffecd2",
      gradientTo: "#ff9a9e",
      gradientDirection: "135deg",
      textColor: "#4a3728",
      buttonStyle: "filled",
      buttonShape: "rounded-full",
      buttonBackground: "rgba(255,255,255,0.7)",
      buttonTextColor: "#4a3728",
      fontFamily: "Poppins",
      accentColor: "#f472b6",
    },
  },
];

export function getThemeBackground(settings: ThemeSettings): string {
  if (settings.backgroundType === "solid") {
    return settings.background;
  }
  return settings.background;
}

export function getButtonStyles(settings: ThemeSettings): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    fontFamily: settings.fontFamily,
    color: settings.buttonTextColor,
  };

  switch (settings.buttonStyle) {
    case "filled":
      return {
        ...baseStyles,
        backgroundColor: settings.buttonBackground,
        border: "none",
      };
    case "outlined":
      return {
        ...baseStyles,
        backgroundColor: "transparent",
        border: `2px solid ${settings.buttonBorderColor || settings.buttonTextColor}`,
      };
    case "soft":
      return {
        ...baseStyles,
        backgroundColor: settings.buttonBackground,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
      };
    default:
      return baseStyles;
  }
}
