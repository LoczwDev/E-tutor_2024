import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import StatCard from "../../../components/common/StateCard";
import { FaInbox } from "react-icons/fa6";
import styled from "../../../constants/styles/styles";
import { BsBoxSeam } from "react-icons/bs";
import CreateQuiz from "../../../containers/adminPage/quizManager/CreateQuiz";
import { useGetAllQuizByUser } from "../../../hooks/useQuiz";
import Loading from "../../../components/loader/Loading";
import CardQuiz from "../../../components/card/CardQuiz";

const QuizOutlet = () => {
  const [checkCreateQuiz, setCheckCreateQuiz] = useState(false);
  const { data, isLoading, refetch } = useGetAllQuizByUser();
  

  return (
    <main className="relative max-w-7xl mx-auto py-6 px-4 lg:px-8">
      <div className="w-full mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray9">Danh sách khóa học</h2>
        {data?.quizs?.length > 0 && (
          <button
            onClick={() => setCheckCreateQuiz(!checkCreateQuiz)}
            className={styled.buttonPrimary}
          >
            Tạo bài tập mới
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="w-full flex items-center justify-center h-[50vh]">
          <Loading />
        </div>
      ) : (
        <>
          <motion.div
            className="inset-0 !will-change-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              checkCreateQuiz
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.9 }
            }
            transition={{ duration: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
            style={{
              display: checkCreateQuiz ? "block" : "none",
              // willChange: "auto",
            }}
          >
            <CreateQuiz
              checkCreateQuiz={checkCreateQuiz}
              setCheckCreateQuiz={setCheckCreateQuiz}
              refetch={refetch}
            />
          </motion.div>

          <motion.div
            className="w-full !will-change-auto"
            initial={{ opacity: 1 }}
            animate={checkCreateQuiz ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ display: checkCreateQuiz ? "none" : "block" }}
          >
            {data?.quizs?.length > 0 ? (
              <div className="grid lg:grid-cols-4 gap-5">
                {data?.quizs?.map((item, index) => (
                  <CardQuiz key={index} item={item} refetch={refetch} />
                ))}
              </div>
            ) : (
              <div className="w-full h-[50vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <BsBoxSeam className="text-primary" fontSize={100} />
                  <h4 className="text-lg font-bold">
                    Bài tập đang chờ đợi! hãy làm một cái
                  </h4>
                  <span className="text-xs text-gray5">
                    Nhấp vào bên dưới để bắt đầu tạo các câu hỏi của bạn
                  </span>
                  <button
                    onClick={() => setCheckCreateQuiz(!checkCreateQuiz)}
                    className={styled.buttonPrimary}
                  >
                    Tạo bài tập đầu tiên
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </main>
  );
};

export default QuizOutlet;
