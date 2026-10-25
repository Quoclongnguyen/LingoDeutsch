import mongoose, { type InferSchemaType, type Model } from "mongoose";

import {
  articles,
  cefrLevels,
  governedCases,
  wordTypes,
} from "@lingo-deutsch/shared";

const { model, models, Schema } = mongoose;

const exampleSchema = new Schema(
  {
    de: { type: String, required: true, trim: true },
    vi: { type: String, trim: true },
  },
  { _id: false },
);

const grammarSchema = new Schema(
  {
    governedCase: { enum: governedCases, type: String },
    governedPreposition: { trim: true, type: String },
    notes: { trim: true, type: String },
    reflexive: { type: Boolean },
    separable: { type: Boolean },
    separablePrefix: { trim: true, type: String },
  },
  { _id: false },
);

const vocabularyWordSchema = new Schema(
  {
    article: { enum: articles, type: String },
    examples: { default: [], type: [exampleSchema] },
    grammar: { default: {}, type: grammarSchema },
    headword: { required: true, trim: true, type: String },
    isArchived: { default: false, required: true, type: Boolean },
    level: { enum: cefrLevels, type: String },
    meaningsVi: { required: true, type: [String] },
    noPlural: { default: false, required: true, type: Boolean },
    normalizedHeadword: { required: true, trim: true, type: String },
    plural: { trim: true, type: String },
    setIds: { default: [], type: [Schema.Types.ObjectId] },
    sourceLessonId: { ref: "Lesson", type: Schema.Types.ObjectId },
    userId: { required: true, type: Schema.Types.ObjectId },
    wordType: { enum: wordTypes, required: true, type: String },
  },
  {
    collection: "vocabularyWords",
    timestamps: true,
  },
);

vocabularyWordSchema.index(
  { userId: 1, normalizedHeadword: 1 },
  {
    name: "unique_active_headword_per_user",
    partialFilterExpression: { isArchived: false },
    unique: true,
  },
);
vocabularyWordSchema.index({ userId: 1, setIds: 1 });
vocabularyWordSchema.index({ userId: 1, level: 1, wordType: 1 });
vocabularyWordSchema.index({
  headword: "text",
  meaningsVi: "text",
  plural: "text",
});

export type VocabularyWord = InferSchemaType<typeof vocabularyWordSchema>;

export const VocabularyWordModel =
  (models.VocabularyWord as Model<VocabularyWord> | undefined) ??
  model<VocabularyWord>("VocabularyWord", vocabularyWordSchema);
