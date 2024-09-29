import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import {
  createBrandSchema,
  deleteBrandSchema,
  updateBrandSchema,
} from "./brand.schema.js";
import { isAthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middileware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import {
  allBrands,
  createBrand,
  deleteBrand,
  updateBrand,
} from "./brand.controller.js";
const router = Router();

//CRUD
//ADD brand
router.post(
  "/",
  isAthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("brand"),
  validation(createBrandSchema),
  createBrand
);
//UPDATE brand
router.patch(
  "/:brandId",
  isAthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("brand"),
  validation(updateBrandSchema),
  updateBrand
);

//DELETE brand
router.delete(
  "/:brandId",
  isAthenticated,
  isAuthorized("admin"),
  validation(deleteBrandSchema),
  deleteBrand
);
//GET ALL CATEGORIES
router.get("/", allBrands);

export default router;
