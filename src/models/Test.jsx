import mongoose from "mongoose"

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  questionImage: {
    type: String,
    default: "",
  },
  questionType: {
    type: String,
    enum: ["mcq", "numerical"],
    default: "mcq",
  },
  type: {
    type: String,
    enum: ["MCQ", "NUMERICAL", "mcq", "numerical"],
    default: "MCQ",
  },
  options: [
    {
      text: String,
      image: String,
    },
  ],
  correctAnswer: {
    type: Number,
    min: 0,
    max: 3,
  },
  numericalAnswer: {
    type: Number,
  },
  explanation: {
    type: String,
    default: "",
  },
  subject: {
    type: String,
    required: true,
    enum: ["Physics", "Chemistry", "Mathematics"],
  },
  chapter: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  marks: {
    positive: {
      type: Number,
      default: 4,
    },
    negative: {
      type: Number,
      default: -1,
    },
  },
  tags: [
    {
      type: String,
      lowercase: true,
    },
  ],
  level: {
    type: String,
    enum: ["JEE Main", "JEE Advanced", "NEET", "Class 11", "Class 12", "CBSE", "ICSE"],
    default: "JEE Main",
  },
  topic: {
    type: String,
    default: "",
  },
  metadata: {
    questionType: {
      type: String,
      enum: ["MCQ", "NUMERICAL"],
    },
    subject: {
      type: String,
      enum: ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
    },
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
    },
    chapter: {
      type: String,
    },
    level: {
      type: String,
    },
    topic: {
      type: String,
    },
  },
  topicTags: [
    {
      type: String,
    },
  ],
  conceptTags: [
    {
      type: String,
    },
  ],
  difficultyLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
})

const TestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["full-syllabus", "chapter-wise"],
      required: true,
    },
    subject: {
      type: String,
      enum: ["Physics", "Chemistry", "Mathematics", "All", "All Subjects"],
      required: true,
    },
    chapter: {
      type: String,
      default: "",
    },
    class: {
      type: String,
      required: true,
      enum: ["11", "12", "Dropper"],
    },
    questions: [QuestionSchema],
    duration: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    instructions: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Enhanced rating and statistics system
    statistics: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      completedAttempts: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      averageTime: {
        type: Number,
        default: 0,
      },
      difficultyRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },
    testMetadata: {
      totalMCQ: {
        type: Number,
        default: 0,
      },
      totalNumerical: {
        type: Number,
        default: 0,
      },
      subjectDistribution: {
        Physics: { type: Number, default: 0 },
        Chemistry: { type: Number, default: 0 },
        Mathematics: { type: Number, default: 0 },
      },
      difficultyDistribution: {
        Easy: { type: Number, default: 0 },
        Medium: { type: Number, default: 0 },
        Hard: { type: Number, default: 0 },
      },
      levelDistribution: {
        "JEE Main": { type: Number, default: 0 },
        "JEE Advanced": { type: Number, default: 0 },
        NEET: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Test || mongoose.model("Test", TestSchema)
