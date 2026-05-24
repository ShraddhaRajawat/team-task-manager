import mongoose, { type InferSchemaType, type Model } from "mongoose";

export type UserRole = "admin" | "member";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "member"], default: "member" },
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User: Model<UserDoc> = (mongoose.models.User as Model<UserDoc>) || mongoose.model("User", UserSchema);

