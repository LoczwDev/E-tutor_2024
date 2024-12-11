import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import CoursesTable from "../../../containers/adminPage/coursesMannager/CoursesTable";
import StatCard from "../../../components/common/StateCard";
import { useState } from "react";
import SetUpAICourse from "../../../containers/adminPage/createCourse/setupAICreateCourse/SetUpAICourse";
import useUser from "../../../hooks/useUser";
import CoursesTableAdmin from "../../../containers/adminPage/coursesMannager/CoursesTableAdmin";
import { useGetTotalCourseByStatus } from "../../../hooks/useCourses";

const CoursesOutlet = () => {
  const [checkCreateCourses, setCheckCreateCourses] = useState(false);

  const user = useUser();
  const { data, isLoading } = useGetTotalCourseByStatus();
  console.log(data);

  return (
    <main className="relative max-w-7xl mx-auto py-6 px-4 lg:px-8">
      <motion.div
        className="inset-0 !will-change-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={
          checkCreateCourses
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.9 }
        }
        transition={{ duration: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
        style={{
          display: checkCreateCourses ? "block" : "none",
        }}
      >
        <SetUpAICourse
          checkCreateCourses={checkCreateCourses}
          setCheckCreateCourses={setCheckCreateCourses}
        />
      </motion.div>

      <motion.div
        className="w-full !will-change-auto"
        initial={{ opacity: 1 }}
        animate={checkCreateCourses ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
        style={{ display: checkCreateCourses ? "none" : "block" }}
      >
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <StatCard
            name="Tổng khóa học"
            icon={Package}
            value={data ? data?.totalCourses : 0}
            color="#6366F1"
          />
          <StatCard
            name="Hoạt động"
            icon={TrendingUp}
            value={data ? data?.totalActive : 0}
            color="#10B981"
          />
          <StatCard
            name="Bị ẩn"
            icon={AlertTriangle}
            value={data ? data?.totalHidden : 0}
            color="#F59E0B"
          />
          <StatCard
            name="Chờ duyệt"
            icon={DollarSign}
            value={data ? data?.totalPending : 0}
            color="#EF4444"
          />
        </motion.div>
        {user?.role === "admin" ? (
          <CoursesTableAdmin
            setCheckCreateCourses={setCheckCreateCourses}
            checkCreateCourses={checkCreateCourses}
          />
        ) : (
          <CoursesTable
            setCheckCreateCourses={setCheckCreateCourses}
            checkCreateCourses={checkCreateCourses}
          />
        )}
      </motion.div>
    </main>
  );
};

export default CoursesOutlet;
