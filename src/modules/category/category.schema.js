import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

// create category
export const createCategorySchema = Joi.object({
  name: Joi.string().min(4).max(15).required(),
  createdBy: Joi.string().custom(isValidObjectId),
}).required();
// update category
export const updateCategorySchema = Joi.object({
  name: Joi.string().min(4).max(15),
  categoryId: Joi.string().custom(isValidObjectId),
}).required();
// delete category
export const deleteCategorySchema = Joi.object({
  categoryId: Joi.string().custom(isValidObjectId),
}).required();
