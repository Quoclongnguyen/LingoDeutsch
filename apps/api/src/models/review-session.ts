import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { model, models, Schema } = mongoose;

const reviewSessionSchema = new Schema(
  {
    completedAt: { type: Date },
    currentIndex: { default: 0, min: 0, required: true, type: Number },
    mode: {
      default: "de-vi",
      enum: ["de-vi", "vi-de", "cloze", "audio"],
      required: true,
      type: String,
    },
    reviewedWordIds: { default: [], type: [Schema.Types.ObjectId] },
    startedAt: { default: Date.now, required: true, type: Date },
    status: {
      default: "active",
      enum: ["active", "completed", "abandoned"],
      required: true,
      type: String,
    },
    userId: { required: true, type: Schema.Types.ObjectId },
    wordIds: { default: [], type: [Schema.Types.ObjectId] },
  },
  {
    collection: "reviewSessions",
    timestamps: true,
  },
);

reviewSessionSchema.index({ userId: 1, status: 1, updatedAt: -1 });
reviewSessionSchema.index(
  { userId: 1, mode: 1 },
  {
    partialFilterExpression: { status: "active" },
    unique: true,
  },
);

export type ReviewSession = InferSchemaType<typeof reviewSessionSchema>;

export const ReviewSessionModel =
  (models.ReviewSession as Model<ReviewSession> | undefined) ??
  model<ReviewSession>("ReviewSession", reviewSessionSchema);
