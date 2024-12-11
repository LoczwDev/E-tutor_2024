import React from "react";
import { useParams } from "react-router-dom";
import { useGetViewCourseAdmin } from "../../../hooks/useCourses";
import images from "../../../constants/images/images";
import { Progress, Rate } from "antd";
import { formatCurrency } from "../../../hooks/formatCurrency";
import Loading from "../../../components/loader/Loading";

import StateItemCourse from "./StateItemCourse";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import TableStudentCourse from "./TableStudentCourse";
import RevenueChartOrder from "../ordersManager/RevenueChartOrder";

const ratings = [
  { stars: 5, percent: 0 },
  { stars: 4, percent: 0 },
  { stars: 3, percent: 0 },
  { stars: 2, percent: 0 },
  { stars: 1, percent: 0 },
];
const dataChart = [
  { name: "Jan", uv: 400 },
  { name: "Feb", uv: 300 },
  { name: "Mar", uv: 200 },
  { name: "Apr", uv: 278 },
  { name: "May", uv: 189 },
];

const calculateRatingDistribution = (comments) => {
  const totalRatings = comments?.length;
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  // Count ratings
  comments?.forEach(({ rating }) => {
    const flooredRating = Math.floor(rating);
    if (starCounts[flooredRating] !== undefined) {
      starCounts[flooredRating]++;
    }
  });

  // Calculate percentages
  ratings.forEach((rating) => {
    const count = starCounts[rating.stars];
    rating.percent =
      totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
  });
};

const ViewInfoCourse = ({ data, statsData }) => {
  //   const { data, isLoading } = useGetViewCourseAdmin(courseId);
  calculateRatingDistribution(data?.course?.reviews);

  return (
    <div className="w-full">
      <div className="w-full bg-white shadow-section rounded-b-lg mb-5">
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Left Image */}

            <div className="w-[350px] h-auto">
              <img
                src={
                  data?.course?.thumbnail?.url
                    ? data?.course?.thumbnail?.url
                    : images.CardCourse
                }
                alt="Course"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            {/* Right Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Tạo:{" "}
                  {data?.course?.createdAt
                    ? new Date(data.course.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )
                    : "N/A"}{" "}
                  &nbsp; | &nbsp; Cập nhật:{" "}
                  {data?.course?.createdAt
                    ? new Date(data.course.updatedAt).toLocaleDateString(
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
                {data?.course?.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {data?.course?.topic}
              </p>

              {/* Creators */}
              <div className="w-full flex items-center justify-between border-b pb-5">
                <div className="flex items-center mt-4 gap-2">
                  <img
                    src={
                      data?.course?.tutor?.avatar
                        ? data?.course?.tutor?.avatar?.url
                        : images.AvatarCur
                    } // Replace with avatar URL
                    alt="Creator"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="font-normal text-xs text-gray5">
                    Tạo bởi:
                    <p className="font-semibold text-base">
                      {data?.course?.tutor?.fullName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-md">
                  <Rate
                    value={data?.course?.ratings}
                    disabled
                    className="mb-1 text-warning"
                  />
                  <span>
                    {data?.course.ratings}.0
                    <span className="text-gray5">
                      ({data?.course?.reviews.length})
                    </span>
                  </span>
                </div>
              </div>

              {/* Pricing and Actions */}
              <div className="h-max flex items-center justify-between mt-6">
                <div className="w-full flex items-center">
                  <div>
                    <p className="text-primary text-lg font-medium">
                      {data?.course?.estimatedPrice
                        ? formatCurrency(data?.course?.estimatedPrice)
                        : "Chứa có"}
                    </p>
                    <p className="text-xs text-gray5">Giá khóa học</p>
                  </div>
                  <div className="w-[1px] h-10 mx-5 bg-gray5" />
                  <div>
                    <p className="text-primary text-lg font-bold">
                      {formatCurrency(data?.totalPaid)}
                    </p>
                    <p className="text-xs text-gray5">Thu vào</p>
                  </div>
                </div>
                <button className="bg-orange-500 text-nowrap text-white px-4 py-2 rounded-md hover:bg-orange-600">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <RevenueChartOrder courseId={data?.course?._id} />
      <div className="w-full flex gap-5 my-5">
        <div className="w-1/2 grid grid-cols-2 gap-5">
          {statsData.map((stat, index) => (
            <StateItemCourse key={index} stat={stat} icon={stat.icon} />
          ))}
        </div>
        <div className="w-1/2 bg-white shadow-section rounded-lg">
          <div className="w-full h-max">
            {/* Tổng điểm đánh giá */}
            <div className="w-full flex gap-3 border-b border-gray1 p-6">
              <div className="w-1/3">
                <div className="h-full bg-warning/10 w-full flex flex-col gap-3 items-center justify-center p-5">
                  <div className="text-4xl font-bold">
                    {data?.course.ratings}
                  </div>
                  <div className="w-full flex flex-col items-center justify-center text-center">
                    <Rate
                      className="w-full"
                      disabled
                      defaultValue={
                        data?.course.ratings === 0 ? 5 : data?.course.ratings
                      }
                      allowHalf
                    />
                    <p className="font-medium text-base w-full mt-3">
                      Đánh giá khóa học
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-2/3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dataChart}
                    margin={{
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    {/* Loại bỏ CartesianGrid, XAxis, YAxis và Tooltip */}
                    <Area
                      type="monotone"
                      dataKey="uv"
                      stroke="#FD8E1F"
                      fill="#FFF2E5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Thanh hiển thị phần trăm */}
            <div className="w-full flex flex-col p-6">
              {ratings.map((rating, index) => (
                <div
                  key={index}
                  className="w-full flex items-center justify-between mb-2 "
                >
                  <span className="w-2/5 flex items-center gap-2">
                    <Rate
                      disabled
                      defaultValue={rating.stars}
                      className="mr-2 mb-1"
                    />
                    <span className="text-gray6 text-sm block">
                      {`${rating.stars} sao`}
                    </span>
                  </span>
                  <Progress
                    percent={rating.percent}
                    status="active"
                    className="w-3/5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <TableStudentCourse data={data} />
    </div>
  );
};

export default ViewInfoCourse;
