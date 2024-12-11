import mongoose, { Document, Model, Schema } from "mongoose";
import { User } from "stream-chat";

export interface Post extends Document {
  title: string;
  content: string;
  thumbnail: {
    public_id: string;
    url: string;
  };
  topic: string;
  tags: string[];
  user: User;
  favorite?: number;
  status: string;
}

const postSchema = new Schema<Post>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    topic: { type: String },
    tags: [{ type: String }],
    thumbnail: {
      public_id: { type: String },
      url: { type: String },
    },
    favorite: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      default: "Nháp",
    },
  },
  { timestamps: true }
);

const PostModel: Model<Post> = mongoose.model("Post", postSchema);

export default PostModel;
