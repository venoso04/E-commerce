import { Order } from "../../../DB/models/order.model.js";
import { Review } from "../../../DB/models/review.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { calcAverageRate } from "./review.service.js";

export const addReview = asyncHandler(async (req, res, next) => {
  const { comment, rating } = req.body;
  const { productId } = req.params;

  //check product in order
  const order = await Order.findOne({
    user: req.user._id,
    status: "delivered",
    "products.productId": productId,
  });
  if (!order)
    return next(
      new Error("can not review this product you have not ordered it!", {
        cause: 400,
      })
    );
  //check past reviews
  const isReview = await Review.findOne({
    createdBy: req.user._id,
    productId,
    orderId: order._id,
  });
  if (isReview) return next(new Error("already reviewd!"));
  //create review
  const review = await Review.create({
    productId,
    createdBy: req.user._id,
    rating,
    comment,
    orderId: order._id,
  });
  // calc average rate
  calcAverageRate(productId);

  return res.json({ success: true, resaults: { review } });
});
export const updateReview = asyncHandler(async (req, res, next) => {
  const { productId, id } = req.params;
  const review = await Review.findOneAndUpdate(
    { _id: id, productId },
    { ...req.body },
    { new: true }
  );
  if (req.body.rating) {
    // calc average rate
    calcAverageRate(productId);
  }
  return res.json({ success: true, resaults: { review } });
});
