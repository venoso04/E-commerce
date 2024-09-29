import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";
// create subcategory
export const createsubcategorySchema = Joi.object({
  name: Joi.string().min(4).max(15).required(),
  createdBy: Joi.string().custom(isValidObjectId),
  categoryId: Joi.string().custom(isValidObjectId),
}).required();
// update subcategory
export const updatesubcategorySchema = Joi.object({
  name: Joi.string().min(4).max(15),
  categoryId: Joi.string().custom(isValidObjectId),
  subcategoryId: Joi.string().custom(isValidObjectId),
}).required();
// delete subcategory
export const deletesubcategorySchema = Joi.object({
  categoryId: Joi.string().custom(isValidObjectId),
  subcategoryId: Joi.string().custom(isValidObjectId),
}).required();
