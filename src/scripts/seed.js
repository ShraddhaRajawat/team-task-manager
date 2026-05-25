const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Load .env.local manually to get MONGODB_URI
const envPath = path.join(__dirname, "..", "..", ".env.local");
let mongodbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/team-task-manager";

if (!process.env.MONGODB_URI && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent.split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*MONGODB_URI\s*=\s*(.+)$/);
    if (match) {
      mongodbUri = match[1].trim();
      break;
    }
  }
}

console.log("Connecting to database:", mongodbUri);

// Define User schema directly to avoid import issues
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "member"], default: "member" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  try {
    await mongoose.connect(mongodbUri);
    console.log("Connected to MongoDB successfully.");

    const email = "shraddharajawat20@gmail.com";
    const name = "Shraddha";
    const defaultPassword = "Password123"; // Changed to match the implementation plan

    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      existingUser.passwordHash = passwordHash;
      existingUser.role = "admin";
      await existingUser.save();
      console.log("-----------------------------------------");
      console.log("Existing user password updated successfully!");
      console.log(`Name:     ${existingUser.name}`);
      console.log(`Email:    ${existingUser.email}`);
      console.log(`Password: ${defaultPassword}`);
      console.log("-----------------------------------------");
      process.exit(0);
    }

    // Create user
    const adminUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "admin",
    });

    console.log("-----------------------------------------");
    console.log("Admin user created successfully!");
    console.log(`Name:     ${adminUser.name}`);
    console.log(`Email:    ${adminUser.email}`);
    console.log(`Password: ${defaultPassword}`);
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
