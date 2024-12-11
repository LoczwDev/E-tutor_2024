import express from "express";
import {
  createOrder,
  filterRevenueOrder,
  getAllOrdersByAdmin,
  getOrder,
  getOrderByUser,
  newPayment,
  sendStripePublishableKey,
  totalAmountByCategory,
  totalAmountDaily,
  totalOrderByState,
} from "../controllers/orders.controllers";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controllers";
const orderRouter = express.Router();

orderRouter.post(
  "/createOrder",
  updateAccessToken,
  isAutheticated,
  createOrder
);

orderRouter.get(
  "/getAllOrdersAdmin",
  isAutheticated,
  updateAccessToken,
  getAllOrdersByAdmin
);

orderRouter.get("/payment/stripepublishableKey", sendStripePublishableKey);
orderRouter.post("/payment", isAutheticated, newPayment);

orderRouter.get(
  "/getOrderByUser",
  isAutheticated,
  updateAccessToken,
  getOrderByUser
);
orderRouter.get(
  "/getOrder/:orderId",
  isAutheticated,
  updateAccessToken,
  getOrder
);
orderRouter.get(
  "/filterRevenueOrder",
  isAutheticated,
  updateAccessToken,
  filterRevenueOrder
);
orderRouter.get(
  "/totalAmountByCategory",
  isAutheticated,
  updateAccessToken,
  totalAmountByCategory
);

orderRouter.get(
  "/totalAmountDaily",
  isAutheticated,
  updateAccessToken,
  totalAmountDaily
);

orderRouter.get(
  "/totalOrderByState",
  isAutheticated,
  updateAccessToken,
  totalOrderByState
);

export default orderRouter;
