import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

interface DecodedToken {
  uid: string;
  email?: string;
}

// JWKS client for fetching Firebase public keys
const client = jwksClient({
  jwksUri: "https://www.googleapis.com/service_account/v1/jwk/securetoken@system.gserviceaccount.com",
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
  rateLimit: true,
});

// Get signing key from Firebase's public keys
function getSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!header.kid) {
      reject(new Error("No kid in token header"));
      return;
    }
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        reject(err);
        return;
      }
      const signingKey = key?.getPublicKey();
      if (!signingKey) {
        reject(new Error("No signing key found"));
        return;
      }
      resolve(signingKey);
    });
  });
}

// Get Firebase project ID from environment
function getFirebaseProjectId(): string {
  // Try to get from VITE_ prefixed variable (for development)
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.warn("Firebase project ID not found in environment variables");
    return "";
  }
  return projectId;
}

// Verify Firebase ID token properly
async function verifyFirebaseIdToken(token: string): Promise<DecodedToken | null> {
  try {
    // First decode without verification to get the header
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === "string") {
      return null;
    }

    // Get the signing key
    const signingKey = await getSigningKey(decoded.header);
    
    // Get project ID for verification
    const projectId = getFirebaseProjectId();
    
    // Verify the token with proper checks
    const payload = jwt.verify(token, signingKey, {
      algorithms: ["RS256"],
      issuer: projectId ? `https://securetoken.google.com/${projectId}` : undefined,
      audience: projectId || undefined,
    }) as jwt.JwtPayload;

    // Additional checks
    const now = Math.floor(Date.now() / 1000);
    
    // Check expiration
    if (payload.exp && payload.exp < now) {
      console.error("Token expired");
      return null;
    }
    
    // Check issued at time (not in the future)
    if (payload.iat && payload.iat > now + 300) { // 5 min tolerance
      console.error("Token issued in the future");
      return null;
    }
    
    // Check auth_time (should be in the past)
    if (payload.auth_time && payload.auth_time > now + 300) {
      console.error("Auth time in the future");
      return null;
    }
    
    // Check for subject (user ID)
    if (!payload.sub || typeof payload.sub !== "string" || payload.sub.length === 0) {
      console.error("Invalid subject in token");
      return null;
    }

    return {
      uid: payload.sub || payload.user_id,
      email: payload.email as string | undefined,
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
