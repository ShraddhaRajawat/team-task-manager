import mongoose, { type InferSchemaType, type Model } from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

export type ProjectDoc = InferSchemaType<typeof ProjectSchema> & { _id: mongoose.Types.ObjectId };

export const Project: Model<ProjectDoc> =
  (mongoose.models.Project as Model<ProjectDoc>) || mongoose.model("Project", ProjectSchema);

