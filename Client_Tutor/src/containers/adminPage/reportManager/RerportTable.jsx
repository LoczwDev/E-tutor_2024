import { motion } from "framer-motion";
import { Edit, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import styled from "../../../constants/styles/styles";
import Loading from "../../../components/loader/Loading";
import { Link } from "react-router-dom";
import images from "../../../constants/images/images";
import { useGetAllPost } from "../../../hooks/usePosts";
import { deletePost, updateStatusByPost } from "../../../services/postsService";
import { useMutation } from "@tanstack/react-query";
import Loader from "../../../components/loader/Loader";
import { toast } from "sonner";
import { useGetAllReport, useGetReport } from "../../../hooks/useReport";
import ModalCustom from "../../../components/modal/ModalCustom";
import { deleteReport } from "../../../services/reportServer";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import parse from "html-react-parser";
import { blockComment } from "../../../services/commentService";

const RerportTable = () => {
  const { data, isLoading, refetch } = useGetAllReport();
  const [dataReports, setDataReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [checkView, setCheckView] = useState(false);

  useEffect(() => {
    if (data && !isLoading) {
      setDataReports(data?.reports);
    }
  }, [data, isLoading]);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ postId, status }) => {
      return updateStatusByPost({
        postId,
        status,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Đã cập nhật thành công");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });
  const { mutate: mutateDelte, isPending: isPendingDelete } = useMutation({
    mutationFn: ({ reportId }) => {
      return deleteReport({
        reportId,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Xoá thành công");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const handleDeleteReport = (id) => {
    mutateDelte({ postId: id });
  };

  const handleShowreport = (id) => {
    setActiveReport(id);
    setCheckView(true);
  };
  return (
    <>
      {(isPending || isPendingDelete) && <Loader />}
      <motion.div
        className="bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray1 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray9">Danh sách tố cáo</h2>
        </div>

        {isLoading ? (
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                    Người báo cáo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                    Lý do
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {dataReports?.map((report) => (
                  <motion.tr
                    key={report._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray5 flex gap-2 items-center">
                      <img
                        src={
                          report.user?.avatar
                            ? report.user?.avatar?.url
                            : images.AvatarCur
                        }
                        alt="report img"
                        className="size-10 rounded-full"
                      />
                      <p className="line-clamp-1">{report.user?.fullName}</p>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray5">
                      {report.type || "Chưa xác định"}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${report?.status === "Ẩn" ? "text-error" : "text-[#23bd33]"}`}
                    >
                      {report?.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray5">
                      <button
                        onClick={() => handleDeleteReport(report._i)}
                        className="text-primary mr-2"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => handleShowreport(report._id)}
                        className="text-secondary mr-2"
                      >
                        Xem
                      </button>
                    </td>
                    {dataReports.length <= 0 && (
                      <td
                        colSpan={5}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray5"
                      >
                        Không có dữ liệu
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {
              <td
                colSpan={4}
                className="text-center justify-center text-error px-6 py-4 text-sm font-medium flex gap-2 items-center"
              >
                Hiên không có đơn nào
              </td>
            }
          </div>
        )}
      </motion.div>
      <ModalCustom
        isOpen={checkView}
        onclose={() => setCheckView(!checkView)}
        title={"Chi tiết báo cáo"}
      >
        <ItemReport
          activeReport={activeReport}
          setActiveReport={setActiveReport}
          setCheckView={setCheckView}
          refetchTable={refetch}
        />
      </ModalCustom>
    </>
  );
};
export default RerportTable;

const ItemReport = ({ activeReport, setCheckView, refetchTable }) => {
  const { data, isLoading, refetch } = useGetReport(activeReport);
  const [reportDetails, setReportDetails] = useState(null);
  useEffect(() => {
    refetch();
  }, [activeReport]);
  useEffect(() => {
    if (data && !isLoading) {
      setReportDetails(data?.report);
    }
  }, [data, isLoading]);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ commentId }) => {
      return blockComment({
        commentId,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Cập nhật quyền thành công");
      // setActiveUserId(null);
      setCheckView(false);
      refetchTable();
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const handleBlockComment = () => {
    mutate({ commentId: comment._id });
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[80vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!reportDetails) {
    return (
      <div className="text-center">
        {" "}
        <p className="text-error text-lg font-medium">
          Không lấy được dữ liệu.
        </p>
      </div>
    );
  }

  const { type, reason, user, comment, post, course } = reportDetails;

  return (
    <>
      {isPending && <Loader />}
      <div className="w-full min-w-[700px] bg-white p-6 shadow-lg rounded-lg">
        <div className="mb-4">
          <h4 className="text-lg font-semibold">Lý do báo cáo:</h4>
          <p className="text-gray-700">{reason}</p>
        </div>

        {type === "Bình luận" && comment && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold">Thông tin bình luận:</h4>
            <p className="text-gray-700">
              Người bình luận: {comment.user.fullName}
            </p>
            <div className="flex flex-nowrap items-start gap-x-3 bg-[#fff] dark:bg-base-100 rounded-lg mt-5">
              <div className="w-10 h-10">
                <img
                  src={
                    comment?.user?.avatar
                      ? comment.user.avatar?.url
                      : images.AvatarCur
                  }
                  className={`h-full w-full object-cover rounded-full ${comment.user.avatar ? "" : "border-2 border-primary"}`}
                  alt="userComment"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <div className="w-f flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-dark-hard dark:text-dark-light text-sm">
                      {comment.user.fullName}
                    </h5>
                    <span className="w-1 h-1 rounded-full bg-gray6 mt-0.5" />
                    <span className="text-xs text-dark-light mt-0.5">
                      {formatDistanceToNow(comment?.updatedAt, {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </div>
                <p className="font-montserrat content-comment text-base text-dark-light">
                  {comment.desc ? parse(comment.desc) : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {type === "post" && post && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold">Thông tin bài viết:</h4>
            <div className="flex items-center gap-4">
              <img
                src={
                  post.thumbnail ? post.thumbnail.url : images.DefaultThumbnail
                }
                alt="Post thumbnail"
                className="w-16 h-16 object-cover rounded-md"
              />
              <div>
                <p className="text-gray-700">Tiêu đề: {post.title}</p>
                <p className="text-gray-700">Chủ đề: {post.topic}</p>
                <p className="text-gray-700">
                  Người đăng: {post.user.fullName}
                </p>
              </div>
            </div>
          </div>
        )}

        {type === "course" && course && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold">Thông tin khóa học:</h4>
            <div className="flex items-center gap-4">
              <img
                src={
                  course.thumbnail
                    ? course.thumbnail.url
                    : images.DefaultCourseThumbnail
                }
                alt="Course thumbnail"
                className="w-16 h-16 object-cover rounded-md"
              />
              <div>
                <p className="text-gray-700">Tên khóa học: {course.name}</p>
                <p className="text-gray-700">
                  Giáo viên: {course.tutor.fullName}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="sticky bottom-0 bg-white border-t border-gray1 pt-3 w-full flex items-center justify-end gap-5">
          <button
            onClick={() => setCheckView(false)}
            className={styled.buttonTran}
          >
            Đóng
          </button>
          {type === "Bình luận" && (
            <div className="">
              <button
                onClick={handleBlockComment}
                className={styled.buttonPrimary}
              >
                {comment.block ? "Mở khóa" : "Khóa bình luận"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
