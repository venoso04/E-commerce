import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";
// add product
export const createProduct = Joi.object({
  name: Joi.string().min(2).max(20).required(),
  description: Joi.string(),
  availableItems: Joi.number().min(1).required(),
  price: Joi.number().min(1).required(),
  discount: Joi.number().min(1).max(100),
  category: Joi.string().custom(isValidObjectId).required(),
  subCategory: Joi.string().custom(isValidObjectId).required(),
  brand: Joi.string().custom(isValidObjectId).required(),
});

//valid id
export const productId = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
}).required();
//update product
export const updateProduct = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  name: Joi.string().min(2).max(20),
  description: Joi.string(),
  availableItems: Joi.number().min(1),
  price: Joi.number().min(1),
  discount: Joi.number().min(1).max(100),
  category: Joi.string().custom(isValidObjectId),
  subCategory: Joi.string().custom(isValidObjectId),
  brand: Joi.string().custom(isValidObjectId),
});
