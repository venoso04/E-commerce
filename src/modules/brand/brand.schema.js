import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

// create brand
export const createBrandSchema = Joi.object({
  name: Joi.string().min(4).max(15).required(),
}).required();
// update brand
export const updateBrandSchema = Joi.object({
  name: Joi.string().min(4).max(15),
  brandId: Joi.string().custom(isValidObjectId).required(),
}).required();
// delete brand
export const deleteBrandSchema = Joi.object({
  brandId: Joi.string().custom(isValidObjectId).required(),
}).required();
