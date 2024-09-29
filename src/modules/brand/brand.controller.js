import slugify from "slugify";
import { Brand } from "../../../DB/models/brand.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
//create brand
export const createBrand = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error("brand image is required!"));
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.FOLDER_CLOUD_NAME}/brand` }
  );
  const brand = await Brand.create({
    name: req.body.name,
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
    slug: slugify(req.body.name),
  });
  return res.status(201).json({ success: true, resaults: brand });
});

//update brand
export const updateBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandId);
  if (!brand) return next(new Error("brand not found !"));
  brand.name = req.body.name ? req.body.name : brand.name;
  brand.slug = req.body.name ? slugify(req.body.name) : brand.slug;
  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: brand.image.id,
    });
    brand.image.url = secure_url;
  }
  await brand.save();
  return res.json({ success: true, message: "brand updated!" });
});
//delete brand
export const deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandId);
  if (!brand) return next(new Error("brand not found !"));

  await cloudinary.uploader.destroy(brand.image.id);

  await Brand.findByIdAndDelete(req.params.brandId);
  return res.json({ success: true, message: "brand deleted!" });
});
//get all brands
export const allBrands = asyncHandler(async (req, res, next) => {
  const brands = await Brand.find();
  return res.json({ success: true, resaults: brands });
});
