import { motion } from "framer-motion";
import { Edit, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency } from "../../../hooks/formatCurrency";
import { useGetAllCourseByTutor } from "../../../hooks/useCourses";
import styled from "../../../constants/styles/styles";
import Loading from "../../../components/loader/Loading";
import { Link } from "react-router-dom";
import images from "../../../constants/images/images";
import { useGetAllPost } from "../../../hooks/usePosts";
import { deletePost, updateStatusByPost } from "../../../services/postsService";
import { useMutation } from "@tanstack/react-query";
import Loader from "../../../components/loader/Loader";
import { toast } from "sonner";

const PostTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, refetch } = useGetAllPost();
  const [dataPosts, setDataPosts] = useState([]);

  useEffect(() => {
    if (data && !isLoading) {
      setDataPosts(data?.posts);
    }
  }, [data, isLoading]);
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    // Ensure we filter from the original data
    const filtered = data?.posts?.filter(
      (post) =>
        post.title.toLowerCase().includes(term) ||
        post.category.toLowerCase().includes(term)
    );

    setDataPosts(filtered || []);
  };
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
    mutationFn: ({ postId }) => {
      return deletePost({
        postId,
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

  const handleChangeStatus = (id, status) => {
    console.log(status);

    mutate({ postId: id, status: status });
  };

  const handleDeletePost = (id) => {
    mutateDelte({ postId: id });
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
          <h2 className="text-xl font-semibold text-gray9">
            Danh sách bài viết
          </h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm bài viết..."
                className="bg-gray1 text-gray9 placeholder-gray9 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleSearch}
                value={searchTerm}
              />
              <Search
                className="absolute left-3 top-2.5 text-gray9"
                size={18}
              />
            </div>
          </div>
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
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                    Người đăng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                    Lượt thích
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {dataPosts?.map((post) => (
                  <motion.tr
                    key={post._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray5 flex gap-2 items-center">
                      <img
                        src={
                          post.thumbnail
                            ? post.thumbnail.url
                            : images.CardCourse
                        }
                        alt="post img"
                        className="size-10 rounded-full"
                      />
                      <Link
                        to={`/admin/manager-posts/view/${post?._id}`}
                        className="line-clamp-1"
                      >
                        {post.title}
                      </Link>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray5">
                      {post.user?.fullName}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray5">
                      {post.favorite}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${post?.status === "Ẩn" ? "text-error" : "text-[#23bd33]"}`}
                    >
                      {post?.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray5">
                      {post?.status === "Hoạt động" ? (
                        <button
                          onClick={() => handleChangeStatus(post._id, "Ẩn")}
                          className="text-primary mr-2"
                        >
                          Ẩn
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleChangeStatus(post._id, "Hoạt động")
                          }
                          className="text-indigo-400 hover:text-indigo-300 mr-2"
                        >
                          Mở
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Xóa
                      </button>
                    </td>
                    {dataPosts.length <= 0 && (
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
          </div>
        )}
      </motion.div>
    </>
  );
};
export default PostTable;
