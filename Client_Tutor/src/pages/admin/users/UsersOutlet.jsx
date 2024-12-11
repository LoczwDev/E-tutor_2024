import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";
import HeaderAdmin from "../../../components/common/HeaderAdmin";
import StatCard from "../../../components/common/StateCard";
import UserGrowthChart from "../../../containers/adminPage/usersManager/UserGrowthChart";
import UserActivityHeatmap from "../../../containers/adminPage/usersManager/UserActivityHeatmap";
import UserDemographicsChart from "../../../containers/adminPage/usersManager/UserDemographicsChart";
import UsersTable from "../../../containers/adminPage/usersManager/UsersTable";
import ApplyTable from "../../../containers/adminPage/usersManager/ApplyTable";
import { useGetTotalUserByType } from "../../../hooks/useUser";
import { useState } from "react";
import TutorTable from "../../../containers/adminPage/usersManager/TutorTable";

const UsersOutlet = () => {
  const { data, isLoading } = useGetTotalUserByType();
  const [activeTab, setActiveTab] = useState("all");
  const dataTabs = [
    {
      link: "all",
      title: "Tất cả tài khoản",
    },
    {
      link: "tutor",
      title: "Tài khoản giáo viên",
    },
    {
      link: "apply",
      title: "Đơn đăng ký",
    },
  ];
  return (
    <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
      {/* STATS */}
      <motion.div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <StatCard
          name="Số tài khoản"
          icon={UsersIcon}
          value={data ? data?.totalUser : 0}
          color="#6366F1"
        />
        <StatCard
          name="Học viên"
          icon={UserPlus}
          value={data ? data?.totalStudent : 0}
          color="#10B981"
        />
        <StatCard
          name="Giáo viên"
          icon={UserCheck}
          value={data ? data?.totalTutor : 0}
          color="#F59E0B"
        />
        <StatCard
          name="Đơn đăng ký"
          icon={UserX}
          value={data ? data?.totalApply : 0}
          color="#EF4444"
        />
      </motion.div>

      <div className="w-full">
        <div className="w-full sticky top-[80px] bg-white z-[50]">
          {/* Tabs */}
          <div className="w-full flex items-center justify-between h-14 border-b border-gray1">
            {dataTabs.map((item, index) => (
              <div
                key={index}
                className={`w-1/4 font-medium text-base py-5 h-full text-center flex items-center justify-center cursor-pointer capitalize hover:text-primary/90 duration-300 ${
                  activeTab === item.link
                    ? "border-b-2 border-primary text-primary"
                    : ""
                }`}
                onClick={() => setActiveTab(item.link)}
              >
                {item.title}
              </div>
            ))}
          </div>
        </div>

        <div>
          {activeTab === "all" && <UsersTable />}
          {activeTab === "tutor" && <TutorTable />}
          {activeTab === "apply" && <ApplyTable />}
        </div>
      </div>

    </main>
  );
};
export default UsersOutlet;
