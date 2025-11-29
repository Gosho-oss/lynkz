# Lynkz Design Guidelines

## Design Approach

**Reference-Based Strategy:** Drawing inspiration from Instagram's clean aesthetic, Linktree's simplicity, and Notion's dashboard organization. This creates a familiar yet polished experience for creators managing their online presence.

**Core Principle:** Dual personality design—minimal, focused dashboard for efficiency + expressive, customizable public profiles for creator identity.

---

## Typography System

**Font Stack:**
- Primary: Inter (body, UI elements, dashboard)
- Display: Cal Sans or Bricolage Grotesque (public profile names, premium themes)

**Hierarchy:**
- Profile names: 2.5rem-3rem (display font, bold)
- Dashboard headings: 1.5rem-1.75rem (semibold)
- Link buttons: 0.95rem (medium weight)
- Bio text: 1rem (regular)
- UI labels: 0.875rem (medium)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 3, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: gap-6, gap-8
- Tight groupings: gap-2, gap-3
- Page margins: px-4 (mobile), px-8 (desktop)

**Container Strategy:**
- Dashboard: max-w-4xl centered
- Public profiles: max-w-md centered (mobile-first approach)
- Settings panels: max-w-2xl

---

## Dashboard Experience

**Layout Structure:**
- Left sidebar navigation (hidden on mobile, hamburger menu)
- Main content area with clear sections
- Fixed preview panel on larger screens (lg:flex)

**Key Sections:**
1. **Profile Editor:**
   - Avatar upload (circular, 120px diameter) with edit overlay
   - Bio textarea (max-w-prose, h-24)
   - Username input with live availability check
   - Grouped in single card with subtle borders

2. **Link Manager:**
   - Each link as draggable card (h-16, flex items-center)
   - Drag handle (left), title/URL (center), edit/delete (right)
   - Add link button prominent at bottom (w-full, h-12)
   - Visual feedback: subtle elevation on hover, ghost placeholder while dragging

3. **Theme Selector:**
   - Grid of theme cards (grid-cols-2 md:grid-cols-3 lg:grid-cols-4, gap-4)
   - Each card: 120px height, rounded-xl, shows preview of gradient/pattern
   - Premium lock badge overlay for paid themes
   - Active theme: border accent

4. **Live Preview:**
   - Fixed right panel (hidden below lg)
   - Phone frame mockup containing actual public profile
   - Sticky position, updates in real-time

---

## Public Profile Pages

**Hero Section:**
- Profile image (160px diameter, centered)
- Name (display font, centered, mb-2)
- Bio (max-w-xs, centered, text-balance, mb-8)
- Overall hero: py-12 to py-16

**Links Section:**
- Vertical stack (flex flex-col gap-3)
- Each link button: h-14, w-full (max-w-md centered), rounded-full or rounded-xl (theme-dependent)
- Link layout: Icon (optional, left), Title (center), External indicator (right)
- Spacing: px-6 for button content

**Images:**
- Profile pictures required
- Optional: Background gradients or subtle patterns (applied via theme system)
- No large hero images—profile photo is the visual anchor
- Custom theme backgrounds can include: mesh gradients, geometric patterns, or solid fills

**Footer:**
- Minimal: "Powered by Lynkz" + Create your own link (centered, py-8)

---

## Component Library

**Buttons:**
- Primary: h-10 to h-12, px-6, rounded-lg, medium weight text
- Link buttons (public): h-14, rounded-full, hover lifts slightly (transform scale)
- Icon buttons: size-10, rounded-lg

**Form Inputs:**
- Standard height: h-12
- Rounded: rounded-lg
- Label above: text-sm, mb-2, medium weight
- Focus states: ring-2 with offset

**Cards:**
- Dashboard cards: rounded-xl, p-6, subtle border or shadow
- Spacing between cards: gap-6
- Link cards: p-4, rounded-lg, border, transition-all

**Modals/Dialogs:**
- Centered overlay with backdrop blur
- Modal content: max-w-lg, rounded-2xl, p-6
- Close button: top-right, size-8

**Navigation:**
- Dashboard sidebar: w-64 on desktop, full-screen overlay on mobile
- Nav items: h-10, rounded-lg, px-4, with icon + label
- Active state: filled background

---

## Theme Customization System

**Pre-built Themes (8-10 options):**
- Minimal (clean, high contrast)
- Sunset (warm gradient)
- Ocean (cool tones)
- Neon (vibrant, dark mode)
- Earth (natural, muted)
- Premium: Glassmorphism, Aurora, Midnight

**Customization Options:**
- Button shape: rounded-full vs rounded-xl
- Button style: filled, outlined, soft-shadow
- Layout density: compact vs spacious (affects gap values)
- Font pairing: 3-4 preset combinations

---

## Responsive Behavior

**Breakpoints:**
- Mobile (default): Single column, simplified navigation
- Tablet (md: 768px): Two-column dashboard sections where appropriate
- Desktop (lg: 1024px): Full sidebar + preview panel visible

**Mobile Priorities:**
- Stack all dashboard sections vertically
- Hide preview panel (add preview button to open modal)
- Full-width link buttons on public profiles
- Bottom navigation for main actions

---

## Visual Hierarchy & Spacing

**Vertical Rhythm:**
- Section spacing: mb-12 to mb-16 (dashboard)
- Component groups: mb-6 to mb-8
- Related items: mb-3 to mb-4

**Content Density:**
- Dashboard: Comfortable (more whitespace, easier scanning)
- Public profiles: Compact (links closer together, efficient scrolling)

**Elevation System:**
- Base: Flat or subtle border
- Interactive: Soft shadow on hover
- Raised: Medium shadow for modals
- Dragging: Stronger shadow with slight scale

---

This design creates a professional, conversion-focused experience where creators can efficiently manage their presence while their public profiles express their unique brand identity.