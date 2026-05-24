import mongoose, { type InferSchemaType, type Model } from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  },
  { timestamps: true }
);

export type TeamDoc = InferSchemaType<typeof TeamSchema> & { _id: mongoose.Types.ObjectId };

export const Team: Model<TeamDoc> = (mongoose.models.Team as Model<TeamDoc>) || mongoose.model("Team", TeamSchema);

