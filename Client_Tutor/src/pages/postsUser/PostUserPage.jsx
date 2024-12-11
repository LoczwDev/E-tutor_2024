import React, { useEffect, useState } from "react";
import { MainLayout } from "../../components/layouts/MainLayout";
import SectionLayout from "../../components/layouts/SectionLayout";
import BreadCrumbs from "../../components/BreadCrumbs";
import { Link } from "react-router-dom";
import { useGetPostsByUser } from "../../hooks/usePosts";
import Loading from "../../components/loader/Loading";
import { BsThreeDots } from "react-icons/bs";
import images from "../../constants/images/images";
import { useMutation } from "@tanstack/react-query";
import { deletePost } from "../../services/postsService";
import Loader from "../../components/loader/Loader";
import { toast } from "sonner";
const dataBreadCumbs = [
  { name: "Trang chủ", link: "/" },
  { name: "Bài viết của bạn", link: "/user-posts" },
];

const PostUserPage = () => {
  const dataTabs = ["Bản nháp", "Đã xuất bản"];
  const [activeTab, setActiveTab] = useState("Bản nháp");

  // Fetch data using custom hook
  const { data, isLoading, refetch } = useGetPostsByUser();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!isLoading && data && activeTab) {
      const postsCur =
        activeTab === "Bản nháp" ? data?.drafts : data?.published;

      setPosts(postsCur);
    }
  }, [isLoading, data, activeTab]);

  // Map active tab to respective data

  return (
    <MainLayout>
      <SectionLayout>
        <BreadCrumbs data={dataBreadCumbs} />
        <div className="w-full">
          <h4 className="text-3xl font-extrabold mb-5">Bài viết của bạn</h4>
          <div className="flex items-center gap-10 mb-5 border-b">
            {dataTabs.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(item)}
                className={`py-2 ${
                  activeTab === item
                    ? "border-primary border-b-2 font-bold"
                    : ""
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="relative w-full h-[50vh] flex items-center justify-center">
              <Loading />
            </div>
          ) : posts?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {posts.map((post) => (
                <ItemPost key={post._id} item={post} refetch={refetch} />
              ))}
            </div>
          ) : (
            <div className="my-5">
              <span>
                {activeTab === "Bản nháp"
                  ? "Chưa có bản nháp nào."
                  : "Chưa có bài viết đã xuất bản nào."}
              </span>
              <p>
                Bạn có thể{" "}
                <Link
                  to={"/user-createPost"}
                  className="text-primary underline hover:no-underline"
                >
                  viết bài mới
                </Link>{" "}
                hoặc{" "}
                <Link
                  to={"/list-posts"}
                  className="text-primary underline hover:no-underline"
                >
                  đọc bài viết
                </Link>{" "}
                khác trên E-tutor nhé.
              </p>
            </div>
          )}
        </div>
      </SectionLayout>
    </MainLayout>
  );
};

const ItemPost = ({ item, refetch }) => {
  const [checkShow, setCheckShow] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: ({ postId }) => deletePost({ postId }),
    onSuccess: (data) => {
      toast.success(data.message || "Xóa thành công");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Đã xảy ra lỗi");
    },
  });

  const hanldeDeletePost = () => {
    mutate({ postId: item._id });
  };
  return (
    <div className="w-full p-4 border border-gray-300 rounded shadow-sm hover:shadow-md">
      {isPending && <Loader />}
      <div className="w-full flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-20 h-20">
            <img
              src={item?.thumbnail ? item?.thumbnail?.url : images.CardCourse}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2">{item.title}</h4>
            <span className="text-gray5">
              <span className="text-primary">Cập nhật gần dây:</span>
              {new Date(item.createdAt).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setCheckShow(!checkShow)}
            className="text-primary"
          >
            <BsThreeDots fontSize={20} />
          </button>
          {checkShow && (
            <div className="absolute w-[200px] h-max top-full right-0 bg-white shadow-tooltip">
              <div className="w-full text-sm flex flex-col items-start">
                <Link
                  to={`/user-posts/edit/${item._id}`}
                  className="bg-transparent text-start hover:bg-gray1 w-full p-3"
                >
                  Chỉnh sửa
                </Link>
                <button
                  onClick={hanldeDeletePost}
                  className="bg-transparent text-start hover:bg-gray1 w-full p-3"
                >
                  Xóa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostUserPage;
