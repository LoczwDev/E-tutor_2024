import React, { useRef, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaCamera } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MainLayout } from "../../components/layouts/MainLayout";
import SectionLayout from "../../components/layouts/SectionLayout";
import styled from "../../constants/styles/styles";
import BreadCrumbs from "../../components/BreadCrumbs";
import { useMutation } from "@tanstack/react-query";
import { editPost } from "../../services/postsService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Loader from "../../components/loader/Loader";
import { useGetSignlePost } from "../../hooks/usePosts";
import Loading from "../../components/loader/Loading";

const EditUserPostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef();

  const { data, isLoading } = useGetSignlePost(postId);

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [contentPost, setContentPost] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [tags, setTags] = useState([]);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ postId, title, content, topic, tags, status, thumbnail }) =>
      editPost({ postId, title, content, topic, tags, status, thumbnail }),
    onSuccess: (data) => {
      toast.success(data.message || "Sửa thành công");
      navigate("/user-posts");
    },
    onError: (error) => {
      toast.error(error.message || "Đã xảy ra lỗi");
    },
  });

  useEffect(() => {
    if (data?.post) {
      setTitle(data.post.title || "");
      setTopic(data.post.topic || "");
      setContentPost(data.post.content || "");
      setThumbnail(data.post.thumbnail?.url || null);
      setTags(data.post.tags || []);
    }
  }, [data]);

  const handleChangeThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setThumbnail(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const handleAddTags = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      const value = e.target.value.trim();

      // Tách chuỗi thành các thẻ bằng dấu phẩy
      const newTags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      // Kiểm tra và thêm thẻ vào mảng tags nếu chưa tồn tại
      setTags((prevTags) => {
        const updatedTags = [...prevTags];

        newTags.forEach((tag) => {
          if (updatedTags.length < 5 && !updatedTags.includes(tag)) {
            updatedTags.push(tag);
          }
        });

        return updatedTags;
      });

      // Xóa giá trị trong input sau khi xử lý
      e.target.value = "";
    }
  };

  // Hàm xóa thẻ
  const handleRemoveTag = (tagName) => {
    setTags(tags.filter((tag) => tag !== tagName));
  };
  const isPublishable = title.length > 15 && contentPost.trim();

  const handleSubmit = (status) => {
    if (isPublishable) {
      mutate({
        postId,
        title,
        content: contentPost,
        topic,
        tags,
        status,
        thumbnail,
      });
    }
  };
  console.log(tags);

  return (
    <MainLayout>
      <div className="w-full bg-background">
        {isPending && <Loader />}
        <SectionLayout>
          <BreadCrumbs
            data={[
              { name: "Trang chủ", link: "/" },
              { name: "Bài viết của bạn", link: "/user-posts" },
              { name: "Sửa bài viết", link: `/user-posts/edit/${postId}` },
            ]}
          />
          {isLoading ? (
            <div className="relative w-full h-[50vh] flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <div className="w-full mb-5 flex gap-5">
              {/* Content Section */}
              <div className="w-[70%] bg-white shadow-lg p-10">
                {/* Title Input */}
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  className="border-b border-gray1 outline-none w-full text-3xl mb-5"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {/* Topic Input */}
                <div>
                  <label className={`${styled.label} !text-lg`}>Mô tả</label>
                  <textarea
                    placeholder="Nhập mô tả"
                    rows={5}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className={styled.textarea}
                  ></textarea>
                </div>

                {/* Content Editor */}
                <div>
                  <label className={`${styled.label} !text-lg`}>Nội dung</label>
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={contentPost}
                    onChange={(value) => setContentPost(value)}
                    placeholder="Nhập mô tả khóa học của bạn"
                    className="w-full editor-post flex flex-col-reverse bg-transparent text-gray6 border border-gray1"
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

              {/* Thumbnail & Tags Section */}
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
                <div className="bg-white p-3 shadow-lg">
                  <label className={styled.label}>Thẻ bài viết</label>
                  <input
                    type="text"
                    placeholder="Nhập thẻ và nhấn Enter"
                    onKeyUp={handleAddTags} 
                    className={styled.input}
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray3 px-3 py-1 rounded-full flex items-center"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {tags.length >= 5 && (
                    <p className="text-red-500 text-sm mt-2">
                      Bạn chỉ có thể thêm tối đa 5 thẻ.
                    </p>
                  )}
                </div>
                <button
                  className={`${styled.buttonPrimary10} w-full ${
                    !isPublishable ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!isPublishable}
                  onClick={() => handleSubmit("Nháp")}
                >
                  LƯU NHÁP
                </button>
                <button
                  className={`${styled.buttonPrimary} w-full ${
                    !isPublishable ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!isPublishable}
                  onClick={() => handleSubmit("Xuất bản")}
                >
                  LƯU & XUẤT BẢN
                </button>
              </div>
            </div>
          )}
        </SectionLayout>
      </div>
    </MainLayout>
  );
};

export default EditUserPostPage;
