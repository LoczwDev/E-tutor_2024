import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { LuMessageSquare } from "react-icons/lu";
import { VscEdit } from "react-icons/vsc";
import { AiOutlineDelete } from "react-icons/ai";
import CommentsForm from "./CommentsForm";
import images from "../../constants/images/images";
import parse from "html-react-parser";
import { useMutation } from "@tanstack/react-query";
import { createReport } from "../../services/reportServer";
import { toast } from "sonner";
import useUser from "../../hooks/useUser";

const reasons = [
  "Nội dung không phù hợp",
  "Spam hoặc lừa đảo",
  "Xâm phạm quyền riêng tư",
  "Nội dung bạo lực hoặc nguy hiểm",
  "Khác",
];

const Comment = ({
  comment,
  logginedUserId,
  affectComment,
  setAffectComment,
  addComment,
  parentId = null,
  updateComment,
  deleteComment,
  getReply,
}) => {
  const isUserLogin = Boolean(logginedUserId);
  const checkToUser = logginedUserId === comment.user._id;
  const isReply =
    affectComment &&
    affectComment.type === "reply" &&
    affectComment._id === comment._id;
  const isEdit =
    affectComment &&
    affectComment.type === "edit" &&
    affectComment._id === comment._id;
  const replyCommentId = parentId ? parentId : comment._id;
  const replyUserId = comment.user._id;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: ({ commentId, reason, type }) => {
      return createReport({ commentId, reason, type });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Đã báo cáo thành công");
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const handleSubmit = () => {
    if (selectedReason) {
      mutate({
        commentId: comment?._id,
        reason: selectedReason,
        type: "Bình luận",
      });
      setIsOpen(false);
    } else {
      toast.success("Vui lòng chọn một lý do.");
    }
  };
  const user = useUser();

  return (
    <div className="relative flex flex-nowrap items-start gap-x-3 bg-[#fff] dark:bg-base-100 lg:p-3 rounded-lg">
      <div className="w-10 h-10">
        <img
          src={
            comment?.user?.avatar ? comment.user.avatar?.url : images.AvatarCur
          }
          className={`h-full w-full object-cover rounded-full ${comment.user.avatar ? "" : "border-2 border-primary"}`}
          alt="userComment"
        />
      </div>

      <div className="flex flex-1 flex-col">
        {comment.block && (
          <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center rounded-lg z-[100]">
            <span className="text-white font-bold text-lg">
              Bình luận đã bị khóa
            </span>
          </div>
        )}
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
          {user?._id !== comment.user._id && (
            <div className="relative z-[10]">
              <span className="font-bold text-xl peer cursor-pointer">...</span>
              <div className="absolute right-0 hover:bg-gray1 bg-white shadow-tooltip p-3 rounded-lg w-max opacity-0 translate-y-full peer-hover:opacity-100 hover:opacity-100 hover:translate-y-0 peer-hover:translate-y-0 duration-300 transition-all ease-in-out">
                <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
                  Báo cáo vi phạm
                </div>
              </div>
            </div>
          )}
        </div>

        {!isEdit && (
          <p className="font-montserrat content-comment text-base my-[5px] text-dark-light">
            {comment.desc ? parse(comment.desc) : ""}
          </p>
        )}

        {isEdit && (
          <CommentsForm
            btnLabel="Sữa"
            formSubmitHanlder={(value) => updateComment(value, comment._id)}
            formCancel={() => setAffectComment(null)}
            contentComment={comment.desc}
          />
        )}
        <div className="flex items-center text-center gap-x-3 text-dark-light font-montserrat text-xs mt-3 mb-3">
          {isUserLogin && (
            <button
              className="flex items-center space-x-2"
              onClick={() =>
                setAffectComment({ type: "reply", _id: comment._id })
              }
            >
              <LuMessageSquare className="w-4 h-auto" />
              <span>Trả lời</span>
            </button>
          )}
          {checkToUser && (
            <>
              <button
                className="flex items-center space-x-2"
                onClick={() =>
                  setAffectComment({ type: "edit", _id: comment._id })
                }
              >
                <VscEdit className="w-4 h-auto" />
                <span>Chỉnh sữa</span>
              </button>
              <button
                className="flex items-center space-x-2"
                onClick={() => deleteComment(comment._id)}
              >
                <AiOutlineDelete className="w-4 h-auto" />
                <span>Xóa</span>
              </button>
            </>
          )}
        </div>
        {isReply && (
          <CommentsForm
            btnLabel="Reply"
            formSubmitHanlder={(value) =>
              addComment(value, replyCommentId, replyUserId)
            }
            formCancel={() => setAffectComment(null)}
          />
        )}
        {getReply.length > 0 && (
          <div>
            {getReply.map((reply) => {
              return (
                <Comment
                  key={reply._id}
                  addComment={addComment}
                  affectComment={affectComment}
                  setAffectComment={setAffectComment}
                  comment={reply}
                  deleteComment={deleteComment}
                  logginedUserId={logginedUserId}
                  getReply={[]}
                  updateComment={updateComment}
                  parentId={comment._id}
                />
              );
            })}
          </div>
        )}
      </div>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[2000]">
          <div className="relative bg-white w-[90%] max-h-[70vh] max-w-md rounded-lg shadow-lg p-6 scrollbar-thin overflow-y-auto">
            {/* Header */}
            <div className="w-full sticky top-0 right-0 flex justify-between items-center bg-white z-[100]">
              <h3 className="text-lg font-semibold">Báo cáo</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="w-full py-3 border-b border-gray1">
              <h5 className="text-lg font-medium">Nội dung có vấn đề gì?</h5>
              <p>
                Chúng tôi sẽ kiểm tra theo tất cả Nguyên tắc cộng đồng nên bạn
                đừng lo lắng về việc phải lựa chọn sao cho chính xác nhất.
              </p>
            </div>
            {/* Danh sách lý do */}
            <div className="space-y-3 py-4">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`reason-${index}`}
                    name="report-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="radio radio-error"
                  />
                  <label
                    htmlFor={`reason-${index}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {reason}
                  </label>
                </div>
              ))}
            </div>

            {/* Nút gửi */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comment;
