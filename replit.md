# Lynkz - Link-in-Bio Application

## Overview

Lynkz is a link-in-bio web application that allows users to create customizable profile pages with multiple links, similar to Linktree. Users can authenticate via Firebase, manage their profile and links through a dashboard, and share a public profile page at `/u/[username]`. The application features theme customization, avatar uploads, and a mobile-first responsive design inspired by Instagram, Linktree, and Notion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type safety
- Vite as the development server and build tool
- Wouter for lightweight client-side routing
- TailwindCSS for utility-first styling with custom design tokens

**UI Component System:**
- Shadcn/ui component library (Radix UI primitives)
- "New York" style variant with custom theming
- Design system based on HSL color tokens with CSS variables for theme switching
- Custom spacing primitives using Tailwind units (2, 3, 4, 6, 8, 12, 16)

**State Management:**
- TanStack Query (React Query) for server state management and caching
- React Context API for authentication state
- React Hook Form with Zod for form validation

**Key Design Decisions:**
- Mobile-first approach with max-width containers (max-w-md for profiles, max-w-4xl for dashboard)
- Dual personality: minimal dashboard for efficiency + expressive public profiles
- Typography: Inter for UI/body, display fonts for profile names
- Container strategy centers content with responsive padding

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- HTTP server created via Node's `http` module for WebSocket support potential
- Middleware-based request handling with custom logging

**Authentication Strategy:**
- Firebase Authentication for user management (email/password + Google OAuth)
- JWT token verification using JWKS for Firebase public keys
- Custom middleware (`verifyFirebaseToken`) for protected routes
- Token-based authorization via Bearer tokens in request headers

**API Design:**
- RESTful API structure under `/api` prefix
- Public endpoints for username availability and public profiles
- Protected endpoints requiring Firebase authentication
- File upload handling via Multer (5MB limit, image types only)

**Build Process:**
- Dual build: Vite for client, esbuild for server
- Server bundling with selective dependency bundling (allowlist strategy)
- Production build outputs to `dist/` directory
- Separation of client (`dist/public`) and server bundles

### Data Storage

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database queries
- WebSocket-based connection pooling for Neon

**Schema Design:**
- `users` table: Firebase UID mapping, username, display name, bio, avatar URL, theme selection, premium status
- `links` table: User-owned links with title, URL, order index, active status
- `themes` table: Predefined and custom themes with JSONB settings storage

**Data Relationships:**
- One-to-many: User to Links (cascade delete)
- One-to-one: User to Theme (optional reference)

**Storage Strategy:**
- Database storage abstraction via `IStorage` interface
- Implementation: `DatabaseStorage` class with Drizzle ORM
- File uploads stored locally in `uploads/avatars/` directory
- Served statically via Express middleware

### External Dependencies

**Authentication:**
- Firebase Authentication (email/password, Google OAuth)
- Project configured via environment variables (`VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_API_KEY`, etc.)
- JWKS client for public key validation

**Database:**
- Neon Serverless PostgreSQL
- Connection via `DATABASE_URL` environment variable
- Drizzle Kit for migrations (stored in `migrations/` directory)

**File Management:**
- Multer for multipart/form-data handling
- Local filesystem storage (production may require cloud storage like S3)

**UI Libraries:**
- Radix UI primitives for accessible components
- Lucide React for icons
- React Icons (Google icon for OAuth button)
- TailwindCSS with PostCSS and Autoprefixer

**Development Tools:**
- Replit-specific plugins: runtime error modal, cartographer, dev banner
- TypeScript with strict mode enabled
- Path aliases for clean imports (`@/`, `@shared/`)

**Validation:**
- Zod for runtime type validation
- Drizzle-Zod for schema-to-Zod integration
- React Hook Form resolver integration

**Email Capabilities:**
- Nodemailer dependency (currently not implemented in codebase)

**Theme System:**
- Default themes stored in client-side configuration
- Theme settings include: background (solid/gradient/mesh), text color, button styles, font family, accent colors
- User can select from free and premium themes
- Settings stored as JSONB in database for flexibility