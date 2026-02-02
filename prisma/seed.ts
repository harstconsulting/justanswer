import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const password = await bcrypt.hash("Admin1234!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password,
      role: "admin",
      status: "active",
      profile: { create: { name: "System Admin", locale: "de" } }
    }
  });

  const categories = [
    "Recht",
    "Medizin",
    "Technik",
    "Auto",
    "Steuern",
    "Immobilien",
    "Haushalt",
    "Business"
  ];

  await prisma.category.createMany({
    data: categories.map((name) => ({ name })),
    skipDuplicates: true
  });

  console.log("Seeded admin", admin.email);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
