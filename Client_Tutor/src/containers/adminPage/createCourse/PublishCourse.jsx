import styled from "../../../constants/styles/styles";
import { useEffect, useState } from "react";
import PreviewCourse from "./PreviewCourse";
import { toast } from "sonner";
import { useGetAllQuizByUser } from "../../../hooks/useQuiz";
import CardQuiz from "../../../components/card/CardQuiz";
import { BsBoxSeam } from "react-icons/bs";
import { Link } from "react-router-dom";
import Loading from "../../../components/loader/Loading";

const Modal = ({ handlePublish, title, onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[9999]">
      <div className="bg-white w-[70%]">
        <div className="flex items-center justify-between p-5 border-b border-gray1">
          <h2 className="font-extrabold text-primary text-xl">{title}</h2>
          <div className="flex items-center gap-3 justify-between">
            <button
              onClick={() => {
                handlePublish("Chờ duyệt");
                onClose();
              }}
              type="button"
              className={styled.buttonPrimary}
            >
              Gửi kiểm duyệt
            </button>
            <button
              onClick={() => {
                handlePublish("Nháp");
                onClose();
              }}
              className={`${styled.buttonGray} bg-gray5`}
            >
              Xem lại và nháp
            </button>
          </div>
        </div>
        <div className="w-full p-5 h-[80vh] overflow-y-scroll overflow-x-hidden scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
};

const PublishCourse = ({
  handleChangeStep,
  step,
  data,
  setData,
  handlePublish,
  setCheckValue,
  checkValue,
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const { data: dataQuizs, isLoading } = useGetAllQuizByUser();
  console.log(data?.quizsCourse);

  const handleQuizSelect = (quizId) => {
    const quizsCourse = data?.quizsCourse || [];

    const updatedQuizsCourse = quizsCourse.includes(quizId)
      ? quizsCourse.filter((id) => id !== quizId)
      : [...quizsCourse, quizId];

    // Cập nhật số lượng checkValue
    setCheckValue(updatedQuizsCourse.length || 0);

    setData({
      quizsCourse: updatedQuizsCourse,
    });
  };

  const handleNextStep = () => {
    // if (data.quizsCourse?.length < 2) {
    //   toast.error("Bạn kiểm tra các giá trị lại nhé!");
    //   return;
    // }
    setIsOpenModal(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="w-full border-b border-gray1 px-7 py-5">
          <h3 className="font-semibold text-2xl">Xuất bản khóa học</h3>
        </div>
        {isLoading ? (
          <div className="w-full flex items-center justify-center h-[50vh]">
            <Loading />
          </div>
        ) : (
          <>
            <div className="w-full border-b border-gray1 px-7 py-5">
              <label className="block font-medium text-lg mb-1">
                Chọn bài tập của bạn (nếu có)
              </label>
              {dataQuizs?.quizs?.length > 0 ? (
                <div className="grid lg:grid-cols-4 gap-4">
                  {dataQuizs.quizs.map((item, index) => (
                    <button
                      key={index}
                      className={`w-full border-2 rounded-lg ${
                        data.quizsCourse?.includes(item._id)
                          ? "border-primary"
                          : "border-gray1"
                      }`}
                      onClick={() => handleQuizSelect(item._id)}
                    >
                      <CardQuiz item={item} />
                    </button>
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
                    <Link
                      to={"/admin/manager-quiz"}
                      className={styled.buttonPrimary}
                    >
                      Tạo bài tập đầu tiên
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="w-full flex items-center justify-between px-7 py-5">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => handleChangeStep(step - 1)}
                className={styled.buttonTran}
              >
                Trở lại
              </button>
              <button onClick={handleNextStep} className={styled.buttonPrimary}>
                Lưu và đi tiếp
              </button>
            </div>
          </>
        )}
      </div>
      {isOpenModal && (
        <Modal
          title={"Xem trước khi xuất bản"}
          handlePublish={handlePublish}
          onClose={() => setIsOpenModal(false)}
        >
          <PreviewCourse data={data} />
        </Modal>
      )}
    </>
  );
};

export default PublishCourse;
