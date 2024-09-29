import { Router } from "express";
import { isAthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middileware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as couponSchema from "./coupon.schema.js";
import * as couponController from "./coupon.controller.js";
const router = Router();

//create coupon
router.post(
  "/",
  isAthenticated,
  isAuthorized("admin"),
  validation(couponSchema.createCoupon),
  couponController.createCoupon
);
//update coupon
router.patch(
  "/:code",
  isAthenticated,
  isAuthorized("admin"),
  validation(couponSchema.updateCoupon),
  couponController.updateCoupon
);
//delete coupon
router.delete(
  "/:code",
  isAthenticated,
  isAuthorized("admin"),
  validation(couponSchema.deleteCoupon),
  couponController.deleteCoupon
);
//get all coupons
router.get("/", isAuthorized("admin"), couponController.allCoupons);

export default router;
