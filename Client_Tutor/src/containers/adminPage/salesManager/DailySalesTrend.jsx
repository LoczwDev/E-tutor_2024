import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTotalAmountDaily } from "../../../hooks/useOrder";
import { useEffect, useState } from "react";

const formatCurrencyAdmin = (amount) => {
  if (amount >= 1e12) {
    return (amount / 1e12).toFixed(1) + "T";
  } else if (amount >= 1e9) {
    return (amount / 1e9).toFixed(1) + "B";
  } else if (amount >= 1e6) {
    return (amount / 1e6).toFixed(1) + "M";
  } else if (amount >= 1e3) {
    return (amount / 1e3).toFixed(1) + "K";
  }
  return amount.toString(); // Nếu giá nhỏ hơn 1000
};

const DailySalesTrend = () => {
  const { data, isLoading, error } = useTotalAmountDaily();
  const [dailySalesData, setDailySalesData] = useState([]);
  useEffect(() => {
    if (data?.dataChart && !isLoading) {
      const filteredData = data.dataChart.map((item) => ({
        name: item.date, // Sử dụng đúng key cho tên danh mục
        Doanh_thu: item.totalRevenue,
      }));

      setDailySalesData(filteredData);
    }
  }, [data, isLoading]);

  return (
    <motion.div
      className="bg-white backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="text-xl font-semibold mb-4">
        Xu hướng thanh toán hàng ngày
      </h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis
              stroke="#9CA3AF"
              tickFormatter={(value) => formatCurrencyAdmin(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
              formatter={(value) => [formatCurrencyAdmin(value), "VND"]} // Định dạng cho tooltip
            />
            <Bar dataKey="Doanh_thu" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
export default DailySalesTrend;
