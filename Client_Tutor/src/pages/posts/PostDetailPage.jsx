import React, { useEffect, useState } from "react";
import { MainLayout } from "../../components/layouts/MainLayout";
import SectionLayout from "../../components/layouts/SectionLayout";
import BreadCrumbs from "../../components/BreadCrumbs";
import { useParams } from "react-router-dom";
import { useGetSignlePost } from "../../hooks/usePosts";
import Loading from "../../components/loader/Loading";
import images from "../../constants/images/images";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import parse from "html-react-parser";
import useUser from "../../hooks/useUser";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toggleFavoritePost } from "../../services/postsService";
import { useDispatch } from "react-redux";
import { userActions } from "../../store/reducers/userReducers";
import { toast } from "sonner";
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import Loader from "../../components/loader/Loader";
import { GoComment } from "react-icons/go";
import CommentsContainer from "../../components/comments/CommentsContainer";
import { getCommentByPost } from "../../services/commentService";

const PostDetailPage = () => {
  const { postId } = useParams();
  const user = useUser();
  const dispatch = useDispatch();
  const [dataPost, setDataPost] = useState(null);
  const [isCheckFavorite, setIsCheckFavorite] = useState(false);
  const [checkShowComment, setCheckShowComment] = useState(false);
  useEffect(() => {
    if (user) {
      const isCheck = user?.favoritePost?.some((item) => item === postId);
      setIsCheckFavorite(isCheck);
    }
  }, [user]);

  const { data, isLoading, refetch } = useGetSignlePost(postId);
  useEffect(() => {
    if (data && !isLoading) {
      setDataPost(data?.post);
    }
  }, [data, isLoading]);
  const dataBreadCumbs = [
    {
      name: "Trang chủ",
      link: "/",
    },
    {
      name: "Tất cả bài viết",
      link: "/list-posts",
    },
    {
      name: `${dataPost?.title}`,
      link: `/post/${postId}`,
    },
  ];
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

  const handleFavorite = () => {
    mutate({ postId });
  };

  const {
    data: dataComment,
    isLoading: isLoadingComment,
    isError,
    refetch: refectchComment,
  } = useQuery({
    queryFn: () => getCommentByPost({ postId: postId }),
    queryKey: ["getCommentByPost", postId],
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  useEffect(() => {
    if (checkShowComment) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    // Cleanup function
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [checkShowComment]);
  return (
    <MainLayout>
      {isPending && <Loader />}
      <SectionLayout>
        {isLoading ? (
          <div className="w-full h-[50vh] flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <>
            <BreadCrumbs data={dataBreadCumbs} />
            <div className="w-flex flex gap-3">
              <div className="w-1/4">
                <div className="w-full sticky top-[9px]">
                  <div className="text-lg font-medium pb-3 border-b border-gray1">
                    {dataPost?.user?.fullName}
                  </div>
                  <div className="w-full flex items-center gap-5 my-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleFavorite}
                        className="flex items-center gap-2
                      "
                      >
                        {isCheckFavorite ? (
                          <IoHeartSharp
                            className="text-primary"
                            fontSize={25}
                          />
                        ) : (
                          <IoHeartOutline
                            className="text-primary"
                            fontSize={25}
                          />
                        )}
                        {dataPost?.favorite || 0}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCheckShowComment(!checkShowComment)}
                        className="flex items-center gap-2
                      "
                      >
                        <GoComment className="text-primary" fontSize={21} />
                        {dataComment?.comment?.length || 0}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-1/2">
                <h1 className="text-2xl font-medium mb-2">{dataPost?.title}</h1>
                <div className="flex items-center gap-3 my-7">
                  <img
                    src={
                      dataPost?.user?.avatar
                        ? dataPost?.user?.avatar?.url
                        : images.AvatarCur
                    }
                    alt="Author"
                    className="w-14 h-14 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold">Trung Lê Thành</p>
                    <p className="text-sm text-gray-500">
                      {" "}
                      <span className="text-xs text-gray5 mt-[3px]">
                        {dataPost?.updatedAt
                          ? formatDistanceToNow(new Date(dataPost.updatedAt), {
                              addSuffix: true,
                              locale: vi,
                            })
                          : "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="w-full leading-6 text-justify">
                  {dataPost?.content ? parse(dataPost.content) : null}
                </div>
              </div>
            </div>
            <div>
              <div
                className={`fixed top-0 right-0 left-0 bottom-0 w-full flex justify-end bg-black/50 shadow-lg transition-transform z-[500] ${
                  checkShowComment
                    ? "transform translate-x-0"
                    : "transform translate-x-full"
                }`}
                style={{ transition: "transform 0.3s ease-in-out" }}
              >
                <div className="relative w-2/3 bg-white">
                  <button
                    onClick={() => setCheckShowComment(!checkShowComment)}
                    className="absolute top-0 right-0 left-0 w-max text-end z-[100]"
                  >
                    <span className="p-5 block w-max hover:rotate-180 transform transition-all ease-in-out duration-500 text-primary hover:text-primary/50">
                      ✕
                    </span>
                  </button>
                  <div className="w-full py-7 px-10 relative z-[50] overflow-y-auto overflow-x-hidden max-h-screen scrollbar-thin">
                    <div className="w-full flex items-center justify-between my-5">
                      <span className="text-lg font-medium">
                        {dataComment?.comment?.length} bình luận
                      </span>
                      <span className="text-xs text-gray5">
                        Nếu thấy bình luận spam, các bạn bấm report giúp admin
                        nhé
                      </span>
                    </div>
                    <CommentsContainer
                      logginedUserId={user?._id}
                      comments={dataComment?.comment}
                      postId={postId}
                      refetch={refectchComment}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SectionLayout>
    </MainLayout>
  );
};

export default PostDetailPage;
