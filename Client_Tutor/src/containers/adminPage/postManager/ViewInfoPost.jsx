import React from "react";
import images from "../../../constants/images/images";
import StateItemCourse from "../coursesMannager/StateItemCourse";
import TableUserFavoritePost from "./TableUserFavoritePost";

const ViewInfoPost = ({ data }) => {
  return (
    <div className="w-full">
      <div className="w-full bg-white shadow-section rounded-b-lg mb-5">
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Left Image */}
            <div className="w-[300px] h-[200px]">
              <img
                src={data?.post?.thumbnail?.url}
                alt="post"
                className="object-cover rounded-md w-full h-full"
              />
            </div>

            {/* Right Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Tạo:{" "}
                  {data?.post?.createdAt
                    ? new Date(data.post.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )
                    : "N/A"}{" "}
                  &nbsp; | &nbsp; Cập nhật:{" "}
                  {data?.post?.createdAt
                    ? new Date(data.post.updatedAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )
                    : "N/A"}{" "}
                </p>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-semibold text-gray-800 mt-2">
                {data?.post?.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{data?.post?.topic}</p>

              {/* Creators */}
              <div className="w-full flex items-center justify-between border-b pb-5">
                <div className="flex items-center mt-4 gap-2">
                  <img
                    src={
                      data?.post?.user?.avatar
                        ? data?.post?.user?.avatar?.url
                        : images.AvatarCur
                    } // Replace with avatar URL
                    alt="Creator"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="font-normal text-xs text-gray5">
                    Tạo bởi:
                    <p className="font-semibold text-base">
                      {data?.post?.user?.fullName}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full flex items-center gap-3 pt-3">
                <span>Tags:</span>
                <div className="flex items-center flex-wrap gap-3">
                  {data?.post?.tags?.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray5 leading-1 text-xs p-2 rounded-full text-white"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full">
        <TableUserFavoritePost data={data} />
      </div>
    </div>
  );
};

export default ViewInfoPost;
