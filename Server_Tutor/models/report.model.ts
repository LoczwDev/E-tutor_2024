import mongoose, { Document, Model, Schema } from "mongoose";
import { User } from "./user.model";
import { Course } from "./courses.model";
import { Post } from "./post.model";

export interface Report extends Document {
  user: User;
  type: string;
  reason: string;
  comment: Comment;
  course: Course;
  post: Post;
}

const reportSchema = new Schema<Report>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ReportModel: Model<Report> = mongoose.model("Report", reportSchema);
export default ReportModel;
