import { Schema, model, Document, Model } from "mongoose";
import { User } from "./user.model";
import { Course } from "./courses.model";
import { Post } from "./post.model";

// Định nghĩa interface cho Comment
export interface Comment extends Document {
  user: User;
  desc: string;
  course: Course;
  post: Post;
  lectureId: string;
  block: boolean;
  parent?: string;
  replyOnUser?: string;
}

// Định nghĩa schema cho Comment
const CommentSchema = new Schema<Comment>(
  {
    user: Object,
    desc: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", default: null },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    lectureId: String,
    block: { type: Boolean, default: false },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    replyOnUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);
CommentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parent",
});

const CommentModel: Model<Comment> = model<Comment>("Comment", CommentSchema);
export default CommentModel;
