import mongoose, { Document, Model, Schema } from "mongoose";
import { User } from "stream-chat";

export interface Questions extends Document {
  question: string;
  answers: string[];
  correctAnswer: number;
}

export interface Quiz extends Document {
  user: User;
  quizTitle: string;
  questions: Questions[];
}
const questionsSchema = new Schema<Questions>(
  {
    question: {
      type: String,
      required: true,
    },
    answers: [String],
    correctAnswer: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const quizSchema = new Schema<Quiz>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quizTitle: {
      type: String,
      required: true,
    },
    questions: [questionsSchema],
  },
  { timestamps: true }
);

const QuizModel: Model<Quiz> = mongoose.model("Quiz", quizSchema);
export default QuizModel;
