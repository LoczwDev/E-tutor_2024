import mongoose, { Document, Model, Schema } from "mongoose";
import { User } from "stream-chat";

export interface Apply extends Document {
  user: User;
  aboutMe: string;
  facebook: string;
  website: string;
  youtube: string;
  tiktok: string;
  phone: string;
  branch: string;
  status: string;
  file: {
    public_id: string;
    url: string;
  };
}
const applySchema = new Schema<Apply>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    aboutMe: {
      type: String,
      required: true,
    },
    facebook: {
      type: String,
    },
    website: {
      type: String,
    },
    youtube: {
      type: String,
    },
    tiktok: {
      type: String,
    },
    phone: {
      type: String,
    },
    branch: {
      type: String,
    },
    file: {
      public_id: { type: String },
      url: { type: String },
    },
    status: {
      type: String,
      default: "Chưa trả lời",
    },
  },
  { timestamps: true }
);

const ApplyModel: Model<Apply> = mongoose.model("Apply", applySchema);
export default ApplyModel;
