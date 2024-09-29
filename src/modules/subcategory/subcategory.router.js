import { Router } from "express";
import { isAthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middileware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.middleware.js";
import {
  createsubcategorySchema,
  deletesubcategorySchema,
  updatesubcategorySchema,
} from "./subcategory.schema.js";
import {
  allSubcategories,
  createSubCategory,
  deleteSubcategory,
  updateSubcategory,
} from "./subcategory.controller.js";
const router = Router({ mergeParams: true });
//ADD SUBCATEGORY
router.post(
  "/",
  isAthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("subcategory"),
  validation(createsubcategorySchema),
  createSubCategory
);
//UPDATE SUBCATEGORY
router.patch(
  "/:subcategoryId",
  isAthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("category"),
  validation(updatesubcategorySchema),
  updateSubcategory
);
//DELETE SUBCATEGORY
router.delete(
  "/:subcategoryId",
  isAthenticated,
  isAuthorized("admin"),
  validation(deletesubcategorySchema),
  deleteSubcategory
);
//GET ALL SUBCATEGORIES
router.get("/", allSubcategories);

export default router;
