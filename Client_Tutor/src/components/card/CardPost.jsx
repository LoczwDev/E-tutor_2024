import React from "react";
import images from "../../constants/images/images";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const CardPost = ({ item }) => {
  return (
    <div className="relative group">
      <div className="w-full rounded-lg border border-gray1 overflow-hidden h-max bg-white group-hover:shadow-card group-hover:translate-y-[-4px] duration-300">
        <div className="w-full h-[180px]">
          <Link to={`/post/${item?._id}`}>
            <img
              src={item?.thumbnail?.url}
              className="w-full h-full object-cover"
              alt="card-post"
            />
          </Link>
        </div>
        <div className="w-full py-5 px-4 bg-[#00000008]">
          <div className="h-14">
            <Link
              to={`/post/${item?._id}`}
              className="text-lg font-medium line-clamp-2"
            >
              {item.title}
            </Link>
          </div>
          <div className="w-full flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={
                  item.user?.avatar ? item.user?.avatar?.url : images.AvatarCur
                }
                className="w-full h-full"
                alt=""
              />
            </div>
            <div>
              <span className="flex items-center gap-1 text-sm font-medium">
                {item?.user?.role === "tutor" ? (
                  <FaCheckCircle className="bg-primary/10 text-primary" />
                ) : (
                  ""
                )}
                {item?.user?.fullName}{" "}
              </span>
              <span className="text-xs text-gray5">
                {formatDistanceToNow(item?.updatedAt, {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPost;
