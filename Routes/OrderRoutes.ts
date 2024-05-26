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

router.post("/checkout", jwtCheck, parseJWT, async (req: any, res: any) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    const restaurant = await pool.query(
      "SELECT * FROM restaurant WHERE restaurantid=$1",
      [checkoutSessionRequest.restaurantId]
    );

    if (!restaurant) throw new Error("Restaurant not found.");

    console.log(restaurant.rows);

    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems
    );

    const session = await createSession(
      lineItems,
      "TEST_ORDER_ID",
      restaurant.rows[0].deliveryprice,
      restaurant.rows[0].id.toString()
    );

    if (!session.url) {
      throw new Error("Error creating Stripe session");
    }

    res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.raw.message });
  }
});

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: { id: string; name: string; price: string }[]
) => {
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
        unit_amount: parseInt(menuItem.price),
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
