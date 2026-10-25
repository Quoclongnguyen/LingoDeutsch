import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { model, models, Schema } = mongoose;

const lessonSchema = new Schema(
  {
    content: { default: {}, required: true, type: Schema.Types.Mixed },
    estimatedMinutes: { min: 1, required: true, type: Number },
    lessonOrder: { min: 1, required: true, type: Number },
    level: {
      enum: ["A1", "A2", "B1", "B2", "C1"],
      required: true,
      type: String,
    },
    moduleOrder: { min: 1, required: true, type: Number },
    objectiveVi: { required: true, trim: true, type: String },
    published: { default: false, required: true, type: Boolean },
    slug: { required: true, trim: true, type: String },
    titleDe: { required: true, trim: true, type: String },
    titleVi: { required: true, trim: true, type: String },
    vocabularySeed: { default: [], required: true, type: [Schema.Types.Mixed] },
  },
  {
    collection: "lessons",
    timestamps: true,
  },
);

lessonSchema.index({ slug: 1 }, { unique: true });
lessonSchema.index({ level: 1, moduleOrder: 1, lessonOrder: 1 });

export type Lesson = InferSchemaType<typeof lessonSchema>;

export const LessonModel =
  (models.Lesson as Model<Lesson> | undefined) ??
  model<Lesson>("Lesson", lessonSchema);
