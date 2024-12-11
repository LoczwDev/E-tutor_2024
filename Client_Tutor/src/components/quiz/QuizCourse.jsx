import React, { useEffect, useState } from "react";
import SectionLayout from "../layouts/SectionLayout";
import { MdComputer } from "react-icons/md";
import Loading from "../loader/Loading";
import QuizStartQuestions from "./QuizStartQuestions";
import useUser from "../../hooks/useUser";
import { useGetAllQuizByIds } from "../../hooks/useQuiz";

const QuizCourse = ({ quizs, checkQuiz, refetch, user }) => {
  // const user = useUser();
  const { data, isLoading, refetch:refetchQuizById } = useGetAllQuizByIds(quizs);
  const [selectQuizId, setSelectQuizId] = useState(null);
  useEffect(() => {
    setSelectQuizId(null);
  }, [checkQuiz]);

  const getScoreForQuiz = (quizId) => {
    const result = user?.resultsQuiz.find(
      (quizResult) => quizResult.quiz === quizId
    );
    return result ? result.score : null; // Trả về điểm nếu tìm thấy, nếu không trả về null
  };

  return (
    <SectionLayout>
      {isLoading ? (
        <div className="w-full flex items-center justify-center h-[50vh]">
          <Loading />
        </div>
      ) : (
        <>
          {!selectQuizId ? (
            <div className="w-full">
              <h3 className="text-lg uppercase font-semibold mb-3">
                Danh sách bài tập trắc nghiệm của bài học
              </h3>
              <div className="grid lg:grid-cols-4 gap-5">
                {data?.quizs?.map((item, index) => {
                  const score = getScoreForQuiz(item._id);
                  const successRate =
                    score !== null
                      ? `${((score / item.questions.length) * 10).toFixed(1)} Điểm`
                      : "Chưa làm";

                  return (
                    <div
                      key={index}
                      className="w-full rounded-lg border border-gray1 overflow-hidden h-max bg-white hover:shadow-card hover:translate-y-[-4px] duration-300"
                    >
                      {/* Phần đầu của card */}
                      <div className="bg-primary p-4 h-[150px] flex items-center justify-center">
                        <MdComputer className="text-white" fontSize={50} />
                      </div>
                      {/* Phần nội dung của card */}
                      <div className="p-4">
                        <div className="w-full h-14">
                          <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                            {item?.quizTitle}
                          </h2>
                        </div>
                        <p className=" mb-4">
                          {item.questions?.length} câu hỏi
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="">
                            Điểm của bạn{" "}
                            <span className="text-success text-lg">
                              {successRate}
                            </span>
                          </span>
                          <button
                            onClick={() => setSelectQuizId(item._id)}
                            className="bg-violet-500 text-white px-4 py-2 rounded hover:bg-violet-600"
                          >
                            Làm
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <QuizStartQuestions
              quizId={selectQuizId}
              setSelectQuizId={setSelectQuizId}
              refetchUser={refetch}
              user={user}
            />
          )}
        </>
      )}
    </SectionLayout>
  );
};

export default QuizCourse;
