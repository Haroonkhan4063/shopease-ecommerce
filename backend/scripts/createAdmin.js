// One-time script to create the first admin account.
// Run with: node scripts/createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Muhammad Haroon Khan";

  if (!email || !password) {
    console.log("Usage: node scripts/createAdmin.js <email> <password> [name]");
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log(`Existing user ${email} promoted to admin.`);
  } else {
    await User.create({ name, email, password, role: "admin" });
    console.log(`Admin account created: ${email}`);
  }

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
