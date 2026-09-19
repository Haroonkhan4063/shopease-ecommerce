// Seeds the database with:
//   - An admin account (Muhammad Haroon Khan)
//   - A pre-approved dummy seller
//   - 52 diverse products across Electronics, Clothing, and Home Goods
//
// Images are fetched LIVE from the Pexels API (free) using a clean search term per
// product — this is the actually-correct fix for "images don't match the product":
// Pexels' own search engine does real semantic matching against millions of real
// photos, instead of a developer guessing fixed photo IDs from memory (which is how
// the earlier mismatches happened). If a search returns nothing or the API call
// fails (e.g. no key set), that one product falls back to a safe generic photo for
// its category so the seed never crashes.
//
// Setup: get a free key at https://www.pexels.com/api/ (instant, no credit card),
// then add PEXELS_API_KEY=your_key to .env.
//
// Run with: node scripts/seed.js
// Safe to re-run — clears previously seeded products (under the dummy seller) first.

require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");

const DUMMY_SELLER_EMAIL = "demo.seller@shopease.example";
const ADMIN_EMAIL = "admin@shopease.example";
const ADMIN_PASSWORD = "admin123456"; // change after first login in a real deployment
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Used only if the Pexels API call fails for a given product (no key, network error,
// rate limit, or zero results) — one safe, category-correct photo so seeding never breaks.
const fallbackImage = {
  Electronics: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
  Clothing: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
  "Home Goods": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
};

// [name, description, minPrice, maxPrice, searchTerm]
// searchTerm is a short, clean phrase (no brand-ish marketing words) so Pexels' search
// returns an accurate, relevant photo.
const templates = {
  Electronics: [
    ["UltraBook Pro 14 Laptop", "14-inch laptop with a crisp display and all-day battery life.", 899, 1499, "laptop computer"],
    ["AeroBook Air 13 Laptop", "Ultra-thin, ultra-light laptop built for portability.", 799, 1199, "thin laptop"],
    ["GameForce 15 RTX Laptop", "High-refresh gaming laptop with dedicated graphics.", 1499, 2199, "gaming laptop"],
    ["Nova X12 Smartphone", "Flagship smartphone with a 120Hz AMOLED display.", 599, 899, "smartphone"],
    ["Pulse Mini 5G Smartphone", "Compact 5G phone for everyday use.", 349, 549, "mobile phone"],
    ["Vertex Fold 2 Smartphone", "Foldable smartphone, phone and tablet in one.", 1299, 1799, "foldable phone"],
    ["SoundWave Pro Earbuds", "True wireless earbuds with active noise cancellation.", 89, 159, "wireless earbuds"],
    ["BassLine Over-Ear Headphones", "Studio-quality over-ear headphones with deep bass.", 79, 149, "over ear headphones"],
    ["TrackGlide Wireless Mouse", "Ergonomic wireless mouse with a silent click.", 24, 49, "computer mouse"],
    ["TypeMaster Mechanical Keyboard", "Hot-swappable mechanical keyboard with RGB.", 59, 109, "mechanical keyboard"],
    ["ViewFrame 27\" Monitor", "27-inch QHD monitor for work and gaming.", 229, 399, "computer monitor"],
    ["SnapShot X200 Camera", "Mirrorless camera with a fast autofocus system.", 549, 899, "mirrorless camera"],
    ["PulseFit Smartwatch", "Fitness smartwatch with heart-rate and sleep tracking.", 129, 229, "smartwatch"],
    ["TabView 10 Tablet", "10-inch tablet great for reading and streaming.", 199, 349, "tablet device"],
    ["EchoSound Bluetooth Speaker", "Portable speaker with 12-hour battery life.", 39, 79, "bluetooth speaker"],
    ["CoreCharge 20W Adapter", "Compact fast-charging wall adapter.", 15, 29, "phone charger adapter"],
    ["PowerBank 10000mAh", "Slim power bank for charging on the go.", 19, 35, "power bank"],
    ["StreamCam HD Webcam", "1080p webcam with a built-in noise-cancelling mic.", 35, 69, "webcam"],
  ],
  Clothing: [
    ["Classic Fit Cotton T-Shirt", "Soft, breathable cotton tee for everyday wear.", 12, 24, "white t-shirt"],
    ["Slim Fit Denim Jeans", "Stretch denim jeans with a modern slim cut.", 34, 59, "denim jeans"],
    ["Water-Resistant Windbreaker Jacket", "Lightweight jacket built for unpredictable weather.", 45, 79, "windbreaker jacket"],
    ["Everyday Running Sneakers", "Cushioned sneakers designed for daily runs.", 49, 89, "running sneakers"],
    ["Summer Floral Dress", "Flowy floral dress, perfect for warm days.", 29, 55, "floral summer dress"],
    ["Pullover Fleece Hoodie", "Cozy fleece hoodie for cooler days.", 27, 49, "hoodie sweatshirt"],
    ["Classic Wool Beanie", "Warm knit beanie for winter.", 9, 18, "wool beanie hat"],
    ["Merino Wool Scarf", "Soft merino wool scarf in neutral tones.", 15, 29, "wool scarf"],
    ["Everyday Crew Socks (3-pack)", "Breathable cotton-blend crew socks.", 8, 15, "crew socks"],
    ["Cable Knit Sweater", "Classic cable knit sweater for layering.", 39, 69, "knit sweater"],
    ["Relaxed Fit Chino Pants", "Comfortable chinos for work or weekends.", 32, 54, "chino pants"],
    ["Polarized Aviator Sunglasses", "UV-protective polarized sunglasses.", 19, 39, "aviator sunglasses"],
    ["Leather Belt", "Genuine leather belt with a classic buckle.", 22, 38, "leather belt"],
    ["Quilted Puffer Vest", "Lightweight insulated vest for chilly mornings.", 35, 59, "puffer vest"],
    ["Graphic Print Hoodie", "Cotton-blend hoodie with a minimalist print.", 29, 49, "graphic hoodie"],
    ["Formal Button-Down Shirt", "Wrinkle-resistant shirt for the office.", 25, 45, "button down shirt"],
    ["Athletic Performance Shorts", "Moisture-wicking shorts for training.", 18, 32, "athletic shorts"],
  ],
  "Home Goods": [
    ["High-Speed Blender", "700W blender for smoothies, soups, and more.", 39, 69, "kitchen blender"],
    ["Adjustable LED Desk Lamp", "Dimmable LED lamp with USB charging port.", 22, 42, "desk lamp"],
    ["Decorative Throw Cushions (Set of 2)", "Soft accent cushions for sofas and beds.", 24, 44, "throw cushions sofa"],
    ["10-Piece Non-Stick Cookware Set", "Durable non-stick cookware for everyday cooking.", 79, 139, "cookware pots pans"],
    ["Egyptian Cotton Bedsheet Set", "Breathable, soft bedsheet set with pillowcases.", 34, 64, "bedsheet set bed"],
    ["Programmable Drip Coffee Maker", "12-cup coffee maker with a built-in timer.", 29, 54, "coffee maker"],
    ["Cordless Handheld Vacuum", "Lightweight vacuum for quick cleanups.", 59, 99, "handheld vacuum cleaner"],
    ["Minimalist Canvas Wall Art", "Framed canvas print for modern interiors.", 19, 39, "canvas wall art"],
    ["Ceramic Plant Pot Set", "Set of 3 ceramic pots for indoor plants.", 18, 32, "ceramic plant pot"],
    ["Scented Soy Candle Set", "Set of 3 long-burning soy candles.", 16, 29, "scented candle"],
    ["Memory Foam Bath Mat", "Absorbent, quick-dry memory foam bath mat.", 14, 26, "bath mat"],
    ["Stainless Steel Knife Set", "6-piece kitchen knife set with a wooden block.", 44, 79, "kitchen knife set"],
    ["Bamboo Cutting Board Set", "Set of 3 eco-friendly bamboo cutting boards.", 21, 38, "wooden cutting board"],
    ["Electric Kettle 1.7L", "Fast-boil electric kettle with auto shut-off.", 25, 45, "electric kettle"],
    ["Storage Ottoman Bench", "Multi-purpose ottoman with hidden storage.", 49, 89, "storage ottoman"],
    ["Air Purifier for Small Rooms", "HEPA air purifier for bedrooms and offices.", 59, 109, "air purifier"],
    ["Weighted Blanket 15lb", "Cozy weighted blanket for better sleep.", 39, 69, "weighted blanket"],
  ],
};

const randomBetween = (min, max) => Math.round(min + Math.random() * (max - min));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchPexelsImage = async (searchTerm, category) => {
  if (!PEXELS_API_KEY) return fallbackImage[category];

  try {
    const { data } = await axios.get("https://api.pexels.com/v1/search", {
      headers: { Authorization: PEXELS_API_KEY },
      params: { query: searchTerm, per_page: 1, orientation: "square" },
      timeout: 8000,
    });

    const photo = data.photos?.[0];
    return photo ? photo.src.large : fallbackImage[category];
  } catch (err) {
    console.warn(`  ! Pexels lookup failed for "${searchTerm}" — using fallback image.`);
    return fallbackImage[category];
  }
};

const buildProducts = async () => {
  const products = [];

  for (const [category, items] of Object.entries(templates)) {
    for (const [name, description, minPrice, maxPrice, searchTerm] of items) {
      const price = randomBetween(minPrice, maxPrice);
      const hasDiscount = Math.random() < 0.35; // ~35% of products get a discount price
      const discountPrice = hasDiscount ? Math.round(price * 0.85) : null;

      console.log(`Fetching image for "${name}" (query: "${searchTerm}")...`);
      const image = await fetchPexelsImage(searchTerm, category);
      await sleep(250); // stay well under Pexels' free-tier rate limit

      products.push({
        name,
        description,
        price,
        discountPrice,
        category,
        stock: randomBetween(10, 120),
        image,
      });
    }
  }
  return products;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for seeding...");

  if (!PEXELS_API_KEY) {
    console.warn(
      "WARNING: PEXELS_API_KEY not set in .env — all products will use generic category fallback images.\n" +
        "Get a free key at https://www.pexels.com/api/ for accurate, product-matched photos."
    );
  }

  // Admin account
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    admin = await User.create({
      name: "Muhammad Haroon Khan",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Created admin: ${admin.email} / ${ADMIN_PASSWORD} (change this password after first login)`);
  } else if (admin.name !== "Muhammad Haroon Khan") {
    admin.name = "Muhammad Haroon Khan";
    await admin.save();
  }

  // Dummy approved seller
  let seller = await User.findOne({ email: DUMMY_SELLER_EMAIL });
  if (!seller) {
    seller = await User.create({
      name: "Demo Seller",
      email: DUMMY_SELLER_EMAIL,
      password: "seedpassword123",
      role: "seller",
      shopInfo: {
        shopName: "ShopEase Demo Store",
        shopDescription: "Demo storefront used to populate the catalog for development and screenshots.",
        isApproved: true,
      },
    });
    console.log(`Created dummy seller: ${seller.email}`);
  } else if (!seller.shopInfo.isApproved) {
    seller.shopInfo.isApproved = true;
    await seller.save();
  }

  // Clear previously seeded products under this seller, then insert fresh ones
  await Product.deleteMany({ seller: seller._id });

  const generated = await buildProducts();
  const docs = generated.map((p) => ({
    seller: seller._id,
    name: p.name,
    description: p.description,
    price: p.price,
    discountPrice: p.discountPrice,
    category: p.category,
    stock: p.stock,
    images: [{ url: p.image, public_id: `seed/${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` }],
  }));

  await Product.insertMany(docs);
  console.log(`\nSeeded ${docs.length} products across ${Object.keys(templates).length} categories.`);
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
