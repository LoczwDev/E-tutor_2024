import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Paper,
  TableSortLabel,
} from "@mui/material";
import { useGetAllOrdersAdmin, useGetOrder } from "../../../hooks/useOrder";
import images from "../../../constants/images/images";
import { formatCurrency } from "../../../hooks/formatCurrency";
import ModalCustom from "../../../components/modal/ModalCustom";
import { GoArrowDown } from "react-icons/go";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { IoPlayCircleOutline } from "react-icons/io5";
import { TfiMoney } from "react-icons/tfi";
import { CiCreditCard1 } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import Loading from "../../../components/loader/Loading";

const OrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, refetch } = useGetAllOrdersAdmin();
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("user");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Lấy danh sách đơn hàng và cập nhật state
  useEffect(() => {
    if (data && !isLoading) {
      setFilteredOrders(data?.orders);
    }
  }, [data, isLoading]);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = data.orders.filter((item) => {
      const email = item.emailOrder ? item.emailOrder.toLowerCase() : "";
      const fullName =
        item.user && item.user.fullName ? item.user.fullName.toLowerCase() : "";
      return email.includes(term) || fullName.includes(term);
    });

    setFilteredOrders(filtered);
  };

  // Xử lý sắp xếp
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    const sortedData = [...filteredOrders].sort((a, b) => {
      if (a[property] < b[property]) return isAsc ? -1 : 1;
      if (a[property] > b[property]) return isAsc ? 1 : -1;
      return 0;
    });
    setFilteredOrders(sortedData);
  };

  // Xử lý phân trang
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [selectIdOrder, setSelectIdOrder] = useState(null);
  const [checkView, setCheckView] = useState(false);

  const handleShowOrder = (id) => {
    setCheckView(true);
    setSelectIdOrder(id);
  };

  return (
    <>
      <div className="bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray1 mb-8">
        {/* Thanh tìm kiếm */}
        <div className="w-full flex items-end justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray9">
            Danh sách đơn hàng
          </h3>
          <div className="w-1/3">
            <TextField
              fullWidth
              label="Tìm kiếm..."
              variant="standard"
              color="warning"
              className="!m-0"
              value={searchTerm}
              onChange={handleSearch}
              margin="normal"
            />
          </div>
        </div>

        {/* Bảng */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Người dùng</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "emailOrder"}
                    direction={orderBy === "emailOrder" ? order : "asc"}
                    onClick={() => handleSort("emailOrder")}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "amountAdmin"}
                    direction={orderBy === "amountAdmin" ? order : "asc"}
                    onClick={() => handleSort("amountAdmin")}
                  >
                    Doanh thu admin
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "amountTutor"}
                    direction={orderBy === "amountTutor" ? order : "asc"}
                    onClick={() => handleSort("amountTutor")}
                  >
                    Doanh thu giáo viên
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "createdAt"}
                    direction={orderBy === "createdAt" ? order : "asc"}
                    onClick={() => handleSort("createdAt")}
                  >
                    Ngày tạo
                  </TableSortLabel>
                </TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="py-4 w-full flex items-center justify-center text-error font-bold">Không có đơn nào</div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          <img
                            src={
                              order?.user?.avatar
                                ? order?.user?.avatar?.url
                                : images.AvatarCur
                            }
                            alt="user avatar"
                            className="size-10 rounded-full"
                          />
                          <p className="line-clamp-1">
                            {order?.user?.fullName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{order?.emailOrder}</TableCell>
                      <TableCell>
                        <span className="text-primary font-bold text-lg">
                          {formatCurrency(order?.amountAdmin)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-error font-bold text-lg">
                          {formatCurrency(order?.amountTutor)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleShowOrder(order._id)}
                          className="text-secondary hover:bg-opacity-80"
                        >
                          Xem
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Phân trang */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} của ${count}`
          }
        />
      </div>
      <ModalCustom
        isOpen={checkView}
        onclose={() => setCheckView(!checkView)}
        title={"Thông tin đơn đơn hàng"}
      >
        <ItemOrder
          selectIdOrder={selectIdOrder}
          refetchTable={refetch}
          setSelectIdOrder={setSelectIdOrder}
          setCheckView={setCheckView}
        />
      </ModalCustom>
    </>
  );
};

export default OrdersTable;

const ItemOrder = ({
  selectIdOrder,
  refetchTable,
  setSelectIdOrder,
  setCheckView,
}) => {
  const { data, isLoading, refetch } = useGetOrder(selectIdOrder);

  useEffect(() => {
    refetch();
  }, [selectIdOrder]);
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  // format-DateOrder
  const formatDateOrder = (dateString) => {
    if (dateString) {
      const date = new Date(dateString);
      return format(date, "do MMMM, yyyy 'lúc' HH:mm", {
        locale: vi,
      });
    }
    return <span>Không xác định</span>;
  };

  const totalLectures = data?.order.courses.reduce((total, course) => {
    return (
      total +
      course.curriculumData.reduce((sum, curriculum) => {
        return sum + curriculum.lectures.length;
      }, 0)
    );
  }, 0);

  return (
    <>
      {isLoading ? (
        <div className="relative w-[500px] h-[40vh] flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <div className="max-w-[1000px] flex flex-col items-start gap-5 p-5">
          <div className="h-max flex flex-col items-center w-full border border-gray-200 p-4 rounded-lg sm:mb-0">
            <div className="w-40 h-40 mb-4 overflow-hidden rounded-full">
              <img
                src={
                  data?.order.user?.avatar
                    ? data?.order.user?.avatar?.url
                    : images.AvatarCur
                }
                alt="Ảnh đại diện"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-medium text-gray-800 mb-2">
              {data?.order?.user?.fullName}
            </span>
            <p className="text-xs text-gray-500 line-clamp-1 mb-4">
              {data?.order?.user?.title || "Chưa cung cấp"}
            </p>
            <h3 className="text-lg font-medium mb-2 text-gray-700">
              Ngành nghề{" "}
              <span className="text-primary">
                {data?.order.branch || "Chưa chọn"}
              </span>
            </h3>
          </div>

          <div className="border border-gray1 w-full">
            {/* Dropdown header */}
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer flex justify-between items-center p-4"
            >
              <div>
                <p
                  className={`text-lg pb-2 duration-300 ${isOpen ? "text-primary" : "text-gray9"}`}
                >
                  {formatDateOrder(data?.order.createdAt)}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-gray7 text-sm">
                    <IoPlayCircleOutline
                      className="text-secondary"
                      fontSize={20}
                    />
                    <span>{totalLectures} bài</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray7 text-sm">
                    <TfiMoney className="text-primary" fontSize={15} />
                    <span>
                      {" "}
                      {formatCurrency(data?.order?.payment_info?.amount)}{" "}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray7 text-sm">
                    <CiCreditCard1 className="text-success" fontSize={20} />
                    <span>
                      {data?.order.payment_info.confirmation_method === "Momo"
                        ? "MoMo"
                        : "Thẻ tín dụng"}
                    </span>
                  </div>
                </div>
              </div>
              <button className={`transform bg-primary text-white p-1.5`}>
                <GoArrowDown
                  fontSize={25}
                  className={`${isOpen ? "rotate-180" : "rotate-0"} transition-transform duration-300`}
                />
              </button>
            </div>

            {/* Dropdown content with smooth expand/collapse */}
            <div
              ref={contentRef}
              className="overflow-hidden border-t border-gray1 transition-all duration-500 ease-in-out"
              style={{
                maxHeight: isOpen
                  ? `${contentRef.current.scrollHeight}px`
                  : "0px",
              }}
            >
              <div className="w-full flex items-center justify-between px-4 py-3">
                <div className="w-1/2 flex flex-col gap-3">
                  {data?.order.courses.map((course, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="w-2/3 flex data?.orders-start gap-5">
                        <div className="w-56 h-28 overflow-hidden shadow-card">
                          <div className="w-full h-full">
                            <img
                              src={course.thumbnail.url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                        </div>
                        <div className="w-full flex flex-col justify-between h-auto">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <FaStar className="text-warning mb-0.5" />{" "}
                              <span>{course.ratings}</span>{" "}
                              <span className="text-gray4">
                                ({course.reviews.length} đánh giá)
                              </span>
                            </div>
                            <div className="text-lg font-medium line-clamp-2">
                              {course.name}
                            </div>
                          </div>

                          <div className="text-xs text-gray4">
                            Giảng viên:{" "}
                            <span className="text-gray7 text-base">
                              {course.tutor.fullName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-primary w-1/6 flex justify-end">
                        {formatCurrency(course.estimatedPrice)}
                      </div>
                    </div>
                  ))}
                </div>
                <span className="h-10 w-0.5 bg-primary" />

                <div className="w-1/3 flex flex-col justify-center items-center gap-3">
                  <p className={`text-lg pb-2 duration-300 `}>
                    {formatDateOrder(data?.order.createdAt)}
                  </p>
                  <p className={`text-lg pb-2 duration-300 `}>
                    Phí: {formatCurrency(7000)}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray7 text-sm">
                      <IoPlayCircleOutline
                        className="text-secondary"
                        fontSize={20}
                      />
                      <span>{totalLectures} bài</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray7 text-sm">
                      <TfiMoney className="text-primary" fontSize={15} />
                      <span>
                        {" "}
                        {formatCurrency(data?.order?.payment_info?.amount)}{" "}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray7 text-sm">
                      <CiCreditCard1 className="text-success" fontSize={20} />
                      <span>
                        {data?.order.payment_info.confirmation_method === "Momo"
                          ? "MoMo"
                          : "Thẻ tín dụng"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
