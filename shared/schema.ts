import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - stores user profile information
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: varchar("firebase_uid", { length: 128 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  themeId: varchar("theme_id", { length: 36 }),
  isPremium: boolean("is_premium").default(false),
  role: varchar("role", { length: 20 }).default("user").notNull(), // 'user' or 'admin'
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free").notNull(), // 'free', 'starter', or 'premium'
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Links table - stores user's links
export const links = pgTable("links", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 100 }).notNull(),
  url: text("url").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Themes table - stores available themes
export const themes = pgTable("themes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  isPremium: boolean("is_premium").default(false),
  settings: jsonb("settings").notNull().$type<ThemeSettings>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Theme settings type
export interface ThemeSettings {
  background: string;
  backgroundType: "solid" | "gradient" | "mesh";
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: string;
  textColor: string;
  buttonStyle: "filled" | "outlined" | "soft";
  buttonShape: "rounded-full" | "rounded-xl" | "rounded-lg" | "rounded-none";
  buttonBackground: string;
  buttonTextColor: string;
  buttonBorderColor?: string;
  fontFamily: string;
  accentColor: string;
  // Animation settings (premium only)
  animations?: {
    buttonHover?: "scale" | "glow" | "lift" | "shimmer" | "none";
    buttonTransition?: "smooth" | "bouncy" | "none";
    entranceAnimation?: "fade" | "slide" | "zoom" | "none";
    backgroundAnimation?: "gradient-shift" | "particles" | "none";
  };
  // Subscription tier required
  requiredTier?: "free" | "starter" | "premium";
}

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  links: many(links),
  theme: one(themes, {
    fields: [users.themeId],
    references: [themes.id],
  }),
}));

export const linksRelations = relations(links, ({ one }) => ({
  user: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
}));

export const themesRelations = relations(themes, ({ many }) => ({
  users: many(users),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertLinkSchema = createInsertSchema(links).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertThemeSchema = createInsertSchema(themes).omit({
  id: true,
  createdAt: true,
});

// Update schemas
export const updateUserSchema = insertUserSchema.partial();
export const updateLinkSchema = insertLinkSchema.partial();

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Link = typeof links.$inferSelect;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type UpdateLink = z.infer<typeof updateLinkSchema>;

export type Theme = typeof themes.$inferSelect;
export type InsertTheme = z.infer<typeof insertThemeSchema>;

// Public profile type for frontend
export interface PublicProfile {
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  links: Link[];
  theme: Theme | null;
}
