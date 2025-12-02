/**
 * Script to update the admin user account
 * Run this after the admin has signed up with their email
 */

import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_EMAIL = "petkovwork11@gmail.com";

async function setupAdmin() {
  console.log("Setting up admin account...");
  console.log(`Looking for user with email: ${ADMIN_EMAIL}`);

  try {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL));

    if (!user) {
      console.error(`\nUser with email ${ADMIN_EMAIL} not found.`);
      console.log("\nPlease:");
      console.log("1. Sign up with this email first");
      console.log("2. Then run this script again\n");
      process.exit(1);
    }

    // Update user to admin role
    const [updated] = await db
      .update(users)
      .set({
        role: "admin",
        subscriptionTier: "premium",
        isPremium: true,
      })
      .where(eq(users.id, user.id))
      .returning();

    console.log("\n✅ Admin account set up successfully!");
    console.log(`User: ${updated.username}`);
    console.log(`Email: ${updated.email}`);
    console.log(`Role: ${updated.role}`);
    console.log(`Subscription: ${updated.subscriptionTier}`);
    console.log("\nAdmin credentials:");
    console.log(`Email: petkovwork11@gmail.com`);
    console.log(`Password: gR8$kN1!wH5^bV3@qT7Zp0#LxF2mEy`);
    console.log(`Admin Password: u#9FZ!3pQm^T2x@L7v$eR1k&G0hYWc8Sjd4NPa5XqVbEr`);
    console.log("\n");
    
    process.exit(0);
  } catch (error) {
    console.error("Error setting up admin:", error);
    process.exit(1);
  }
}

setupAdmin();
