import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "./category.schema.js";
import { isAthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middileware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import {
  allCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from "./category.controller.js";
import subcategoryRouter from "../subcategory/subcategory.router.js";
const router = Router();
router.use("/:categoryId/subcategory", subcategoryRouter);
router.use("/subcategory", subcategoryRouter);
//CRUD
//ADD CATEGORY
router.post(
  "/",
  isAthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("category"),
  validation(createCategorySchema),
  createCategory
);
//UPDATE CATEGORY
router.patch(
  "/:categoryId",
  isAthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("category"),
  validation(updateCategorySchema),
  updateCategory
);

//DELETE CATEGORY
router.delete(
  "/:categoryId",
  isAthenticated,
  isAuthorized("admin"),
  validation(deleteCategorySchema),
  deleteCategory
);
//GET ALL CATEGORIES
router.get("/", allCategories);
export default router;
