import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { useFilterRevenueOrder } from "../../../hooks/useOrder";
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

const RevenueChartOrder = ({ colSpan, courseId = "" }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("week");

  // Gọi hook và truyền tham số thời gian
  const { data, isLoading, error } = useFilterRevenueOrder(
    selectedTimeRange,
    courseId
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  const chartData =
    data?.revenueData.map((item) => {
      let name;
      switch (selectedTimeRange) {
        case "week":
          name = item._id; // Giả sử _id là ngày trong tuần hoặc định dạng tương ứng
          break;
        case "month":
          // Định dạng tháng theo `item.month` và năm `item.year` (giả sử có trường `year`)
          name = item._id;
          break;
        case "quarter":
          // Định dạng quý theo `item.quarter` và năm `item.year`
          name = item._id;
          break;
        case "year":
          name = item._id;
          break;
        default:
          name = item._id; // Giá trị mặc định
      }
      return {
        name,
        Doanh_thu: item.totalRevenue,
      };
    }) || [];

  return (
    <motion.div
      className={`bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray1 ${colSpan ? "col-span-2" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Doanh thu</h2>
        <select
          className="rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
        >
          <option value="week">Theo Tuần</option>
          <option value="month">Theo Tháng</option>
          <option value="quarter">Theo Quý</option>
        </select>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer>
          <AreaChart data={chartData}>
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
              formatter={(value) => [formatCurrencyAdmin(value), "VND"]} // Định dạng cho tooltip
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Area
              type="monotone"
              dataKey="Doanh_thu"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RevenueChartOrder;
