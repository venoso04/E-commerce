import { Router } from "express";
import { isAthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middileware.js";
import * as cartSchema from "./cart.schema.js";
import * as cartController from "./cart.controller.js";
import { validation } from "../../middleware/validation.middleware.js";
const router = Router();

//add to cart
router.post(
  "/",
  isAthenticated,
  isAuthorized("user"),
  validation(cartSchema.addToCart),
  cartController.addToCart
);
//get cart
router.get(
  "/",
  isAthenticated,
  isAuthorized("user", "admin"),
  validation(cartSchema.getCart),
  cartController.getCart
);
// update cart
router.patch(
  "/",
  isAthenticated,
  isAuthorized("user"),
  validation(cartSchema.addToCart),
  cartController.updateCart
);
// remove product from  cart
router.patch(
  "/:productId",
  isAthenticated,
  isAuthorized("user"),
  validation(cartSchema.removeFromCart),
  cartController.removeFromCart
);
// clear cart
router.put(
  "/clear",
  isAthenticated,
  isAuthorized("user"),
  cartController.clearCart
);

export default router;
