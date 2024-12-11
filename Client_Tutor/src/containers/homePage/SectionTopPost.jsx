import React, { useEffect, useState } from "react";
import CardListCourse from "../../components/card/CardListCourse";
import SectionLayout from "../../components/layouts/SectionLayout";
import { useGetAllPost } from "../../hooks/usePosts";
import CardPost from "../../components/card/CardPost";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

const SectionTopPost = () => {
  const { data, isLoading } = useGetAllPost();
  const [dataPosts, setDataPosts] = useState([]);
  useEffect(() => {
    if (data && !isLoading) {
      setDataPosts(data?.posts);
    }
  }, [data, isLoading]);
  return (
    <SectionLayout>
      <div className="w-full flex items-start justify-between mb-10">
        <h3 className="text-gray9 text-3xl font-semibold capitalize">
          Bài viết nổi bật
        </h3>
      </div>
      {dataPosts?.length > 0 ? (
        <>
          <div className="w-full flex justify-end">
            <Link to={"/list-posts"} className="text-primary flex items-center gap-1 group hover:underline duration-300">
              Xem tất cả <FaChevronRight className="group-hover:ml-2 transition-all ease-in-out duration-300" />
            </Link>
          </div>
          <div className="w-full grid grid-cols-4 gap-3">
            {dataPosts?.map((item, index) => (
              <CardPost key={index} item={item} />
            ))}
          </div>
        </>
      ) : (
        <div className="w-full py-2 bg-primary/10 text-primary text-center font-bold">
          Hiện không có bài viết nào
        </div>
      )}
    </SectionLayout>
  );
};

export default SectionTopPost;
