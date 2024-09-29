import { Cart } from "../../../DB/models/cart.model.js";
import { Coupon } from "../../../DB/models/coupon.model.js";
import { Order } from "../../../DB/models/order.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
import createInvoice from "../../utils/pdfInvoice.js";
import path from "path";
import { fileURLToPath } from "url";
import { sendEmail } from "../../utils/sendEmails.js";
import { clearCart, updateStock } from "./order.service.js";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const placeOrder = asyncHandler(async (req, res, next) => {
  const { phone, address, payment, coupon } = req.body;
  //check coupon
  let checkCoupon;
  if (coupon) {
    checkCoupon = await Coupon.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });
  }
  if (!checkCoupon) return next(new Error("invalid coupon!"));

  //check cart
  const cart = await Cart.findOne({ user: req.user._id });
  const products = cart.products;
  if (products.length < 1) return next(new Error("Empty cart!"));
  //check products and stock
  let orderProducts = [];
  let orderPrice = 0;
  for (let i = 0; i < products.length; i++) {
    const product = await Product.findById(products[i].productId);
    if (!product)
      return next(new Error(`product ${products[i].productId} not found!`));
    if (!product.inStock(products[i].quantity))
      return next(
        new Error(
          `only ${product.availableItems} are available of ${products[i].productId}`
        )
      );
    orderProducts.push({
      productId: product._id,
      name: product.name,
      itemPrice: product.finalPrice,
      quantity: products[i].quantity,
      totalPrice: product.finalPrice * products[i].quantity,
    });
    orderPrice += product.finalPrice * products[i].quantity;
  }
  // create order in db
  const order = await Order.create({
    user: req.user._id,
    address,
    phone,
    payment,
    products: orderProducts,
    price: orderPrice,
    coupon: {
      id: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
  });
  //create invoice
  const user = req.user;
  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: order.products,
    subtotal: order.price,
    paid: order.finalPrice,
    invoice_nr: order._id,
  };

  const pdfPath = path.join(__dirname, `./../../tempInvoices/${order._id}.pdf`);
  createInvoice(invoice, pdfPath);
  //uplaod cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.FOLDER_CLOUD_NAME}/order/invoices`,
  });
  //add invoice to order in db
  order.invoice = { id: public_id, secure_url };
  await order.save();

  //send email with invoice
  const isSent = await sendEmail({
    to: user.email,
    subject: "order invoice",
    attachments: [{ path: secure_url, contentType: "application/pdf" }],
  });
  if (!isSent)
    return next(new Error("something went wrong sending the email!"));
  //update stock
  updateStock(order.products, true);

  //clear cart
  clearCart(user._id);
  // payment with stripe
  if (payment == "visa") {
    const stripe = new Stripe(process.env.STRIPE_KEY);
    let couponExists;
    if (order.coupon.name !== undefined) {
      couponExists = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }
    const session = await stripe.checkout.sessions.create({
      metadata: { order_id: order._id.toString() },
      payment_method_types: ["card"],
      mode: "payment",
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: { name: product.name },
            unit_amount: product.itemPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: couponExists ? [{ coupon: couponExists.id }] : [],
    });
    return res.json({ success: true, resault: { url: session.url } });
  }
  //responce
  return res.json({ success: true, resault: { order } });
});

// cancel order ---------------------------------------------------

export const cancelOrder = asyncHandler(async (req, res, next) => {
  //check order
  const order = await Order.findById(req.params.id);
  if (!order) return next(new Error("invalid order id!"));
  //check owner?
  if (order.user.toString() != req.user._id.toString())
    return next(new Error("you are not the owner!"));
  //check status
  if (!order.status == "placed")
    return next(new Error("can not cancel order now!"));
  //cancel order
  order.status = "canceled";
  await order.save();
  //update stock
  updateStock(order.products, false);

  //responce
  return res.json({ success: true, message: "order canceled successfully!" });
});

// webhook
export const orderWebhook = asyncHandler(async (request, response) => {
  console.log("testo");
  const sig = request.headers["stripe-signature"];
  const stripe = new Stripe(process.env.STRIPE_KEY);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.ENDPOINT_SECRET
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  const orderId = event.data.object.metadata.order_id;
  if (event.type == "checkout.session.completed") {
    await Order.findOneAndUpdate({ _id: orderId }, { status: "visa payed" });
    console.log(orderId);
    return;
  }
  await Order.findOneAndUpdate({ _id: orderId }, { status: "failed to pay" });
  return;
});
