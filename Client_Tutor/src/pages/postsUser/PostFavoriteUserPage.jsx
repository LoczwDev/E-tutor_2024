import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import { MainLayout } from "../../components/layouts/MainLayout";
import SectionLayout from "../../components/layouts/SectionLayout";
import BreadCrumbs from "../../components/BreadCrumbs";
import { Link } from "react-router-dom";
import {
  useGetPostFavoriteByUser,
  useGetPostsByUser,
} from "../../hooks/usePosts";
import Loading from "../../components/loader/Loading";
import { BsThreeDots } from "react-icons/bs";
import images from "../../constants/images/images";
import { useMutation } from "@tanstack/react-query";
import { deletePost, toggleFavoritePost } from "../../services/postsService";
import Loader from "../../components/loader/Loader";
import { toast } from "sonner";
import useUser from "../../hooks/useUser";
import { useDispatch } from "react-redux";
import { userActions } from "../../store/reducers/userReducers";
import { FaCheckCircle } from "react-icons/fa";
const dataBreadCumbs = [
  { name: "Trang chủ", link: "/" },
  { name: "Bài viết đã thích", link: "/user-postFavorite" },
];

const PostFavoriteUserPage = () => {
  // Fetch data using custom hook
  const { data, isLoading, refetch } = useGetPostFavoriteByUser();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!isLoading && data) {
      setPosts(data?.posts);
    }
  }, [isLoading, data]);

  return (
    <MainLayout>
      <SectionLayout>
        <BreadCrumbs data={dataBreadCumbs} />
        <div className="w-full">
          <h4 className="text-3xl font-extrabold mb-5">Bài viết đã thích</h4>

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
              <div className="py-2 bg-primary/10 text-center font-bold text-primary">
                Bạn chưa thích khóa học nào
              </div>
            </div>
          )}
        </div>
      </SectionLayout>
    </MainLayout>
  );
};

const ItemPost = ({ item, refetch }) => {
  const dispatch = useDispatch();
  const [checkShow, setCheckShow] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: ({ postId }) => {
      return toggleFavoritePost({
        postId,
      });
    },
    onSuccess: (data) => {
      dispatch(userActions.setUserInfo(data));
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });
  const handleDeleteFavorite = () => {
    mutate({ postId: item._id });
  };
  return (
    <div className="w-full p-4 border border-gray-300 rounded shadow-sm hover:shadow-md">
      {isPending && <Loader />}
      <div className="w-full flex items-center justify-between">
        <div className="w-full flex items-center gap-2">
          <img
            src={
              item?.user?.avatar ? item?.user?.avatar?.url : images.AvatarCur
            }
            className="w-12 h-12 rounded-full"
            alt=""
          />
          <span className="text-lg font-medium">
            {item?.user?.fullName}{" "}
            {item?.user?.role === "tutor" ? (
              <FaCheckCircle className="bg-primary/10 text-primary" />
            ) : (
              ""
            )}
          </span>
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
                <button
                  onClick={handleDeleteFavorite}
                  className="bg-transparent text-start hover:bg-gray1 w-full p-3"
                >
                  Bỏ thích
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-full flex items-start justify-between mt-3">
        <div className="w-full flex items-start justify-between">
          <div className="w-full">
            <Link
              to={`/post/${item._id}`}
              className="text-xl font-bold mb-2 line-clamp-2"
            >
              {item.title}
            </Link>
            <div className="text-justify text-gray5 line-clamp-2 mb-5">
              {item.content ? parse(item?.content) : ""}
            </div>
            <div className="w-full flex items-center gap-3">
              {item?.tags?.length > 0 && (
                <div className="flex items-center gap-3">
                  {item?.tags?.map((tag, index) => (
                    <div
                      key={index}
                      className="rounded-full text-xs px-4 py-1 leading-6 bg-gray1"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
              <span className="text-gray5">
                <span className="text-primary mr-1">Cập nhật gần dây:</span>
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
          <div className="w-[300px] h-32">
            <img
              src={item?.thumbnail ? item?.thumbnail?.url : images.CardCourse}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostFavoriteUserPage;
