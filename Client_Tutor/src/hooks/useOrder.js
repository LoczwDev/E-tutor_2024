import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createPaymentIntent,
  filterRevenueOrder,
  getAllOrdersAdmin,
  getOrder,
  getOrderByUser,
  getStripepublishableKey,
  paymentMomo,
  totalAmountByCategory,
  totalAmountDaily,
  totalOrderByState,
} from "../services/orderService";

export const useGetStripePublishableKey = () => {
  return useQuery({
    queryFn: () => getStripepublishableKey(),
    queryKey: ["getStripepublishableKey"],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: ({ amount }) => createPaymentIntent({ amount }),
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const usePaymentMomo = () => {
  return useMutation({
    mutationFn: ({ amount, orderInfo }) => paymentMomo({ amount, orderInfo }),
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useGetOrderByUser = () => {
  return useQuery({
    queryFn: () => getOrderByUser(),
    queryKey: ["getOrderByUser"],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
export const useGetAllOrdersAdmin = () => {
  return useQuery({
    queryFn: () => getAllOrdersAdmin(),
    queryKey: ["getAllOrdersAdmin"],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
export const useGetOrder = (orderId) => {
  return useQuery({
    queryFn: () => getOrder({ orderId }),
    queryKey: ["getOrder", orderId],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useFilterRevenueOrder = (period,courseId) => {
  return useQuery({
    queryFn: () => filterRevenueOrder({ period,courseId }),
    queryKey: ["filterRevenueOrder", period,courseId],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
export const useTotalAmountByCategory = () => {
  return useQuery({
    queryFn: () => totalAmountByCategory(),
    queryKey: ["totalAmountByCategory"],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useTotalAmountDaily = () => {
  return useQuery({
    queryFn: () => totalAmountDaily(),
    queryKey: ["totalAmountDaily"],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};


export const useTotalOrderByState = () => {
  return useQuery({
    queryFn: () => totalOrderByState(),
    queryKey: ["totalOrderByState"],
    onError: (error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};


