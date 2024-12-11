import React, { useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaCamera } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MainLayout } from "../../components/layouts/MainLayout";
import SectionLayout from "../../components/layouts/SectionLayout";
import styled from "../../constants/styles/styles";
import BreadCrumbs from "../../components/BreadCrumbs";
import { useMutation } from "@tanstack/react-query";
import { createPost } from "../../services/postsService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Loader from "../../components/loader/Loader";
import useUser from "../../hooks/useUser";

const dataBreadCumbs = [
  {
    name: "Trang chủ",
    link: "/",
  },
  {
    name: "Bài viết của bạn",
    link: "/user-posts",
  },
  {
    name: "Tạo bài viết",
    link: "/user-createPost",
  },
];

const CreateUserPostPage = () => {
  const quillRef = useRef();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [contentPost, setContentPost] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [tags, setTags] = useState([]);
  const user = useUser();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ title, content, topic, tags, status, thumbnail }) => {
      return createPost({
        title,
        content,
        topic,
        tags,
        status,
        thumbnail,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Tạo bài viết thành công");
      navigate("/user-posts");
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const handleChangeThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setThumbnail(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e) => {
    const value = e.target.value.trim();
    if (value && !tags.includes(value)) {
      setTags((prev) => [...prev, value]);
    }
    e.target.value = "";
  };

  const isPublishable = title.length > 15 && contentPost.trim();

  const handleSubmitPublish = () => {
    if (isPublishable) {
      mutate({
        title,
        content: contentPost,
        topic,
        tags,
        status: "Xuất bản",
        thumbnail,
      });
    }
  };

  const handleSubmitDraft = () => {
    if (isPublishable) {
      mutate({
        title,
        content: contentPost,
        topic,
        tags,
        status: "Nháp",
        thumbnail,
      });
    }
  };
  return (
    <MainLayout>
      <div className="w-full bg-background">
        {isPending && <Loader />}
        <SectionLayout>
          <BreadCrumbs data={dataBreadCumbs} />
          <div className="w-full mb-5 flex gap-5">
            {/* Content Section */}
            <div className="w-[70%] mb-5 bg-white shadow-lg p-10">
              {/* Title Input */}
              <input
                type="text"
                placeholder="Tiêu đề"
                className="border-b border-gray1 outline-none w-full text-3xl mb-5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="my-5">
                <label
                  htmlFor="content"
                  className={`${styled.label} !text-lg my-5`}
                >
                  Mô tả (nếu có)
                </label>
                <textarea
                  placeholder="Nhập mô tả"
                  rows={5}
                  onChange={(e) => setTopic(e.target.value)}
                  className={styled.textarea}
                ></textarea>
              </div>

              {/* Content Editor */}
              <div>
                <label
                  htmlFor="content"
                  className={`${styled.label} !text-lg my-5`}
                >
                  Nội dung
                </label>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  onChange={(value) => setContentPost(value)}
                  placeholder="Nhập mô tả khóa học của bạn"
                  className="w-full flex flex-col-reverse bg-transparent text-gray6 border border-gray1"
                  modules={{
                    toolbar: [
                      [
                        { font: [] },
                        { size: ["small", "normal", "large", "huge"] },
                      ],
                      [{ header: [1, 2, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      [{ color: [] }, { background: [] }],
                      [
                        "blockquote",
                        "code-block",
                        "script",
                        "link",
                        "image",
                        "video",
                      ],
                    ],
                  }}
                  formats={[
                    "font",
                    "size",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "color",
                    "background",
                    "script",
                    "header",
                    "blockquote",
                    "code-block",
                    "indent",
                    "list",
                    "direction",
                    "align",
                    "link",
                    "image",
                    "video",
                    "formula",
                  ]}
                />
              </div>
            </div>

            {/* Thumbnail Section */}
            <div className="w-[30%] flex flex-col gap-5">
              <div className="w-full overflow-hidden bg-white p-3 h-max shadow-lg">
                <label className={`${styled.label} !text-lg`}>
                  Ảnh thu nhỏ
                </label>
                {!thumbnail ? (
                  <div className="w-full h-[35vh] bg-white rounded-md">
                    <div className="w-full h-full flex items-center justify-center border-dashed border-2 border-gray1 bg-gray0 rounded-md">
                      <label
                        htmlFor="fileThumbnail"
                        className="p-3 rounded-full overflow-hidden bg-gray3 cursor-pointer"
                      >
                        <FaCamera className="text-gray1 text-2xl" />
                        <input
                          name="fileThumbnail"
                          id="fileThumbnail"
                          onChange={handleChangeThumbnail}
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/gif, image/svg+xml"
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full flex items-center justify-center h-[30vh] overflow-hidden rounded-t-md">
                    <img
                      src={thumbnail}
                      className="absolute w-full h-full object-cover z-10"
                      alt="Thumbnail"
                    />
                    <div className="absolute top-0 right-0 px-2 py-3 h-auto bg-black/50 rounded-bl-[22px] z-[11] flex items-center justify-center gap-3">
                      <label
                        htmlFor="fileThumbnail"
                        className="p-2 bg-white/50 rounded-full cursor-pointer"
                      >
                        <FaCamera className="text-white text-base" />
                        <input
                          name="fileThumbnail"
                          id="fileThumbnail"
                          onChange={handleChangeThumbnail}
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/gif, image/svg+xml"
                          className="sr-only"
                        />
                      </label>
                      <button
                        className="p-2 bg-white/50 rounded-full"
                        onClick={() => setThumbnail(null)}
                      >
                        <MdDelete className="text-white text-base" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full overflow-hidden bg-white p-3 h-max shadow-lg">
                <label className={`${styled.label} !text-lg`}>
                  Thẻ bài viết
                </label>
                <span className="text-sm text-gray5 mb-3 block">
                  Thêm tối đa 5 thẻ để độc giả biết bài viết của bạn nói về điều
                  gì.
                </span>
                <input
                  type="text"
                  className={styled.input}
                  placeholder="Ví dụ: Front-end, ReactJs, UI, UX,..."
                  onBlur={handleAddTag}
                />
              </div>
              {
                <>
                  {user?.listBlock?.postblock ? (
                    <div className="p-2 bg-warning/10 text-warning text-center font-bold">
                      Bạn đang bị cấm đăng bài viết
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <button
                        className={`${styled.buttonPrimary10} w-full ${
                          !isPublishable ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={!isPublishable}
                        onClick={handleSubmitDraft}
                      >
                        LƯU NHÁP
                      </button>
                      <button
                        className={`${styled.buttonPrimary} w-full ${
                          !isPublishable ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={!isPublishable}
                        onClick={handleSubmitPublish}
                      >
                        XUẤT BẢN
                      </button>
                    </div>
                  )}
                </>
              }
            </div>
          </div>
        </SectionLayout>
      </div>
    </MainLayout>
  );
};

export default CreateUserPostPage;
