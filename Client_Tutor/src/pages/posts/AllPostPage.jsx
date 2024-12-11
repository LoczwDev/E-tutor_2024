import React, { useEffect, useState } from "react";
import { MainLayout } from "../../components/layouts/MainLayout";
import SectionLayout from "../../components/layouts/SectionLayout";
import BreadCrumbs from "../../components/BreadCrumbs";
import { useGetAllPost } from "../../hooks/usePosts";
import Loading from "../../components/loader/Loading";
import Loader from "../../components/loader/Loader";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { deletePost } from "../../services/postsService";
import { toast } from "sonner";
import { BsThreeDots } from "react-icons/bs";
import images from "../../constants/images/images";
import parse from "html-react-parser";
import { Pagination, Stack } from "@mui/material";
import { FaCheckCircle } from "react-icons/fa";

const dataBreadCumbs = [
  {
    name: "Trang chủ",
    link: "/",
  },
  {
    name: "Tất cả bài viết",
    link: "/list-posts",
  },
];
const AllPostPage = () => {
  const [dataPosts, setDataPosts] = useState([]);
  const [countPage, setCountPage] = useState(1);
  const [tag, setTag] = useState("");

  const { data, isLoading, refetch } = useGetAllPost(tag, countPage, 10);
  useEffect(() => {
    if (data && !isLoading) {
      setDataPosts(data?.posts);
    }
  }, [data, isLoading]);
  useEffect(() => {
    refetch();
  }, [countPage, tag]);

  const dataTabs = [
    "IT",
    "Công nghệ thông tin",
    "React",
    "UI/UX",
    "Tiếng anh",
    "Khác",
  ];
  return (
    <MainLayout>
      <SectionLayout>
        <BreadCrumbs data={dataBreadCumbs} />
        <div className="w-full mb-5">
          <h4 className="text-3xl font-extrabold mb-5">
            {tag !== "" ? tag : "Bài viết nổi bật"}
          </h4>
        </div>
        {isLoading ? (
          <div className="relative w-full h-[50vh] flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="w-full flex gap-5">
            <div className="w-3/4">
              {dataPosts?.length > 0 ? (
                <>
                  <div className="w-full grid grid-cols-1 gap-4 mb-5">
                    {dataPosts.map((post) => (
                      <ItemPost key={post._id} item={post} refetch={refetch} />
                    ))}
                  </div>
                  {dataPosts?.length > 10 && (
                    <div className="w-full flex items-center justify-center">
                      <Stack spacing={2}>
                        <Pagination
                          sx={{
                            "& .MuiPaginationItem-root": {
                              color: "#333",
                            },
                            "& .MuiPaginationItem-root.Mui-selected": {
                              backgroundColor: "#FF6636",
                              color: "white",
                            },
                            "& .MuiPaginationItem-ellipsis": {
                              color: "#FF6636",
                            },
                            "& .MuiPaginationItem-root.Mui-selected:hover": {
                              backgroundColor: "#ff6536ac",
                            },
                          }}
                          className="!text-[40px]"
                          onChange={(event, value) => {
                            setCountPage(value);
                          }}
                          count={10}
                          color="primary"
                        />
                      </Stack>
                    </div>
                  )}
                </>
              ) : (
                <div className="my-5">
                  <div className="py-2 bg-primary/10 text-primary text-center font-bold">
                    Chưa có bài viết phù hợp
                  </div>
                </div>
              )}
            </div>
            <div className="w-1/4">
              <span className="text-gray5 uppercase text-base">
                Chủ đề nổi bật khác
              </span>
              <div className="w-full my-3 flex flex-wrap gap-3">
                {dataTabs?.map((item, index) => (
                  <button
                    onClick={() => setTag(item)}
                    key={index}
                    className="rounded-full outline-none block text-xs px-4 py-1 leading-6 bg-gray1"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </SectionLayout>
    </MainLayout>
  );
};

export default AllPostPage;

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
      <div className="w-full flex items-center justify-between">
        <div className="w-full flex items-center gap-2">
          <img
            src={
              item?.user?.avatar ? item?.user?.avatar?.url : images.AvatarCur
            }
            className="w-12 h-12 rounded-full"
            alt=""
          />
          <span className="flex items-center gap-1 text-lg font-medium">
            {item?.user?.role === "tutor" ? (
              <FaCheckCircle className="bg-primary/10 text-primary" />
            ) : (
              ""
            )}
            {item?.user?.fullName}{" "}
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
      <div className="w-full flex items-start justify-between mt-3">
        <div className="w-full flex items-start justify-between gap-5">
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
