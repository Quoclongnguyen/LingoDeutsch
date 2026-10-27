import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { model, models, Schema } = mongoose;

const lessonProgressSchema = new Schema(
  {
    completedActivityIds: { default: [], type: [String] },
    completedAt: { type: Date },
    currentActivityIndex: { default: 0, min: 0, required: true, type: Number },
    lessonId: { ref: "Lesson", required: true, type: Schema.Types.ObjectId },
    startedAt: { type: Date },
    status: {
      default: "not_started",
      enum: ["not_started", "in_progress", "completed"],
      required: true,
      type: String,
    },
    userId: { required: true, type: Schema.Types.ObjectId },
  },
  {
    collection: "lessonProgress",
    timestamps: true,
  },
);

lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
lessonProgressSchema.index({ userId: 1, updatedAt: -1 });

export type LessonProgress = InferSchemaType<typeof lessonProgressSchema>;

export const LessonProgressModel =
  (models.LessonProgress as Model<LessonProgress> | undefined) ??
  model<LessonProgress>("LessonProgress", lessonProgressSchema);
