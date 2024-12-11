import React from "react";
import { MdComputer } from "react-icons/md"; // Import icon từ react-icons
import styled from "../../constants/styles/styles";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { deleteQuiz } from "../../services/quizService";
import { toast } from "sonner";

const CardQuiz = ({ item, refetch }) => {
  const { mutate, isPending } = useMutation({
    mutationFn: ({ quizId }) => {
      return deleteQuiz({
        quizId,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Xóa thành công");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const handleDeleteQuiz = () => {
    mutate({ quizId: item._id });
  };
  return (
    <div className="w-full rounded-lg border border-gray1 overflow-hidden h-max bg-white hover:shadow-card hover:translate-y-[-4px] duration-300">
      {/* Phần đầu của card */}
      <div className="bg-primary p-4 h-[150px] flex items-center justify-center">
        <MdComputer className="text-white" fontSize={50} />
        {/* Icon với màu trắng */}
      </div>
      {/* Phần nội dung của card */}
      <div className="p-4">
        <div className="w-full h-14">
          <h2 className="text-xl font-semibold mb-2 line-clamp-2">
            {item?.quizTitle}
          </h2>
        </div>
        <p className="text-gray-600 mb-4">{item.questions?.length} câu hỏi</p>
        <div className="flex gap-3 items-center justify-end">
          <Link
            to={`/admin/manager-quiz/edit/${item._id}`}
            className={styled.buttonPrimary10}
          >
            Sửa
          </Link>
          <button onClick={handleDeleteQuiz} className={styled.buttonPrimary10}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardQuiz;
