import "dotenv/config";
import { db } from "../server/db";
import { themes } from "../shared/schema";
import { defaultThemes } from "../client/src/lib/themes";
import { eq } from "drizzle-orm";

async function seedThemes() {
  console.log("🎨 Seeding themes to database...\n");

  // Get existing themes from database
  const existingThemes = await db.select().from(themes);
  const existingThemeNames = new Set(existingThemes.map(t => t.name));

  console.log(`Found ${existingThemes.length} existing themes in database`);
  console.log(`Total themes to sync: ${defaultThemes.length}\n`);

  let addedCount = 0;
  let skippedCount = 0;

  // Add new themes that don't exist
  for (const theme of defaultThemes) {
    if (existingThemeNames.has(theme.name)) {
      console.log(`⏭️  Skipping "${theme.name}" (already exists)`);
      skippedCount++;
      continue;
    }

    try {
      await db.insert(themes).values({
        name: theme.name,
        description: theme.description,
        isPremium: theme.isPremium,
        settings: theme.settings as any,
      });
      console.log(`✅ Added "${theme.name}" ${theme.isPremium ? "(Premium)" : "(Free)"}`);
      addedCount++;
    } catch (error) {
      console.error(`❌ Error adding "${theme.name}":`, error);
    }
  }

  console.log(`\n🎉 Theme seeding complete!`);
  console.log(`   Added: ${addedCount} new themes`);
  console.log(`   Skipped: ${skippedCount} existing themes`);
  console.log(`   Total: ${existingThemes.length + addedCount} themes in database`);

  process.exit(0);
}

seedThemes().catch((error) => {
  console.error("❌ Error seeding themes:", error);
  process.exit(1);
});
