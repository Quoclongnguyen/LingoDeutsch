import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { model, models, Schema } = mongoose;

const exerciseAttemptSchema = new Schema(
  {
    attemptEventId: { required: true, trim: true, type: String },
    completedAt: { default: Date.now, required: true, type: Date },
    incorrectExerciseIds: { default: [], required: true, type: [String] },
    score: { min: 0, required: true, type: Number },
    sourceId: { required: true, type: Schema.Types.ObjectId },
    sourceType: {
      enum: ["lesson", "grammar_topic"],
      required: true,
      type: String,
    },
    total: { min: 1, required: true, type: Number },
    userId: { required: true, type: Schema.Types.ObjectId },
  },
  { collection: "exerciseAttempts", timestamps: true, versionKey: false },
);

exerciseAttemptSchema.index({ attemptEventId: 1 }, { unique: true });
exerciseAttemptSchema.index({ userId: 1, completedAt: -1 });
exerciseAttemptSchema.index({
  userId: 1,
  sourceType: 1,
  sourceId: 1,
  completedAt: -1,
});

export type ExerciseAttempt = InferSchemaType<typeof exerciseAttemptSchema>;

export const ExerciseAttemptModel =
  (models.ExerciseAttempt as Model<ExerciseAttempt> | undefined) ??
  model<ExerciseAttempt>("ExerciseAttempt", exerciseAttemptSchema);
