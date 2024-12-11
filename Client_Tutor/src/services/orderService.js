import axios from "axios";

export const getStripepublishableKey = async () => {
  try {
    const { data } = await axios.get(
      "/api/orders/payment/stripepublishableKey"
    );
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const createPaymentIntent = async ({ amount }) => {
  try {
    const { data } = await axios.post("/api/orders/payment", { amount });
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const createOrder = async ({
  courseIds,
  payment_info,
  emailOrder,
  amount,
}) => {
  try {
    const { data } = await axios.post("/api/orders/createOrder", {
      courseIds,
      payment_info,
      emailOrder,
      amount,
    });
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const paymentMomo = async ({ amount, orderInfo }) => {
  try {
    const { data } = await axios.post("/api/momo-payment", {
      amount,
      orderInfo,
    });
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getOrderByUser = async () => {
  try {
    const { data } = await axios.get("/api/orders/getOrderByUser");
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getAllOrdersAdmin = async () => {
  try {
    const { data } = await axios.get("/api/orders/getAllOrdersAdmin");
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const getOrder = async ({ orderId }) => {
  try {
    const { data } = await axios.get(`/api/orders/getOrder/${orderId}`);
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const filterRevenueOrder = async ({ period, courseId }) => {
  try {
    const { data } = await axios.get(
      `/api/orders/filterRevenueOrder/?period=${period}&courseId=${courseId}`
    );
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const totalAmountByCategory = async () => {
  try {
    const { data } = await axios.get(`/api/orders/totalAmountByCategory`);
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const totalAmountDaily = async () => {
  try {
    const { data } = await axios.get(`/api/orders/totalAmountDaily`);
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

export const totalOrderByState = async () => {
  try {
    const { data } = await axios.get(`/api/orders/totalOrderByState`);
    return data;
  } catch (error) {
    if (error.response && error.response.data.message)
      throw new Error(error.response.data.message);
    throw new Error(error.message);
  }
};

