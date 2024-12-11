import {
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  DollarSignIcon,
  ShoppingBag,
} from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "../../../components/common/StateCard";
import OrdersTable from "../../../containers/adminPage/ordersManager/OrdersTable";
import RevenueChartOrder from "../../../containers/adminPage/ordersManager/RevenueChartOrder";
import DailySalesTrend from "../../../containers/adminPage/salesManager/DailySalesTrend";
import SalesByCategoryChart from "../../../containers/adminPage/salesManager/SalesByCategoryChart";
import { useTotalOrderByState } from "../../../hooks/useOrder";
import useUser from "../../../hooks/useUser";

const formatCurrencyAdmin = (amount) => {
  if (amount >= 1e12) {
    // 1 tỷ
    return (amount / 1e12).toFixed(1) + "T";
  } else if (amount >= 1e9) {
    // 1 triệu
    return (amount / 1e9).toFixed(1) + "B";
  } else if (amount >= 1e6) {
    // 1 triệu
    return (amount / 1e6).toFixed(1) + "M";
  } else if (amount >= 1e3) {
    // 1 ngàn
    return (amount / 1e3).toFixed(1) + "K";
  }
  return amount.toString(); // Nếu giá nhỏ hơn 1000
};

const OrdersOutlet = () => {
  const { data, isLoading } = useTotalOrderByState();
  const user = useUser();
  return (
    <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
      <motion.div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <StatCard
          name="Đơn thanh toán"
          icon={ShoppingBag}
          value={data ? data?.totalOrders : 0}
          color="#6366F1"
        />
        <StatCard
          name="Thanh toán Momo"
          icon={DollarSignIcon}
          value={data ? data?.totalMomoOrders : 0}
          color="#F59E0B"
        />
        <StatCard
          name="Thanh toán thẻ"
          icon={CreditCard}
          value={data ? data?.totalCardOrders : 0}
          color="#10B981"
        />
        <StatCard
          name="Doanh thu"
          icon={DollarSign}
          price={data ? data?.totalRevenue : 0}
          value={
            data ? formatCurrencyAdmin(data?.totalRevenue) || "0 VND" : "0 VND"
          }
          color="#EF4444"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {user?.role !== "admin" ? (
          <RevenueChartOrder />
        ) : (
          <SalesByCategoryChart />
        )}

        <DailySalesTrend />
      </div>
      {user?.role === "admin" && (
        <div className="mb-8">
          <RevenueChartOrder />
        </div>
      )}

      <OrdersTable />
    </main>
  );
};
export default OrdersOutlet;
