const express = require("express");
const router = express.Router();
import Stripe from "stripe";
const jwtCheck = require("../middlewares/auth");
const parseJWT = require("../middlewares/parseJWT");
const pool = require("../config/db");

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);
const frontend_url = process.env.FRONTEND_URL as string;

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  restaurantId: number;
};

router.post("/cartCheckout/webhook", (req: any, res: any) => {
  console.log("Received Event");
  console.log("================");
  console.log("event: ", req.body);
  res.send();
});

router.post("/checkout", jwtCheck, parseJWT, async (req: any, res: any) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    console.log("checkoutSessionRequest-->", checkoutSessionRequest);

    console.log("User from checkout route", req.user);

    const restaurant = await pool.query(
      "SELECT * FROM restaurant WHERE restaurantid=$1",
      [checkoutSessionRequest.restaurantId]
    );

    if (!restaurant) throw new Error("Restaurant not found.");

    console.log("restaurant details--->", restaurant.rows[0].menuitems);

    let orderId = await pool.query("select count(*) from orders;");

    orderId = orderId.rows.length != 0 ? orderId.rows[0].count : 0;

    console.log("orderId", orderId);

    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.rows[0].menuitems
    );

    const session = await createSession(
      lineItems,
      (orderId.rows[0].count + 1).toString(),
      restaurant.rows[0].deliveryprice,
      restaurant.rows[0].id
    );

    if (!session.url) {
      throw new Error("Error creating Stripe session");
    }
    const newOrderData = {
      restaurantid: restaurant.rows[0].restaurantid,
      userid: req.user.id,
      status: "placed",
      email: req.user.email,
      name: req.user.name,
      addressline1: req.user.addressline1,
      city: req.user.city,
      cartitems: checkoutSessionRequest.cartItems,
      createdat: new Date(),
    };

    const newOrder = await pool.query(
      "INSERT INTO orders (restaurant_id,user_id,email,name,addressline1,city,cartitems,status,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9);",
      [
        newOrderData.restaurantid,
        newOrderData.userid,
        newOrderData.email,
        newOrderData.name,
        newOrderData.addressline1,
        newOrderData.city,
        newOrderData.cartitems,
        newOrderData.status,
        newOrderData.createdat,
      ]
    );

    // if (newOrder.rows.length == 0) {
    //   throw new Error("There was some issues while creating your order!");
    // }

    console.log(newOrder.rows[0]);

    res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: { id: string; name: string; price: string }[]
) => {
  console.log("Menuitems----->", menuItems);

  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item.id.toString() === cartItem.menuItemId.toString()
    );

    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "inr",
        unit_amount: parseInt(menuItem.price) * 100,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };
    return line_item;
  });
  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryprice: string,
  restaurantId: string
) => {
  const sessionData = await stripe.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: parseInt(deliveryprice),
            currency: "inr",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      restaurantId,
    },
    success_url: `${frontend_url}/order-status?success=true`,
    cancel_url: `${frontend_url}/restaurantDetail/${restaurantId}?cancelled=true`,
  });

  return sessionData;
};

module.exports = router;
export {};
