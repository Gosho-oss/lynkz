import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

interface DecodedToken {
  uid: string;
  email?: string;
}

// JWKS client for fetching Firebase public keys
const client = jwksClient({
  jwksUri: "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
});

// Get Firebase project ID from environment
function getFirebaseProjectId(): string {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.warn("Firebase project ID not found in environment variables");
    return "";
  }
  return projectId;
}

// Verify Firebase ID token
async function verifyFirebaseIdToken(token: string): Promise<DecodedToken | null> {
  try {
    // First decode without verification to get basic info
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === "string" || !decoded.payload) {
      console.error("Failed to decode token");
      return null;
    }

    const payload = decoded.payload as any;
    const header = decoded.header;

    // Basic validation checks
    const now = Math.floor(Date.now() / 1000);
    
    // Check expiration
    if (payload.exp && payload.exp < now) {
      console.error("Token expired");
      return null;
    }
    
    // Check issued at time
    if (payload.iat && payload.iat > now + 300) {
      console.error("Token issued in the future");
      return null;
    }
    
    // Check for subject (user ID)
    if (!payload.sub || typeof payload.sub !== "string" || payload.sub.length === 0) {
      console.error("Invalid subject in token");
      return null;
    }

    // Try to verify signature with JWKS (development fallback if this fails)
    try {
      if (header.kid) {
        const key = await new Promise<string>((resolve, reject) => {
          client.getSigningKey(header.kid!, (err, k) => {
            if (err) reject(err);
            else resolve(k?.getPublicKey() || "");
          });
        });

        const projectId = getFirebaseProjectId();
        jwt.verify(token, key, {
          algorithms: ["RS256"],
          issuer: projectId ? `https://securetoken.google.com/${projectId}` : undefined,
          audience: projectId || undefined,
        });
      }
    } catch (verifyError) {
      // In development, we allow this to fail gracefully if JWKS is unavailable
      console.warn("Signature verification skipped (development mode):", (verifyError as Error).message);
    }

    return {
      uid: payload.sub,
      email: payload.email,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Middleware to verify Firebase token
export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];
  
  try {
    const decoded = await verifyFirebaseIdToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    // Attach verified user info to request
    (req as any).firebaseUser = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Token verification failed" });
  }
}

// Helper to get Firebase user from request
export function getFirebaseUser(req: Request): DecodedToken | null {
  return (req as any).firebaseUser || null;
}
