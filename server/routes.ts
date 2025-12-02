import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyFirebaseToken, getFirebaseUser } from "./auth";
import { verifyAdminAccess, isAdminEmail } from "./admin-auth";
import { insertUserSchema, insertLinkSchema, updateUserSchema, updateLinkSchema } from "@shared/schema";
import { defaultThemes } from "../client/src/lib/themes";
import multer from "multer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const uploadsPath = path.join(process.cwd(), "uploads");
    require("express").static(uploadsPath)(req, res, next);
  });

  // ==================== PUBLIC ROUTES ====================

  // Check username availability
  app.get("/api/users/check-username/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const existingUser = await storage.getUserByUsername(username);
      res.json({ available: !existingUser });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get public profile
  app.get("/api/public/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's links
      const links = await storage.getLinksByUserId(user.id);
      const activeLinks = links.filter((l) => l.isActive);
      
      // Get user's theme
      let theme = null;
      if (user.themeId) {
        theme = await storage.getTheme(user.themeId);
      }
      
      // If no theme in DB, check default themes
      if (!theme && user.themeId) {
        const defaultTheme = defaultThemes.find((t) => t.id === user.themeId);
        if (defaultTheme) {
          theme = { ...defaultTheme, createdAt: new Date() };
        }
      }
      
      // Default to minimal theme
      if (!theme) {
        theme = { ...defaultThemes[0], createdAt: new Date() };
      }
      
      res.json({
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        links: activeLinks,
        theme,
      });
    } catch (error) {
      console.error("Error fetching public profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all themes
  app.get("/api/themes", async (req, res) => {
    try {
      // Get themes from database
      let themes = await storage.getAllThemes();
      
      // If no themes in database, seed with defaults
      if (themes.length === 0) {
        for (const theme of defaultThemes) {
          await storage.createTheme({
            name: theme.name,
            description: theme.description,
            isPremium: theme.isPremium,
            settings: theme.settings,
          });
        }
        themes = await storage.getAllThemes();
      }
      
      res.json(themes);
    } catch (error) {
      console.error("Error fetching themes:", error);
      // Return default themes on error
      res.json(defaultThemes.map((t) => ({ ...t, createdAt: new Date() })));
    }
  });

  // ==================== PROTECTED ROUTES ====================

  // Create user (after Firebase auth)
  app.post("/api/users", verifyFirebaseToken, async (req, res) => {
    try {
      const firebaseUser = getFirebaseUser(req);
      if (!firebaseUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate request body
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: result.error.flatten() 
        });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByFirebaseUid(firebaseUser.uid);
      if (existingUser) {
        return res.json(existingUser);
      }
      
      // Check username availability
      const usernameExists = await storage.getUserByUsername(result.data.username);
      if (usernameExists) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Create user with default theme
      const user = await storage.createUser({
        ...result.data,
        firebaseUid: firebaseUser.uid,
        themeId: "minimal",
        role: isAdminEmail(result.data.email) ? "admin" : "user",
      });
      
      // Update last login
      await storage.updateLastLogin(user.id);
      
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get current user
  app.get("/api/users/me", verifyFirebaseToken, async (req, res) => {
    try {
      const firebaseUser = getFirebaseUser(req);
      if (!firebaseUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update last login
      await storage.updateLastLogin(user.id);
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update current user
  app.patch("/api/users/me", verifyFirebaseToken, async (req, res) => {
    try {
      const firebaseUser = getFirebaseUser(req);
      if (!firebaseUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate update data
      const result = updateUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: result.error.flatten() 
        });
      }
      
      const updatedUser = await storage.updateUser(user.id, result.data);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Upload avatar
  app.post("/api/users/me/avatar", verifyFirebaseToken, upload.single("avatar"), async (req, res) => {
    try {
      const firebaseUser = getFirebaseUser(req);
      if (!firebaseUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Delete old avatar if exists
      if (user.avatarUrl && user.avatarUrl.startsWith("/uploads/")) {
        const oldPath = path.join(process.cwd(), user.avatarUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const updatedUser = await storage.updateUser(user.id, { avatarUrl });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ==================== LINKS ROUTES ====================

  // Get user's links
  app.get("/api/links", verifyFirebaseToken, async (req, res) => {
    try {
      const firebaseUser = getFirebaseUser(req);
      if (!firebaseUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const links = await storage.getLinksByUserId(user.id);
      res.json(links);
    } catch (error) {
      console.error("Error fetching links:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create link
  app.post("/api/links", verifyFirebaseToken, async (req, res) => {
    try {
      const firebaseUser = getFirebaseUser(req);
      if (!firebaseUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate link data
      const result = insertLinkSchema.safeParse({
        ...req.body,
        userId: user.id,
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: result.error.flatten() 
        });
      }
      
      const link = await storage.createLink(result.data);
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating link:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update link
  app.patch("/api/links/:id", verifyFirebaseToken, async (req, res) => {
    try {
      const firebaseUser = getFirebaseUser(req);
      if (!firebaseUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { id } = req.params;
      const link = await storage.getLink(id);
      
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }
      
      // Check ownership
      if (link.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate update data
      const result = updateLinkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: result.error.flatten() 
        });
      }
      
      const updatedLink = await storage.updateLink(id, result.data);
      res.json(updatedLink);
    } catch (error) {
      console.error("Error updating link:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete link
  app.delete("/api/links/:id", verifyFirebaseToken, async (req, res) => {
    try {
      const firebaseUser = getFirebaseUser(req);
      if (!firebaseUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { id } = req.params;
      const link = await storage.getLink(id);
      
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }
      
      // Check ownership
      if (link.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteLink(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting link:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Reorder links
  app.post("/api/links/reorder", verifyFirebaseToken, async (req, res) => {
    try {
      const firebaseUser = getFirebaseUser(req);
      if (!firebaseUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ message: "orderedIds must be an array" });
      }
      
      await storage.reorderLinks(user.id, orderedIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering links:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ==================== ADMIN ROUTES ====================

  // Verify admin password (doesn't require Firebase auth)
  app.post("/api/admin/verify", async (req, res) => {
    try {
      const { password } = req.body;
      const { verifyAdminPassword } = await import("./admin-auth");
      
      if (verifyAdminPassword(password)) {
        res.json({ valid: true });
      } else {
        res.status(403).json({ valid: false, message: "Invalid admin password" });
      }
    } catch (error) {
      console.error("Error verifying admin password:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get user by ID (admin only)
  app.get("/api/admin/users/:id", verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's links
      const links = await storage.getLinksByUserId(id);
      
      res.json({ ...user, links });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update user subscription (admin only)
  app.patch("/api/admin/users/:id/subscription", verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const { subscriptionTier, isPremium } = req.body;
      
      if (!subscriptionTier || !['free', 'starter', 'premium'].includes(subscriptionTier)) {
        return res.status(400).json({ message: "Invalid subscription tier" });
      }
      
      const updatedUser = await storage.updateUser(id, {
        subscriptionTier,
        isPremium: subscriptionTier === 'premium' || subscriptionTier === 'starter',
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user subscription:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Prevent admin from deleting themselves
      const firebaseUser = getFirebaseUser(req);
      const currentUser = await storage.getUserByFirebaseUid(firebaseUser!.uid);
      if (currentUser?.id === id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      // Delete user's avatar if exists
      if (user.avatarUrl && user.avatarUrl.startsWith("/uploads/")) {
        const avatarPath = path.join(process.cwd(), user.avatarUrl);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }
      
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ==================== QR CODE GENERATION ====================

  // Generate QR code for user profile
  app.get("/api/qr/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate profile URL
      const profileUrl = `${req.protocol}://${req.get('host')}/u/${username}`;
      
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      res.json({ qrCode: qrCodeDataUrl, profileUrl });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
