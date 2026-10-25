import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { model, models, Schema } = mongoose;

const reviewLogSchema = new Schema(
  {
    nextState: { required: true, type: Schema.Types.Mixed },
    previousState: { required: true, type: Schema.Types.Mixed },
    rating: {
      enum: ["again", "hard", "good", "easy"],
      required: true,
      type: String,
    },
    responseTimeMs: { min: 0, type: Number },
    reviewEventId: { required: true, type: String },
    reviewedAt: { default: Date.now, required: true, type: Date },
    sessionId: {
      ref: "ReviewSession",
      required: true,
      type: Schema.Types.ObjectId,
    },
    userId: { required: true, type: Schema.Types.ObjectId },
    wordId: {
      ref: "VocabularyWord",
      required: true,
      type: Schema.Types.ObjectId,
    },
  },
  {
    collection: "reviewLogs",
    versionKey: false,
  },
);

reviewLogSchema.index({ reviewEventId: 1 }, { unique: true });
reviewLogSchema.index({ userId: 1, reviewedAt: -1 });
reviewLogSchema.index({ userId: 1, wordId: 1, reviewedAt: -1 });

export type ReviewLog = InferSchemaType<typeof reviewLogSchema>;

export const ReviewLogModel =
  (models.ReviewLog as Model<ReviewLog> | undefined) ??
  model<ReviewLog>("ReviewLog", reviewLogSchema);
