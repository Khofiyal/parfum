// prisma/seed.ts
// Data awal untuk development & testing

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin user ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123456", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@parfumstore.com" },
    update: {},
    create: {
      email: "admin@parfumstore.com",
      name: "Admin",
      role: "ADMIN",
      passwordHash: adminPassword,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Admin user:", admin.email);

  // ─── Test user ───────────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash("User@123456", 12);

  const testUser = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      name: "Test User",
      role: "USER",
      passwordHash: userPassword,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Test user:", testUser.email);

  // ─── Sample products ─────────────────────────────────────────────────────
  const products = [
    {
      name: "Black Opium",
      slug: "ysl-black-opium-edp-50ml",
      brand: "Yves Saint Laurent",
      description:
        "Aroma kopi yang adiktif berpadu dengan bunga putih dan vanila. Parfum feminin yang berani dan penuh pesona untuk wanita modern.",
      price: 1850000,
      stock: 25,
      imageUrls: ["https://assets.example.com/products/black-opium.jpg"],
      topNotes: ["Pink Pepper", "Orange Blossom", "Pear"],
      middleNotes: ["Coffee", "Jasmine", "Bitter Almond"],
      baseNotes: ["Vanilla", "White Musk", "Patchouli", "Cedarwood"],
      category: "oriental",
      size: "50ml",
      concentration: "EDP",
      gender: "feminine",
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Bleu de Chanel",
      slug: "chanel-bleu-de-chanel-edp-100ml",
      brand: "Chanel",
      description:
        "Parfum maskulin yang segar dan elegan. Perpaduan citrus, kayu aromatik, dan frankincense menciptakan aura yang berwibawa namun tetap modern.",
      price: 2750000,
      stock: 18,
      imageUrls: ["https://assets.example.com/products/bleu-de-chanel.jpg"],
      topNotes: ["Lemon", "Mint", "Pink Pepper", "Grapefruit"],
      middleNotes: ["Ginger", "Nutmeg", "Jasmine", "Iso E Super"],
      baseNotes: ["Incense", "Vetiver", "Cedar", "Sandalwood", "Patchouli"],
      category: "woody",
      size: "100ml",
      concentration: "EDP",
      gender: "masculine",
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Flowerbomb",
      slug: "viktor-rolf-flowerbomb-edp-50ml",
      brand: "Viktor & Rolf",
      description:
        "Ledakan bunga yang manis dan intens. Sambutan teh hijau yang segar segera berubah menjadi bouquet floral yang kaya dan hangat.",
      price: 1650000,
      stock: 30,
      imageUrls: ["https://assets.example.com/products/flowerbomb.jpg"],
      topNotes: ["Tea", "Bergamot"],
      middleNotes: ["Jasmine", "Freesia", "Orchid", "Rose", "Patchouli"],
      baseNotes: ["Musk", "Vanilla", "Amber"],
      category: "floral",
      size: "50ml",
      concentration: "EDP",
      gender: "feminine",
      isActive: true,
      isFeatured: false,
    },
    {
      name: "Dior Sauvage",
      slug: "dior-sauvage-edt-100ml",
      brand: "Dior",
      description:
        "Bebas dan liar seperti lanskap yang terbuka. Bergamot Calabria yang segar bertemu ambergris mentah untuk aroma yang raw sekaligus elegan.",
      price: 2100000,
      stock: 12,
      imageUrls: ["https://assets.example.com/products/dior-sauvage.jpg"],
      topNotes: ["Bergamot", "Pepper"],
      middleNotes: ["Sichuan Pepper", "Lavender", "Pink Pepper", "Vetiver", "Patchouli"],
      baseNotes: ["Amberwood", "Ambergris", "Labdanum", "Musk"],
      category: "woody",
      size: "100ml",
      concentration: "EDT",
      gender: "masculine",
      isActive: true,
      isFeatured: true,
    },
    {
      name: "Chance Eau Tendre",
      slug: "chanel-chance-eau-tendre-edp-50ml",
      brand: "Chanel",
      description:
        "Ringan, segar, dan menawan. Grapefruit dan quince yang ceria berpadu jasmine dan white musk untuk aroma yang anggun dan feminin.",
      price: 1950000,
      stock: 8,
      imageUrls: ["https://assets.example.com/products/chance-tendre.jpg"],
      topNotes: ["Grapefruit", "Quince"],
      middleNotes: ["Hyacinth", "Jasmine"],
      baseNotes: ["White Musk", "Cedar", "Amber"],
      category: "fresh",
      size: "50ml",
      concentration: "EDP",
      gender: "feminine",
      isActive: true,
      isFeatured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
    console.log("✅ Product:", product.name);
  }

  // ─── Test user address ───────────────────────────────────────────────────
  await prisma.address.upsert({
    where: { id: "cltest-address-001" },
    update: {},
    create: {
      id: "cltest-address-001",
      userId: testUser.id,
      label: "Rumah",
      recipientName: "Test User",
      phone: "08123456789",
      fullAddress: "Jl. Sudirman No. 1, RT 01/RW 01",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12190",
      isDefault: true,
    },
  });

  console.log("✅ Test address created");
  console.log("🎉 Seeding selesai!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
