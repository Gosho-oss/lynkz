# Theme & Animation System Guide

## 🎨 Overview
The app now features **31 themes** organized into three tiers with premium animations!

---

## 📊 Theme Breakdown

### **Free Themes (15 total)**
Basic themes available to all users:
- Minimal
- Dark Minimal
- Sunset
- Ocean
- Forest
- Golden Hour (orange/yellow - matches logo!)
- Lavender Dreams
- Monochrome
- Mint Fresh
- Cherry Blossom
- Coral Reef
- Slate Gray
- Cotton Candy
- Earth Tones

### **Starter Pack Themes (4 total)**
Enhanced themes with animations (requires Starter subscription):
- **Amethyst** - Rich purple with scale animations
- **Cyber Blue** - Futuristic blue with glow effects
- **Rose Gold** - Elegant shimmer animations
- **Forest Night** - Deep forest with lift effects

### **Premium Themes (13 total)**
Premium themes with advanced animations (requires Premium subscription):
- Neon Nights (glow + slide)
- Aurora (shimmer + zoom + gradient-shift)
- Glass
- Midnight
- Candy
- **Volcano** (lift + bouncy + zoom + gradient-shift)
- **Cosmic** (glow + particles effect)
- Emerald
- Peach Sorbet
- Royal Blue
- Matrix
- Caramel
- **Arctic** (lift + fade)

---

## ✨ Animation Features

### Button Hover Animations
Premium animations only available with Starter/Premium themes:

1. **Scale** - Button grows on hover
2. **Glow** - Glowing shadow effect
3. **Lift** - Button lifts with shadow
4. **Shimmer** - Sliding light effect

### Button Transitions
- **Smooth** - Standard ease transition
- **Bouncy** - Elastic spring effect

### Entrance Animations
Profile elements fade/slide/zoom in:
- **Fade** - Smooth fade in
- **Slide** - Slide up from bottom
- **Zoom** - Scale in from center

### Background Animations
- **Gradient Shift** - Animated gradient movement
- **Particles** - Floating particle effect

---

## 🎯 Animation Indicators

In the theme selector:
- 🟣 Purple sparkle icon = Theme has animations
- 🔵 Blue "STARTER" badge = Starter pack theme
- 🟠 Orange "PRO" badge = Premium theme

---

## 💻 Technical Details

### Schema Changes
Added to `ThemeSettings` interface:
```typescript
animations?: {
  buttonHover?: "scale" | "glow" | "lift" | "shimmer" | "none";
  buttonTransition?: "smooth" | "bouncy" | "none";
  entranceAnimation?: "fade" | "slide" | "zoom" | "none";
  backgroundAnimation?: "gradient-shift" | "particles" | "none";
};
requiredTier?: "free" | "starter" | "premium";
```

### Files Modified
1. `/shared/schema.ts` - Added animation properties
2. `/client/src/lib/themes.ts` - Updated themes with animations
3. `/client/src/lib/animations.css` - Animation styles
4. `/client/src/pages/PublicProfile.tsx` - Animation rendering
5. `/client/src/components/dashboard/ThemeSelector.tsx` - Tier badges

### NPM Scripts
```bash
npm run themes:seed  # Sync themes to database
```

---

## 🚀 User Experience

### Free Users
- Access to 15 basic themes
- No animations
- Standard hover effects

### Starter Users
- All free themes
- 4 exclusive starter themes with animations
- Basic animations (scale, glow, lift, shimmer)
- Smooth entrance effects

### Premium Users
- All themes (31 total)
- Full animation suite
- Advanced effects (particles, gradient-shift)
- Bouncy transitions

---

## 🎨 Theme Recommendations

**Professional**: Minimal, Slate Gray, Monochrome
**Vibrant**: Golden Hour, Coral Reef, Volcano
**Elegant**: Rose Gold, Aurora, Amethyst
**Dark**: Dark Minimal, Matrix, Midnight
**Nature**: Forest, Earth Tones, Emerald
**Tech**: Cyber Blue, Neon Nights, Cosmic

---

## 📝 Notes

- Animations only render on public profiles with themes that have animation settings
- Animations are optimized for performance
- Stagger animations apply to link lists (each link animates in sequence)
- Background animations use CSS transforms for GPU acceleration
