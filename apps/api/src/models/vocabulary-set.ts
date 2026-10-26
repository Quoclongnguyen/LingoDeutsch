import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { model, models, Schema } = mongoose;

const vocabularySetSchema = new Schema(
  {
    description: { trim: true, type: String },
    isArchived: { default: false, required: true, type: Boolean },
    kind: { enum: ["personal", "lesson"], required: true, type: String },
    name: { required: true, trim: true, type: String },
    sourceLessonId: { ref: "Lesson", type: Schema.Types.ObjectId },
    userId: { required: true, type: Schema.Types.ObjectId },
  },
  {
    collection: "vocabularySets",
    timestamps: true,
  },
);

vocabularySetSchema.index({ userId: 1, name: 1 });
vocabularySetSchema.index(
  { userId: 1, sourceLessonId: 1 },
  {
    name: "unique_active_lesson_set_per_user",
    partialFilterExpression: { isArchived: false, kind: "lesson" },
    unique: true,
  },
);

export type VocabularySet = InferSchemaType<typeof vocabularySetSchema>;

export const VocabularySetModel =
  (models.VocabularySet as Model<VocabularySet> | undefined) ??
  model<VocabularySet>("VocabularySet", vocabularySetSchema);
