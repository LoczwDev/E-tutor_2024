import mongoose, { Document, Model, Schema } from "mongoose";
import { Course } from "./courses.model";
import { User } from "stream-chat";

export interface Order extends Document {
  courses: Course[];
  user: User;
  tutor: User;
  payment_info: object;
  amountTutor: Number;
  amountAdmin: Number;
  emailOrder: string;
}

const orderSchema = new mongoose.Schema<Order>(
  {
    courses: [Object],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amountTutor: {
      type: Number,
    },
    amountAdmin: {
      type: Number,
    },
    payment_info: {
      type: Object,
      // required: true,
    },
    emailOrder: {
      type: String,
    },
  },
  { timestamps: true }
);

const OrderModel: Model<Order> = mongoose.model("Order", orderSchema);
export default OrderModel;
