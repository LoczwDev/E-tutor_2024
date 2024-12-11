import {
  BarChart2,
  DollarSign,
  Menu,
  Settings,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
  Columns4,
  SquareSquare,
  BarChart,
  FileText,
  
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useUser from "../../hooks/useUser";



const SideBarAdmin = () => {
  const user = useUser();

  // Mảng các mục sidebar
  const SIDEBAR_ITEMS = [
    {
      name: "Tổng quan",
      icon: BarChart2,
      color: "#6366f1",
      href: "/admin",
    },
    {
      name: "Khóa học",
      icon: ShoppingBag,
      color: "#8B5CF6",
      href: "/admin/manager-courses",
    },
    { 
      name: "Câu hỏi", 
      icon: TrendingUp, 
      color: "#3B82F6", 
      href: "/admin/manager-quiz" 
    },
    {
      name: "Tài khoản",
      icon: Users,
      color: "#EC4899",
      href: "/admin/manager-users",
    },
    {
      name: "Danh mục",
      icon: Columns4,
      color: "#752a4e",
      href: "/admin/manager-category",
    },
    {
      name: "Báo cáo",
      icon: BarChart,
      color: "#F59E0B", 
      href: "/admin/manager-reports",
    },
    {
      name: "Bài đăng",
      icon: FileText,
      color: "#3B82F6",
      href: "/admin/manager-posts",
    },
    {
      name: "Thanh toán",
      icon: ShoppingCart,
      color: "#F59E0B",
      href: "/admin/manager-orders",
    },
    {
      name: "Banner",
      icon: SquareSquare,
      color: "#8b1857",
      href: "/admin/manager-banner",
    },
    {
      name: "Cài đặt",
      icon: Settings,
      color: "#6EE7B7",
      href: "/admin/manager-settings",
    },
  ];
  
  // Lọc các mục dựa trên vai trò người dùng
  const filteredSidebarItems = user?.role === "tutor"
    ? SIDEBAR_ITEMS.filter(item => 
        !["Banner", "Bài đăng", "Báo cáo", "Danh mục", "Tài khoản"].includes(item.name)
      )
    : SIDEBAR_ITEMS;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <motion.div
      className={`relative z-10 transition-all ease-linear flex-shrink-0 ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
      transition={{ duration: 0.2 }}
    >
      <div className="h-full bg-white backdrop-blur-md p-4 flex flex-col border-r border-gray0">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
        >
          <Menu size={24} />
        </motion.button>

        <nav className="mt-8 flex-grow">
          {filteredSidebarItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <motion.div
                layout
                className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-primary/10 transition-colors mb-2"
                initial={false} // Avoid remounts
              >
                <item.icon
                  size={20}
                  style={{ color: item.color, minWidth: "20px" }}
                />
                {isSidebarOpen && (
                  <motion.span
                    className="ml-4 whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};
export default SideBarAdmin;
