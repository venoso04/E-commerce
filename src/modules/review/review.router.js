import { Router } from "express";
import * as reviewSchema from "./review.schema.js";
import * as reviewController from "./review.controller.js";
import { isAthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middileware.js";
import { validation } from "../../middleware/validation.middleware.js";
const router = Router({ mergeParams: true });

// add review
router.post(
  "/",
  isAthenticated,
  isAuthorized("user"),
  validation(reviewSchema.addReview),
  reviewController.addReview
);
// update review
router.patch(
  "/:id",
  isAthenticated,
  isAuthorized("user"),
  validation(reviewSchema.updateReview),
  reviewController.updateReview
);
export default router;
