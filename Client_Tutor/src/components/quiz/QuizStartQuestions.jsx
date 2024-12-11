import React, { useState, useEffect } from "react";
import { useGetQuiz } from "../../hooks/useQuiz";
import styled from "../../constants/styles/styles";
import { toast } from "sonner";
import { submitQuiz } from "../../services/quizService";
import { useMutation } from "@tanstack/react-query";
import useUser from "../../hooks/useUser";
import Loading from "../loader/Loading";
import { LiaLinkSolid } from "react-icons/lia";
import images from "../../constants/images/images";
import { FaRegFaceRollingEyes } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { userActions } from "../../store/reducers/userReducers";

const QuizStartQuestions = ({ quizId, refetchUser, user }) => {
  const {
    data: quizData,
    isLoading,
    refetch: refetchQuiz,
  } = useGetQuiz(quizId);
  // const user = useUser();
  const dispatch = useDispatch();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResult, setUserResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (quizData && !isLoading) {
      setQuiz(quizData?.quiz); // Set the quiz data
    }
  }, [quizData, isLoading]);

  useEffect(() => {
    if (user && user.resultsQuiz) {
      const result = user.resultsQuiz.find((result) => result.quiz === quizId);
      if (result) {
        setUserResult(result);
        setSelectedAnswers(result?.answers); // Set the user's quiz result if available
      }
    }
  }, [user, dispatch, refetchUser]);
  console.log(userResult);

  const handleSelectAnswer = (answerIndex) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(updatedAnswers); // Update selected answer for current question
  };

  const handleNext = () => {
    if (selectedAnswers[currentQuestionIndex] !== undefined) {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1); // Go to next question
      }
    } else {
      toast.error("Vui lòng chọn một câu trả lời trước khi tiếp tục.");
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1); // Go to previous question
    }
  };

  const handleRetake = () => {
    setSelectedAnswers([]);
    setScore(0);
    setSubmitted(false);
    setCurrentQuestionIndex(0);
    setShowPreview(false);
    setUserResult(null);
    refetchQuiz(); // Reset quiz data to re-fetch it
  };

  const { mutate, isPending } = useMutation({
    mutationFn: ({ quizId, answers }) => {
      return submitQuiz({
        quizId,
        answers,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Bạn đã nộp bài thành công");
      // dispatch(userActions.setUserInfo(data));
      refetchUser();
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const handleSubmit = () => {
    if (quiz) {
      // Check if all questions have been answered
      if (
        selectedAnswers.length !== quiz.questions.length ||
        selectedAnswers.some((answer) => answer === undefined)
      ) {
        toast.error(
          "Vui lòng chọn một câu trả lời cho tất cả các câu hỏi trước khi nộp bài."
        );
        return;
      }

      // Calculate the user's score if all questions have answers
      const userScore = quiz.questions.reduce((score, question, index) => {
        if (selectedAnswers[index] === question.correctAnswer) {
          return score + 1;
        }
        return score;
      }, 0);
      setScore(userScore);

      mutate({ quizId: quizId, answers: selectedAnswers });
    }
    setSubmitted(true); // Mark quiz as submitted
  };

  const handleShowPreview = () => {
    setShowPreview(true); // Show preview of answers
  };

  if (!quiz)
    return (
      <div className="w-full flex items-center justify-center h-[50vh]">
        <Loading />
      </div>
    );

  return (
    <div className="mx-auto p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 flex items-center bg-primary justify-center text-white">
          <LiaLinkSolid fontSize={30} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-center">
            {quiz.quizTitle}
          </h1>
          <span>{quiz.questions?.length} Câu hỏi</span>
        </div>
      </div>

      {userResult ? (
        <div className="w-full text-center border border-gray1 py-3">
          <div className="w-full flex  items-center justify-center mb-3">
            <img src={images.Laughing} className="w-[100px]" alt="" />
          </div>
          <h2 className="text-xl font-medium mb-3">Kết quả</h2>
          <p className="text-lg mb-3">
            Điểm của bạn: {userResult.score}/{quiz.questions.length}
          </p>
          <div className="w-full flex items-center justify-center gap-5">
            <button className={styled.buttonPrimary} onClick={handleRetake}>
              Làm lại bài kiểm tra
            </button>
            <button
              className={styled.buttonPrimary10}
              onClick={handleShowPreview}
            >
              Xem lại câu trả lời
            </button>
          </div>
        </div>
      ) : (
        //  : submitted ? (
        //   <div className="text-center">
        //     <h2 className="text-xl">Kết quả của bạn</h2>
        //     <p className="text-lg">
        //       Điểm của bạn: {score}/{quiz.questions.length}
        //     </p>
        //     <button
        //       className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        //       onClick={handleRetake}
        //     >
        //       Làm lại bài kiểm tra
        //     </button>
        //   </div>
        // )
        <div className="max-w-4xl mx-auto mt-10 ">
          <div className="mb-6">
            <div className="w-full flex items-center gap-2">
              <div className="w-14 h-10 flex items-center bg-primary justify-center text-white">
                {currentQuestionIndex + 1}
              </div>
              <p className="font-semibold">
                {quiz.questions[currentQuestionIndex].question}
              </p>
            </div>

            <div className="mt-2 px-14">
              {quiz.questions[currentQuestionIndex].answers.map(
                (answer, answerIndex) => (
                  <div key={answerIndex} className="mb-2">
                    <button
                      onClick={() => handleSelectAnswer(answerIndex)}
                      className={`w-full text-left px-4 py-2 border border-primary rounded-md ${
                        selectedAnswers[currentQuestionIndex] === answerIndex
                          ? "bg-primary text-white"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      {answer}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
          {/* Navigation buttons */}
          <div className="flex justify-between mt-4 px-14">
            <button
              className={styled.buttonPrimary10}
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
            >
              Quay về
            </button>
            <button
              className={styled.buttonPrimary}
              onClick={
                currentQuestionIndex === quiz.questions.length - 1
                  ? handleSubmit
                  : handleNext
              }
            >
              {currentQuestionIndex === quiz.questions.length - 1
                ? "Nộp bài"
                : "Tiếp theo"}
            </button>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 flex items-center bg-primary/10 text-primary justify-center">
              <FaRegFaceRollingEyes fontSize={30} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-center">
                Xem lại câu trả lời của bạn
              </h1>
            </div>
          </div>
          {quiz.questions.map((question, index) => (
            <div key={index} className="mb-6">
              {/* Hiển thị câu hỏi */}
              <p className="font-semibold text-lg mb-2">{`${index + 1}. ${question.question}`}</p>

              {/* Hiển thị danh sách đáp án */}
              {question.answers.map((answer, answerIndex) => {
                // Xác định màu sắc cho từng đáp án
                let answerClass = "bg-gray-100 text-gray-600"; // Mặc định: không có gì đặc biệt
                if (answerIndex === question.correctAnswer) {
                  answerClass = "bg-green-100 text-green-600"; // Đáp án đúng: màu xanh lá
                } else if (selectedAnswers[index] === answerIndex) {
                  answerClass = "bg-red-100 text-red-600"; // Đáp án sai mà người dùng đã chọn: màu đỏ
                }

                return (
                  <div
                    key={answerIndex}
                    className={`px-4 py-2 rounded-md border mb-2 ${answerClass}`}
                  >
                    {answer}
                  </div>
                );
              })}

              {/* Hiển thị trạng thái đúng/sai của người dùng */}
              <p
                className={`mt-2 font-medium ${
                  selectedAnswers[index] === question.correctAnswer
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {selectedAnswers[index] === question.correctAnswer
                  ? "Bạn đã chọn đúng!"
                  : `Bạn đã chọn sai: ${question.answers[selectedAnswers[index]]}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizStartQuestions;
