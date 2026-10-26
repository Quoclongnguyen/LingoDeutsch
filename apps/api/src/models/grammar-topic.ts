import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { model, models, Schema } = mongoose;

const grammarExampleSchema = new Schema(
  {
    de: { required: true, trim: true, type: String },
    vi: { required: true, trim: true, type: String },
  },
  { _id: false },
);

const grammarTopicSchema = new Schema(
  {
    compactTable: { type: Schema.Types.Mixed },
    examples: { default: [], required: true, type: [grammarExampleSchema] },
    exercises: { default: [], required: true, type: [Schema.Types.Mixed] },
    level: {
      enum: ["A1", "A2", "B1", "B2", "C1"],
      required: true,
      type: String,
    },
    order: { min: 1, required: true, type: Number },
    published: { default: false, required: true, type: Boolean },
    relatedLessonSlugs: { default: [], required: true, type: [String] },
    rules: { default: [], required: true, type: [Schema.Types.Mixed] },
    slug: { required: true, trim: true, type: String },
    summaryVi: { required: true, trim: true, type: String },
    titleDe: { required: true, trim: true, type: String },
    titleVi: { required: true, trim: true, type: String },
  },
  {
    collection: "grammarTopics",
    timestamps: true,
  },
);

grammarTopicSchema.index({ slug: 1 }, { unique: true });
grammarTopicSchema.index({ level: 1, order: 1, published: 1 });

export type GrammarTopic = InferSchemaType<typeof grammarTopicSchema>;

export const GrammarTopicModel =
  (models.GrammarTopic as Model<GrammarTopic> | undefined) ??
  model<GrammarTopic>("GrammarTopic", grammarTopicSchema);
