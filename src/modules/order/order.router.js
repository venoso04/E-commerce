import express, { Router } from "express";
import * as orderSchema from "./order.schema.js";
import * as orderController from "./order.controller.js";
import { isAthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middileware.js";
import { validation } from "../../middleware/validation.middleware.js";
const router = Router();

// create order
router.post(
  "/",
  isAthenticated,
  isAuthorized("user"),
  validation(orderSchema.placeOrder),
  orderController.placeOrder
);
// cancel order
router.patch(
  "/:id",
  isAthenticated,
  isAuthorized("user"),
  validation(orderSchema.cancelOrder),
  orderController.cancelOrder
);
// webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  orderController.orderWebhook
);

export default router;
