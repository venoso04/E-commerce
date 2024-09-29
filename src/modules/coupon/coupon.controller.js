import { Coupon } from "../../../DB/models/coupon.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import voucher from "voucher-code-generator";
// create coupon
export const createCoupon = asyncHandler(async (req, res, next) => {
  const code = voucher.generate({ length: 5 });
  const coupon = await Coupon.create({
    name: code[0],
    expiredAt: new Date(req.body.expiredAt).getTime(),
    discount: req.body.discount,
    createdBy: req.user._id,
  });
  return res.status(201).json({ success: true, resaults: { coupon } });
});

//update coupon
export const updateCoupon = asyncHandler(async (req, res, next) => {
  //check coupon
  const coupon = await Coupon.findOne({
    name: req.params.code,
    expiredAt: { $gt: Date.now() },
  });
  if (!coupon) return next(new Error("invalid code!"));
  coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
  coupon.expiredAt = req.body.expiredAt
    ? new Date(req.body.expiredAt).getTime()
    : coupon.expiredAt;
  await coupon.save();
  return res.json({
    success: true,
    resaults: coupon,
    message: "coupon update successfully",
  });
});
//delete coupon
export const deleteCoupon = asyncHandler(async (req, res, next) => {
  //check coupon
  const coupon = await Coupon.findOne({
    name: req.params.code,
  });
  if (!coupon) return next(new Error("invalid code!"));
  await Coupon.findOneAndDelete({ name: coupon.name });
  return res.json({ success: true, message: "coupon deleted successfully!" });
});
//get all coupons
export const allCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find();
  return res.json({ success: true, resaults: { coupons } });
});
