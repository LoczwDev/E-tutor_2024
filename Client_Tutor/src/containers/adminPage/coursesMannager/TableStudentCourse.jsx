import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Rate } from "antd";
import ModalCustom from "../../../components/modal/ModalCustom";
import images from "../../../constants/images/images";
import { useMutation } from "@tanstack/react-query";
import styled from "../../../constants/styles/styles";
import { addReplyReview } from "../../../services/coursesService";
import { toast } from "sonner";

const TableStudentCourse = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dataStudents, setDataStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (data) {
      setDataStudents(data?.studentsByCourse);
    }
  }, [data]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setDataStudents(data?.studentsByCourse);
    } else {
      const filtered = data?.studentsByCourse?.filter(
        (item) =>
          item?.student?.fullName.toLowerCase().includes(term) ||
          item?.student.email.toLowerCase().includes(term)
      );

      setDataStudents(filtered);
    }
  };

  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };
  const [reviewText, setReviewText] = useState("");
  const { mutate, isPending } = useMutation({
    mutationFn: ({ comment, courseId, reviewId }) => {
      return addReplyReview({
        comment,
        courseId,
        reviewId,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Trả lời thành công");
      setReviewText("");
      setIsModalOpen(false);
      setSelectedStudent(null);
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const replyReviews = (id) => {
    console.log("dads");
    
    mutate({ courseId: data?.course._id, comment: reviewText, reviewId: id });
  };

  return (
    <>
      {isModalOpen && selectedStudent && (
        <ModalCustom
          isOpen={isModalOpen}
          onClose={()=>setIsModalOpen(!isModalOpen)}
          title={"Trả lời đánh giá"}
        >
          <div className="min-w-[700px] p-6">
            <div className="w-full flex flex-col gap-4 mb-4">
            <h3 className="text-lg font-bold">
              Trả lời {selectedStudent.student.fullName}
            </h3>
            <p>Email: {selectedStudent.student.email}</p>
            <p>Tiến độ: {selectedStudent.percentNumber.toFixed(2)}%</p>
            <p>Nội dung:</p>
            <textarea rows={5} className="border border-gray1 p-2 ">{selectedStudent.review?.comment}</textarea>
            <p>
              Đánh giá:{" "}
              {selectedStudent.review ? (
                <Rate value={selectedStudent.review.rating} disabled />
              ) : (
                "Chưa có"
              )}
            </p>
            </div>

            <div className="w-full">
              <label htmlFor="ratting-form" className={`${styled.label} !text-lg`}>
                Lời nhắn
              </label>
              <textarea
                id="ratting-form"
                rows={5}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className={styled.textarea}
                placeholder="Hãy viết lời nhắn của bạn tại đây nhé"
              ></textarea>
            </div>
            <div className="flex items-center gap-3 justify-between p-4">
              <button
                onClick={closeModal}
                type="button"
                className={`${styled.buttonGray} !bg-gray0 !text-gray9 font-bold`}
              >
                Hủy
              </button>
              <button
                onClick={() => replyReviews(selectedStudent.review?._id)}
                className={`${styled.buttonPrimary}`}
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </ModalCustom>
      )}
      <motion.div
        className="bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray9">
            Danh sách học sinh
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm học sinh..."
              className="bg-gray1 text-gray9 placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                  Tiến dộ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                  Hành dộng
                </th>
              </tr>
            </thead>
            {dataStudents?.length > 0 ? (
              <tbody className="divide-y divide-gray-700">
                {dataStudents.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2 items-center">
                      <img
                        src={
                          item.student.avatar
                            ? item.student?.avatar.url
                            : images.AvatarCur
                        }
                        alt="avatar_student"
                        className="size-10 rounded-full"
                      />
                      {item.student.fullName}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{item.student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex text-base leading-5 font-semibold rounded-full ${item.percentNumber !== 100 ? "text-error" : "text-success"}`}
                      >
                        {item.percentNumber.toFixed(2)}%
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex text-xs text-primary leading-5 font-semibold rounded-full `}
                      >
                        {item.review ? (
                          <Rate value={item?.review.rating} disabled />
                        ) : (
                          "Chưa có"
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openModal(item)}
                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                      >
                        Trả lời
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            ) : (
              <td
                colSpan={5}
                className="w-full justify-center items-center text-center px-6 py-4 whitespace-nowrap text-sm text-error"
              >
                Không có dữ liệu
              </td>
            )}
          </table>
        </div>
      </motion.div>
    </>
  );
};

export default TableStudentCourse;
