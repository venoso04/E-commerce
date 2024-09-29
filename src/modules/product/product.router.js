import { Router } from "express";
import { isAthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middileware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as productSchema from "./product.schema.js";
import * as productController from "./product.controller.js";
import reviewRouter from "../review/review.router.js";
const router = Router();

router.use("/:productId/review", reviewRouter);

//create product
router.post(
  "/",
  isAthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "images", maxCount: 3 },
  ]),
  validation(productSchema.createProduct),
  productController.createProduct
);
//delete product
router.delete(
  "/:id",
  isAthenticated,
  isAuthorized("admin"),
  validation(productSchema.productId),
  productController.deleteProduct
);
// Update product
router.patch(
  "/:id",
  isAthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "images", maxCount: 3 },
  ]),
  validation(productSchema.updateProduct),
  productController.updateProduct
);

//all products
router.get("/", productController.allProducts);
//get product reviews
router.get(
  "/:id",
  validation(productSchema.productId),
  productController.productReviews
);
export default router;
