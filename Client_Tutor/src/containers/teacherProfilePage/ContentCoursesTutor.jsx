import React from "react";
import TabsScrollDetail from "../courseDetailPage/TabsScrollDetail";
import CardCourse from "../../components/card/CardCourse";
import { Avatar, List, Rate } from "antd";
import images from "../../constants/images/images";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { FaCheckCircle } from "react-icons/fa";

const dataTabs = [
  {
    link: "Coursestutor",
    title: "Khóa học",
  },
  {
    link: "reviewsTutur",
    title: "Đánh giá của học viên",
  },
];

const ContentCoursesTutor = ({ dataTeacher }) => {
  // Flatten reviews from all courses
  const allReviews =
    dataTeacher?.courses.flatMap((course) => course.reviews) || [];

  return (
    <div className="w-full">
      <TabsScrollDetail dataTabs={dataTabs} />

      <div className="w-full mt-5">
        <h3 className="text-lg font-medium">
          {dataTeacher?.tutor.fullName} ({dataTeacher?.courses?.length})
        </h3>
        <div className="w-full grid grid-cols-2 gap-5 mt-7">
          {dataTeacher?.courses.map((item, index) => (
            <CardCourse key={index} item={item} />
          ))}
        </div>
      </div>

      <div className="w-full mt-20">
        <h3 className="text-lg font-medium">Đánh giá của học viên</h3>
        <div className="transition-all duration-500 overflow-hidden">
          <List
            className="mb-5 ease-in-out transition-all duration-300"
            itemLayout="horizontal"
            dataSource={allReviews}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      className="!w-12 !h-12"
                      src={
                        item.user?.avatar
                          ? item.user?.avatar?.url
                          : images.AvatarCur
                      }
                    />
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {item?.user?.fullName}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray6"></span>
                      <div className="text-gray6 text-xs">
                        {formatDistanceToNow(item?.updatedAt, {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </div>
                    </div>
                  }
                  description={
                    <>
                      <Rate disabled allowHalf defaultValue={item.rating} />
                      <p className="text-gray7 pt-1">{item.comment}</p>
                      {item?.commentReplies &&
                        item.commentReplies.length > 0 && (
                          <div className="pl-10 mt-4 border-l-2 border-gray-200">
                            {item.commentReplies.map((reply, index) => (
                              <div key={index} className="mb-4">
                                <List.Item.Meta
                                  avatar={
                                    <Avatar
                                      className="!w-10 !h-10"
                                      src={
                                        reply.user?.avatar
                                          ? reply.user?.avatar?.url
                                          : images.AvatarCur
                                      }
                                    />
                                  }
                                  title={
                                    <div className="flex items-center gap-2">
                                      <span className="flex items-center gap-1 text-sm font-medium">
                                        {reply?.user?.role === "tutor" ? (
                                          <FaCheckCircle className="bg-primary/10 text-primary" />
                                        ) : (
                                          ""
                                        )}
                                        {reply?.user?.fullName}{" "}
                                      </span>
                                      {/* <span className="w-1 h-1 rounded-full bg-gray6"></span> */}
                                      <div className="text-gray6 text-xs">
                                        {/* {formatDistanceToNow(reply?.updatedAt, {
                        addSuffix: true,
                        locale: vi,
                      })} */}
                                      </div>
                                    </div>
                                  }
                                  description={
                                    <>
                                      <p className="text-gray7 pt-1">
                                        {reply.comment}
                                      </p>
                                    </>
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        )}
                    </>
                  }
                />
                {/* Render comment replies if available */}
              </List.Item>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentCoursesTutor;
