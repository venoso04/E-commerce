import { Product } from "../../../DB/models/product.model.js";
import { Review } from "../../../DB/models/review.model.js";

export const calcAverageRate = async (productId) => {
  // calc average rate
  let calcRate = 0;
  const product = await Product.findById(productId);
  const reviews = await Review.find({ productId });
  for (let i = 0; i < reviews.length; i++) {
    calcRate += reviews[i].rating;
  }
  product.averageRate = calcRate / reviews.length;
  await product.save();
};
