import { Category } from "../../../DB/models/category.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import { Brand } from "../../../DB/models/brand.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
import randomstring from "randomstring";
import { Review } from "../../../DB/models/review.model.js";

//create product controller
export const createProduct = asyncHandler(async (req, res, next) => {
  if (!req.files) return next(new Error("product images are required!"));
  const isproduct = await Product.findOne({ name: req.body.name });
  if (isproduct)
    return next(new Error("product with such name already exists"));
  const cloudFolder = randomstring.generate({
    length: 5,
  });
  let images = [];

  for (const file of req.files.images) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}` }
    );
    images.push({ id: public_id, url: secure_url });
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    { folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}` }
  );
  //create product
  const product = await Product.create({
    ...req.body,
    cloudFolder,
    createdBy: req.user._id,
    defaultImage: { url: secure_url, id: public_id },
    images,
  });
  return res.status(201).json({
    success: true,
    message: "product created successfuly!",
    resaults: product,
  });
});
//delete product controller
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new Error("product not found"));
  if (product.createdBy.toString() !== req.user._id.toString())
    return next(new Error("you are not the owner!"));
  const ids = product.images.map((image) => image.id);
  ids.push(product.defaultImage.id);
  await cloudinary.api.delete_resources(ids);
  await cloudinary.api.delete_folder(
    `${process.env.FOLDER_CLOUD_NAME}/products/${product.cloudFolder}`
  );
  await Product.findByIdAndDelete(req.params.id);
  return res.json({
    success: true,
    message: "product deleted successfuly!",
  });
});
//update product

export const updateProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;
  // Fetch the product by ID
  let product;
  product = await Product.findById(productId);
  if (!product) return next(new Error("Product not found"));

  // Check if the logged-in user has permission to update the product
  if (product.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You are not authorized to update this product"), {
      cause: 403,
    });
  }

  // Handle file uploads if any
  try {
    if (req.files) {
      const cloudFolder = randomstring.generate({
        length: 5,
      });

      // Handle default image
      if (req.files.defaultImage && req.files.defaultImage.length > 0) {
        const defaultImage = req.files.defaultImage[0];
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          defaultImage.path,
          {
            folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}`,
          }
        );
        product.defaultImage = { url: secure_url, id: public_id };
      }

      // Handle additional images
      if (req.files.images && req.files.images.length > 0) {
        const images = [];
        for (const file of req.files.images) {
          const { secure_url, public_id } = await cloudinary.uploader.upload(
            file.path,
            {
              folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}`,
            }
          );
          images.push({ id: public_id, url: secure_url });
        }
        product.images = images;
      }

      product.cloudFolder = cloudFolder;
    }
  } catch (error) {
    return next(new Error("Failed to upload images"), { cause: 500 });
  }

  // Update product fields based on request body
  product.name = req.body.name || product.name;
  product.description = req.body.description || product.description;
  product.availableItems = req.body.availableItems || product.availableItems;
  product.price = req.body.price || product.price;
  product.discount = req.body.discount || product.discount;
  product.category = req.body.category || product.category;
  product.subCategory = req.body.subCategory || product.subCategory;
  product.brand = req.body.brand || product.brand;

  // Save the updated product

  product = await product.save();
  if (!product)
    return next(new Error("Failed to update product"), { cause: 500 });
  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    results: product,
  });
});

// get all products with search filter sort & paginate

export const allProducts = asyncHandler(async (req, res, next) => {
  const { sort, page, keyword, category, brand, subCategory } = req.query;
  if (category && !(await Category.findById(category)))
    return next(new Error("category not found!"));
  if (brand && !(await Brand.findById(brand)))
    return next(new Error("brand not found!"));
  if (subCategory && !(await Subcategory.findById(subCategory)))
    return next(new Error("subCategory not found!"));
  const products = await Product.find({ ...req.query })
    .sort(sort)
    .search(keyword)
    .paginate(page);
  return res.json({ success: true, resaults: products });
});
// get product reviews

export const productReviews = asyncHandler(async (req, res, next) => {
  const reviews = Review.find({ orderId: req.params.id });
  return res.json({ success: true, resaults: reviews });
});
