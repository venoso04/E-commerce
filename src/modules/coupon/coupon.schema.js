import joi from "joi";

export const createCoupon = joi
  .object({
    expiredAt: joi.date().greater(Date.now()).required(),
    discount: joi.number().min(1).max(100).required(),
  })
  .required();
//update coupon
export const updateCoupon = joi
  .object({
    expiredAt: joi.date().greater(Date.now()),
    discount: joi.number().min(1).max(100),
    code: joi.string().length(5).required(),
  })
  .or("discount", "expiredAt")
  .required();
//delete coupon
export const deleteCoupon = joi
  .object({
    code: joi.string().length(5).required(),
  })
  .required();
