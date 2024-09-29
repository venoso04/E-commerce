import { Cart } from "../../../DB/models/cart.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// add to cart
// add to cart
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new Error("Product not found"));
  }
  if (!product.inStock(quantity)) {
    return next(new Error(`Only ${product.availableItems} available now`));
  }

  const userCart = await Cart.findOne({ user: req.user._id });

  // Check if the product is already in the cart
  const existingProduct = userCart.products.find((p) =>
    p.productId.equals(productId)
  );
  if (existingProduct) {
    // If the product is already in the cart, update the quantity
    existingProduct.quantity += quantity;

    // Check if the updated quantity is within the available stock
    if (!product.inStock(existingProduct.quantity)) {
      return next(new Error(`Only ${product.availableItems} available now`));
    }
  } else {
    // If the product is not in the cart, add a new entry
    userCart.products.push({ productId, quantity });
  }

  // Save the updated cart
  const updatedCart = await userCart.save();
  return res.json({ success: true, results: { cart: updatedCart } });
});

// get cart
export const getCart = asyncHandler(async (req, res, next) => {
  if (req.user.role == "user") {
    const cart = await Cart.findOne({ user: req.user._id });
    return res.json({ success: true, resaults: { cart } });
  }
  if (req.user.role == "admin" && !req.body.cartId)
    return next(new Error("cart id is required"));
  const cart = await Cart.findById(req.body.cartId);
  return res.json({ success: true, resaults: { cart } });
});
// update cart
export const updateCart = asyncHandler(async (req, res, next) => {
  const { quantity, productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) return next(new Error("product not found"));
  if (!product.inStock(quantity))
    return next(
      new Error(`only ${product.availableItems} items available now`)
    );
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id, "products.productId": productId },
    { "products.$.quantity": quantity },
    { new: true }
  );
  return res.json({ success: true, resaults: { cart } });
});

export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) return next(new Error("product not found"));
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id, "products.productId": productId },
    { $pull: { products: { productId } } },
    { new: true }
  );
  return res.json({ success: true, resaults: { cart } });
});
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { products: [] },
    { new: true }
  );
  return res.json({ success: true, resaults: { cart } });
});
