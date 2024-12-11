import { BrushRounded } from "@mui/icons-material";
import React, { useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import useUser from "../../hooks/useUser";
import images from "../../constants/images/images";

const CommentsForm = ({
  btnLabel,
  formSubmitHanlder,
  formCancel = null,
  contentComment = "",
  loading = false,
}) => {
  const user = useUser();
  const quillRef = useRef();
  const [checkComment, setCheckComment] = useState(false);
  const [value, setValue] = useState(contentComment);
  const submitHanlder = (e) => {
    e.preventDefault();
    formSubmitHanlder(value);
    setCheckComment(false);
    setValue("");
  };
  
  return (
    <form onSubmit={submitHanlder}>
      <div className="w-full flex gap-3">
        <div className="w-12 h-12 rounded-full">
          <div className="w-full h-full">
            <img
              src={user?.avatar ? user?.avatar?.url : images.AvatarCur}
              className="w-full h-full rounded-full"
              alt=""
            />
          </div>
        </div>
        {!checkComment ? (
          <>
            {user?.listBlock?.commentblock ? (
              <div
                className="w-full rounded-lg py-3 px-4 bg-gray1 text-error font-bold"
              >
                Bạn đã bị chặn bình luận
              </div>
            ) : (
              <div
                onClick={() => setCheckComment(!checkComment)}
                className="w-full rounded-lg py-3 px-4 bg-gray1"
              >
                Nhập bình luận của bạn
              </div>
            )}
          </>
        ) : (
          <div className="w-full flex flex-col items-end">
            {/* <textarea
            className="w-full focus:outline-none resize-none"
            placeholder="Hãy để lại bình luận tại đây..."
            rows="5"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          /> */}
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={value}
              onChange={setValue}
              placeholder="Nhập nội dung bình luận"
              className="w-full editor-comment flex flex-col bg-transparent overflow-hidden text-gray6 border border-gray1"
              modules={{
                toolbar: [["bold", "italic", "underline", "image", "link"]],
              }}
              formats={["bold", "italic", "underline", "image", "link"]}
            />
            <div className="flex items-center gap-x-2 pt-2">
              {formCancel && (
                <button
                  className="px-6 py-2.5 mt-2 rounded-lg border border-red-500 text-red-500"
                  onClick={formCancel}
                >
                  Hủy
                </button>
              )}
              {!formCancel && (
                <button
                  className="px-6 py-2.5 mt-2 rounded-lg border border-red-500 text-red-500"
                  onClick={() => setCheckComment(!checkComment)}
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                disabled={loading || value === ""}
                className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {btnLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default CommentsForm;
