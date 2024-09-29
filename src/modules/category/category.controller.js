import slugify from "slugify";
import { Category } from "../../../DB/models/category.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";

//create category
export const createCategory = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new Error("category image is required!"));
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.FOLDER_CLOUD_NAME}/category` }
  );
  const category = await Category.create({
    name: req.body.name,
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
    slug: slugify(req.body.name),
  });
  return res.status(201).json({ success: true, resaults: category });
});

//update category
export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("category not found !"));
  category.name = req.body.name ? req.body.name : category.name;
  category.slug = req.body.name ? slugify(req.body.name) : category.slug;
  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: category.image.id,
    });
    category.image.url = secure_url;
  }
  await category.save();
  return res.json({ success: true });
});
//delete category
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.categoryId);
  if (!category) return next(new Error("category not found !"));

  await cloudinary.uploader.destroy(category.image.id);

  await Category.findByIdAndDelete(req.params.categoryId);
  await Subcategory.deleteMany({ categoryId: req.params.categoryId });
  return res.json({ success: true, message: "category deleted!" });
});
//get all categories
export const allCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().populate("subcategory");
  return res.json({ success: true, resaults: categories });
});
