import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTotalAmountByCategory } from "../../../hooks/useOrder";
import { useEffect, useState } from "react";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

const SalesByCategoryChart = () => {
  const { data, isLoading, error } = useTotalAmountByCategory();
  const [salesByCategory, setSalesByCategory] = useState([]);
  useEffect(() => {
    if (data?.dataChart && !isLoading) {
      const filteredData = data.dataChart
        .filter((item) => item.totalRevenue > 0)
        .map((item) => ({
          name: item.category, // Sử dụng đúng key cho tên danh mục
          value: item.totalRevenue,
        }));

      const zeroCategoriesCount = data.dataChart.filter(
        (item) => item.totalRevenue === 0
      ).length;

      // Thêm mục "Khác" nếu có danh mục với totalRevenue = 0
      if (zeroCategoriesCount > 0) {
        filteredData.push({ name: "Khác", value: 0 });
      }

      setSalesByCategory(filteredData);
    }
  }, [data, isLoading]);

  return (
    <motion.div
      className="bg-white backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4">
        Phần trăm doanh thu theo danh mục
      </h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={salesByCategory}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {salesByCategory.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SalesByCategoryChart;
