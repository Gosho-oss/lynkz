import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Admin password for accessing admin features
const ADMIN_PASSWORD = "u#9FZ!3pQm^T2x@L7v$eR1k&G0hYWc8Sjd4NPa5XqVbEr";

// Admin user credentials
export const ADMIN_CREDENTIALS = {
  email: "petkovwork11@gmail.com",
  password: "gR8$kN1!wH5^bV3@qT7Zp0#LxF2mEy",
};

/**
 * Verify if the provided admin password is correct
 */
export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

/**
 * Middleware to verify admin role and admin password
 */
export async function verifyAdminAccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get admin password from header
    const adminPassword = req.headers["x-admin-password"] as string;

    if (!adminPassword) {
      res.status(401).json({ message: "Admin password required" });
      return;
    }

    // Verify admin password
    if (!verifyAdminPassword(adminPassword)) {
      res.status(403).json({ message: "Invalid admin password" });
      return;
    }

    // Get Firebase user from previous middleware
    const firebaseUser = (req as any).firebaseUser;
    if (!firebaseUser) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get user from database
    const user = await storage.getUserByFirebaseUid(firebaseUser.uid);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify user has admin role
    if (user.role !== "admin") {
      res.status(403).json({ message: "Admin access required" });
      return;
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Check if a user email is the designated admin email
 */
export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
}
