import { Types, Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    orderId: { type: Types.ObjectId, ref: "Order", required: true },
  },
  { timestamps: true }
);

export const Review = model("Review", reviewSchema);
