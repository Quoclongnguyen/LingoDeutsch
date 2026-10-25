import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { model, models, Schema } = mongoose;

const reviewStateSchema = new Schema(
  {
    dueAt: { default: Date.now, required: true, type: Date },
    easeFactor: {
      default: 2.5,
      max: 3,
      min: 1.3,
      required: true,
      type: Number,
    },
    intervalDays: { default: 0, min: 0, required: true, type: Number },
    lapseCount: { default: 0, min: 0, required: true, type: Number },
    lastReviewedAt: { type: Date },
    repetitions: { default: 0, min: 0, required: true, type: Number },
    state: {
      default: "new",
      enum: ["new", "learning", "review", "mastered"],
      required: true,
      type: String,
    },
    userId: { required: true, type: Schema.Types.ObjectId },
    wordId: {
      ref: "VocabularyWord",
      required: true,
      type: Schema.Types.ObjectId,
    },
  },
  {
    collection: "reviewStates",
    timestamps: true,
  },
);

reviewStateSchema.index({ userId: 1, wordId: 1 }, { unique: true });
reviewStateSchema.index({ userId: 1, dueAt: 1, state: 1 });

export type ReviewState = InferSchemaType<typeof reviewStateSchema>;

export const ReviewStateModel =
  (models.ReviewState as Model<ReviewState> | undefined) ??
  model<ReviewState>("ReviewState", reviewStateSchema);
