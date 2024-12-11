import React, { useEffect, useState } from "react";
import styled from "../../../constants/styles/styles";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import Loader from "../../../components/loader/Loader";
import { useNavigate, useParams } from "react-router-dom";
import { useGetQuiz } from "../../../hooks/useQuiz";
import { editQuiz } from "../../../services/quizService";

const EditQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetQuiz(quizId);
  const [quizName, setQuizName] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", choices: ["", ""], correctAnswer: "" },
  ]);
  useEffect(() => {
    if (data && !isLoading) {
      if (data.quiz?.questions) {
        const formattedQuestions = data.quiz.questions.map((q) => ({
          question: q.question,
          choices: q.answers,
          correctAnswer: q.answers[q.correctAnswer],
        }));
        setQuestions(formattedQuestions);
        setQuizName(data.quiz.quizTitle);
      }
    }
  }, [data, isLoading]);

  const handleAddChoice = (index) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[index].choices.length >= 4) {
      toast.info("Chỉ được phép có tối đa 4 câu trả lời cho mỗi câu hỏi.");
      return;
    }
    updatedQuestions[index].choices.push("");
    setQuestions(updatedQuestions);
  };

  const handleRemoveChoice = (qIndex, cIndex) => {
    const updatedQuestions = [...questions];

    if (updatedQuestions[qIndex].choices.length > 2) {
      const removedChoice = updatedQuestions[qIndex].choices[cIndex];
      updatedQuestions[qIndex].choices.splice(cIndex, 1);

      if (updatedQuestions[qIndex].correctAnswer === removedChoice) {
        updatedQuestions[qIndex].correctAnswer = "";
      }

      setQuestions(updatedQuestions);
    } else {
      toast.info("Mỗi câu hỏi cần ít nhất 2 câu trả lời.");
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", choices: ["", ""], correctAnswer: "" },
    ]);
  };

  // Hàm xóa câu hỏi (đảm bảo ít nhất 1 câu hỏi tồn tại)
  const handleRemoveQuestion = (qIndex) => {
    if (questions.length > 1) {
      const updatedQuestions = [...questions];
      updatedQuestions.splice(qIndex, 1);
      setQuestions(updatedQuestions);
    } else {
      toast.info("Cần ít nhất 1 câu hỏi trong quiz.");
    }
  };

  const handleChangeQuestion = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleChangeChoice = (qIndex, cIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].choices[cIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSetCorrectAnswer = (qIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].correctAnswer = value;
    setQuestions(updatedQuestions);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: ({ quizId, quizTitle, questions }) => {
      return editQuiz({
        quizId,
        quizTitle,
        questions,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Sữa bài tập thành công");
      refetch();
      navigate("/admin/manager-quiz");
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const handleSaveQuiz = () => {
    const formattedQuiz = {
      quizTitle: quizName,
      questions: questions.map((q) => ({
        question: q.question,
        answers: q.choices.map((choice, index) => {
          return `${String.fromCharCode(65 + index)}. ${choice}`;
        }),
        correctAnswer: q.choices.indexOf(q.correctAnswer),
      })),
    };

    // Gửi dữ liệu đã định dạng lên server
    mutate({
      quizId,
      quizTitle: formattedQuiz?.quizTitle,
      questions: formattedQuiz?.questions,
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {isPending && <Loader />}
      <div className="mx-auto bg-white p-6 rounded shadow">
        <div className="w-full flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-primary">Tạo bài tập</h1>

          {/* Nút lưu quiz */}
          <button onClick={handleSaveQuiz} className={styled.buttonPrimary}>
            Đồng ý lưu
          </button>
        </div>
        {/* Tên quiz */}
        <div className="mb-6 border p-3 border-primary rounded flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center text-lg font-bold bg-primary text-white">
            1
          </div>
          <label className={`${styled.label} !text-lg !mb-0 text-nowrap`}>
            Tên bài tập:
          </label>

          <div className="w-full">
            <input
              type="text"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="Nhập tên bài học"
              className="w-full text-lg border-b border-gray1 outline-none"
            />
          </div>
        </div>

        <div className="mb-6 border p-3 border-primary rounded">
          <div className="w-full flex items-center gap-2">
            <div className="w-7 h-7 flex items-center justify-center text-lg font-bold bg-primary text-white">
              2
            </div>
            <label className={`${styled.label} !text-lg !mb-0 text-nowrap`}>
              Câu hỏi bài tập:
            </label>
          </div>

          <div className="w-full p-4">
            <div className="">
              {questions.map((question, qIndex) => (
                <div key={qIndex}>
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="text-error outline-none rounded-full p-4 bg-error/10"
                    >
                      <AiOutlineDelete size={20} />
                    </button>
                  </div>

                  <div className="mb-3 border-gray5 border p-4 relative">
                    <div className="w-full flex items-center gap-5">
                      <h2 className="text-base font-semibold text-nowrap">
                        Câu hỏi {qIndex + 1}:
                      </h2>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) =>
                          handleChangeQuestion(qIndex, e.target.value)
                        }
                        placeholder="Nhập câu hỏi"
                        className={styled.input}
                      />
                    </div>

                    {/* Danh sách đáp án */}
                    <div className="mt-4 flex items-center gap-5 space-y-2 ">
                      <div className="flex items-center">
                        <h2 className="text-base font-semibold text-nowrap">
                          Lựa chọn:
                        </h2>
                      </div>
                      <div className="w-full flex flex-col gap-3 border-gray5 border p-4">
                        {question.choices.map((choice, cIndex) => (
                          <div key={cIndex} className="flex items-center gap-4">
                            {String.fromCharCode(65 + cIndex)}:
                            <div className="relative w-full flex items-center">
                              <input
                                type="text"
                                value={choice}
                                onChange={(e) =>
                                  handleChangeChoice(
                                    qIndex,
                                    cIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={`Nhập câu trả lời`}
                                className={styled.input}
                              />
                              <button
                                onClick={() =>
                                  handleRemoveChoice(qIndex, cIndex)
                                }
                                className="absolute right-3 px-3 py-1 text-error"
                              >
                                <AiOutlineDelete />
                              </button>
                            </div>
                            <label>
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={choice === question.correctAnswer}
                                onChange={() =>
                                  handleSetCorrectAnswer(qIndex, choice)
                                }
                                className="radio radio-error"
                              />{" "}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-full flex items-center justify-center mt-4">
                      <button
                        onClick={() => handleAddChoice(qIndex)}
                        className={styled.buttonPrimary10}
                      >
                        Thêm câu trả lời
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddQuestion}
                className={styled.buttonPrimary}
              >
                Thêm câu hỏi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuiz;
