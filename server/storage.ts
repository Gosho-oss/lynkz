import { 
  users, 
  links, 
  themes,
  type User, 
  type InsertUser, 
  type UpdateUser,
  type Link, 
  type InsertLink, 
  type UpdateLink,
  type Theme,
  type InsertTheme,
} from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: UpdateUser): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  updateLastLogin(userId: string): Promise<void>;
  
  // Links
  getLinksByUserId(userId: string): Promise<Link[]>;
  getLink(id: string): Promise<Link | undefined>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(id: string, data: UpdateLink): Promise<Link | undefined>;
  deleteLink(id: string): Promise<void>;
  reorderLinks(userId: string, orderedIds: string[]): Promise<void>;
  
  // Themes
  getAllThemes(): Promise<Theme[]>;
  getTheme(id: string): Promise<Theme | undefined>;
  createTheme(theme: InsertTheme): Promise<Theme>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, id })
      .returning();
    return user;
  }

  async updateUser(id: string, data: UpdateUser): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateLastLogin(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Links
  async getLinksByUserId(userId: string): Promise<Link[]> {
    return db
      .select()
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(asc(links.orderIndex));
  }

  async getLink(id: string): Promise<Link | undefined> {
    const [link] = await db.select().from(links).where(eq(links.id, id));
    return link || undefined;
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const id = randomUUID();
    const [link] = await db
      .insert(links)
      .values({ ...insertLink, id })
      .returning();
    return link;
  }

  async updateLink(id: string, data: UpdateLink): Promise<Link | undefined> {
    const [link] = await db
      .update(links)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(links.id, id))
      .returning();
    return link || undefined;
  }

  async deleteLink(id: string): Promise<void> {
    await db.delete(links).where(eq(links.id, id));
  }

  async reorderLinks(userId: string, orderedIds: string[]): Promise<void> {
    // Update each link's order index
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(links)
        .set({ orderIndex: i, updatedAt: new Date() })
        .where(eq(links.id, orderedIds[i]));
    }
  }

  // Themes
  async getAllThemes(): Promise<Theme[]> {
    return db.select().from(themes);
  }

  async getTheme(id: string): Promise<Theme | undefined> {
    const [theme] = await db.select().from(themes).where(eq(themes.id, id));
    return theme || undefined;
  }

  async createTheme(insertTheme: InsertTheme): Promise<Theme> {
    const themeData = {
      name: insertTheme.name,
      description: insertTheme.description,
      isPremium: insertTheme.isPremium,
      settings: insertTheme.settings as any,
    };
    const [theme] = await db
      .insert(themes)
      .values(themeData)
      .returning();
    return theme;
  }
}

export const storage = new DatabaseStorage();
