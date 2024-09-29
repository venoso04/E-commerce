import slugify from "slugify";
import { Category } from "../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";

//create subcategory
export const createSubCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  if (!req.file) return next(new Error("subcategory image is required!"));
  const category = await Category.findById(categoryId);
  if (!category) return next(new Error("Category not found", { cause: 404 }));
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.FOLDER_CLOUD_NAME}/subcategory` }
  );
  const subcategory = await Subcategory.create({
    name: req.body.name,
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
    slug: slugify(req.body.name),
    categoryId,
  });
  return res.status(201).json({ success: true, resaults: subcategory });
});
//update subcategory
export const updateSubcategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("category not found !"));
  const subcategory = await Subcategory.findOne({
    _id: req.params.subcategoryId,
    categoryId: req.params.categoryId,
  });
  if (!subcategory) return next(new Error("subcategory not found !"));
  subcategory.name = req.body.name ? req.body.name : subcategory.name;
  subcategory.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;
  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: subcategory.image.id,
    });
    subcategory.image.url = secure_url;
  }
  await subcategory.save();
  return res.json({ success: true });
});
//delete subcategory
export const deleteSubcategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("category not found !"));
  const subcategory = await Subcategory.findOneAndDelete({
    _id: req.params.subcategoryId,
    categoryId: req.params.categoryId,
  });
  if (!subcategory) return next(new Error("subcategory not found !"));
  return res.json({ success: true, message: "deleted successfully" });
});
//get all sub categories
export const allSubcategories = asyncHandler(async (req, res, next) => {
  const subcategories = await Subcategory.find().populate("categoryId");
  return res.json({ success: true, resaults: subcategories });
});
