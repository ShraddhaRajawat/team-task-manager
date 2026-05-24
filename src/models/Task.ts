import mongoose, { type InferSchemaType, type Model } from "mongoose";

export type TaskStatus = "Todo" | "In Progress" | "Done";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    description: { type: String, default: "", maxlength: 4000 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    status: { type: String, required: true, enum: ["Todo", "In Progress", "Done"], default: "Todo", index: true },
    dueDate: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export type TaskDoc = InferSchemaType<typeof TaskSchema> & { _id: mongoose.Types.ObjectId };

export const Task: Model<TaskDoc> = (mongoose.models.Task as Model<TaskDoc>) || mongoose.model("Task", TaskSchema);

