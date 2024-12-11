import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { TableSortLabel, TablePagination } from "@mui/material";
import {
  useGetAllTutor,
  useGetAllUser,
  useGetProfileUserByAdmin,
} from "../../../hooks/useUser";
import images from "../../../constants/images/images";
import ModalCustom from "../../../components/modal/ModalCustom";
import Loading from "../../../components/loader/Loading";
import { useMutation } from "@tanstack/react-query";
import { updateListBlock } from "../../../services/userService";
import { toast } from "sonner";
import Loader from "../../../components/loader/Loader";
import styled from "../../../constants/styles/styles";
import { Rate } from "antd";

const TutorTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, refetch } = useGetAllTutor();
  const [dataUsers, setDataUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [checkView, setCheckView] = useState(false);

  // Sorting state

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");

  useEffect(() => {
    if (data && !isLoading) {
      setDataUsers(data?.tutors);
    }
  }, [data, isLoading]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setDataUsers(data?.tutors);
    } else {
      const filtered = data?.tutors?.filter(
        (item) =>
          item.tutor.fullName.toLowerCase().includes(term) ||
          item.tutor.email.toLowerCase().includes(term)
      );

      setDataUsers(filtered);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    sortData(property, isAsc ? "desc" : "asc");
  };

  const sortData = (property, direction) => {
    const sortedData = [...dataUsers].sort((a, b) => {
      // Truy cập giá trị của thuộc tính lồng nhau
      const aValue = property.includes(".")
        ? property.split(".").reduce((obj, key) => obj[key], a)
        : a[property];
      const bValue = property.includes(".")
        ? property.split(".").reduce((obj, key) => obj[key], b)
        : b[property];

      if (aValue < bValue) {
        return direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    setDataUsers(sortedData);
  };

  const toggleFormVisibility = (userId) => {
    setActiveUserId(userId);
    setCheckView(!checkView);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page change
  };

  // Get the data for the current page
  const currentData = dataUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      {isLoading ? (
        <div className="relative w-full h-[80vh] flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <>
          <motion.div
            className="bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-b-xl p-6 border border-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Danh sách tài khoản
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm"
                  className="bg-gray-100 text-gray-800 placeholder-gray-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            <div className="relative">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      <TableSortLabel
                        active={orderBy === "tutor.fullName"}
                        direction={order}
                        onClick={() => handleSort("tutor.fullName")}
                      >
                        Tên
                      </TableSortLabel>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      <TableSortLabel
                        active={orderBy === "tutor.email"}
                        direction={order}
                        onClick={() => handleSort("tutor.email")}
                      >
                        Email
                      </TableSortLabel>
                    </th>
                    <th>
                      <TableSortLabel
                        active={orderBy === "totalRatings"}
                        direction={order}
                        onClick={() => handleSort("totalRatings")}
                      >
                        Đánh giá
                      </TableSortLabel>
                    </th>
                    <th>
                      <TableSortLabel
                        active={orderBy === "totalStudents"}
                        direction={order}
                        onClick={() => handleSort("totalStudents")}
                      >
                        Học sinh
                      </TableSortLabel>
                    </th>
                    <th>
                      <TableSortLabel
                        active={orderBy === "tutor.percent"}
                        direction={order}
                        onClick={() => handleSort("tutor.percent")}
                      >
                        Phần trăm
                      </TableSortLabel>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {dataUsers.map((user, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 flex gap-2 items-center">
                        <img
                          src={
                            user.tutor.avatar
                              ? user.tutor.avatar.url
                              : images.AvatarCur
                          }
                          alt="avatar user"
                          className="w-10 h-10 rounded-full border border-gray-300"
                        />
                        {user.tutor.fullName}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800">
                          {user.tutor.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Rate value={user?.totalRatings} disabled />
                          <span>({user?.totalReviews})</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {user?.totalStudents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-primary font-bold">
                        {user?.tutor?.percent}%
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 relative">
                        <button
                          onClick={() => toggleFormVisibility(user.tutor._id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Quyền
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15]}
              component="div"
              count={dataUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số hàng mỗi trang"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} của ${count}`
              }
            />
          </motion.div>
          <ModalCustom
            isOpen={checkView}
            onclose={() => setCheckView(!checkView)}
            title={"Thông tin quyền của tài khoản"}
          >
            <FormListBlock
              activeUserId={activeUserId}
              setActiveUserId={setActiveUserId}
              setCheckView={setCheckView}
              refetchTable={refetch}
            />
          </ModalCustom>
        </>
      )}
    </>
  );
};

export default TutorTable;

const FormListBlock = ({
  activeUserId,
  setActiveUserId,
  setCheckView,
  refetchTable,
}) => {
  const { data, isLoading, refetch } = useGetProfileUserByAdmin(activeUserId);
  useEffect(() => {
    refetch();
  }, [activeUserId]);

  const [permissions, setPermissions] = useState({
    commentblock: false,
    postblock: false,
    courseblock: false,
    loginblock: false,
  });
  const [percentage, setPercentage] = useState("");
  const { mutate, isPending } = useMutation({
    mutationFn: ({ userId, updateData }) => {
      return updateListBlock({
        userId,
        updateData,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Cập nhật quyền thành công");
      // setActiveUserId(null);
      setCheckView(false);
      refetchTable();
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  useEffect(() => {
    if (data?.user) {
      // Set initial permission states based on the current data
      setPermissions({
        commentblock: data.user?.listBlock?.commentblock || false,
        postblock: data.user?.listBlock?.postblock || false,
        courseblock: data.user?.listBlock?.courseblock || false,
        loginblock: data.user?.listBlock?.loginblock || false,
      });
      setPercentage(data.user.percent || 60);
    }
  }, [data]);

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissions((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePercentageChange = (e) => {
    setPercentage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePermissions({
      permissions,
      percentage,
    });
  };

  const updatePermissions = async (updateData) => {
    mutate({ userId: activeUserId, updateData });
  };

  if (isLoading)
    return (
      <div className="relative min-w-[700px] h-[50vh] flex items-center justify-center">
        <Loading />
      </div>
    );

  return (
    <>
      {isPending && <Loader />}
      {activeUserId ? (
        <div className="w-full min-w-[700px] bg-white p-6 shadow-lg rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between gap-5 mb-6">
            {/* Avatar and Industry Section */}
            <div className="sticky top-0 flex flex-col items-center w-full sm:w-1/3 border border-gray-200 p-4 rounded-lg mb-6 sm:mb-0">
              <div className="w-32 h-32 mb-4 overflow-hidden rounded-full">
                <img
                  src={
                    data?.user?.avatar ? data.user.avatar.url : images.AvatarCur
                  }
                  alt="Ảnh đại diện"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-medium text-gray-800 mb-2">
                {data?.user?.fullName}
              </span>
              <p className="text-xs text-gray-500 line-clamp-1 mb-4">
                {data?.user?.title || "Chưa cung cấp"}
              </p>
              <h3 className="text-lg font-medium mb-2 text-gray-700">
                Ngành nghề
                <p className="text-primary text-center">
                  {data?.user.branch || "Học viên"}
                </p>
              </h3>
            </div>

            {/* Information Section */}
            <div className="w-full sm:w-2/3">
              <form onSubmit={handleSubmit}>
                <fieldset className="mb-4">
                  <label className="mb-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="commentblock"
                      checked={permissions.commentblock}
                      onChange={handlePermissionChange}
                      className="checkbox checkbox-error"
                    />
                    Cấm bình luận
                  </label>
                  <label className="mb-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="postblock"
                      checked={permissions.postblock}
                      onChange={handlePermissionChange}
                      className="checkbox checkbox-error"
                    />
                    Cấm đăng bài
                  </label>
                  <label className="mb-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="courseblock"
                      checked={permissions.courseblock}
                      onChange={handlePermissionChange}
                      className="checkbox checkbox-error"
                    />
                    Cấm đăng khóa học
                  </label>
                  <label className="mb-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="loginblock"
                      checked={permissions.loginblock}
                      onChange={handlePermissionChange}
                      className="checkbox checkbox-error"
                    />
                    Cấm đăng nhập
                  </label>
                </fieldset>
                <div className="mb-4">
                  <label
                    htmlFor="percentage"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    % doanh thu:
                  </label>
                  <input
                    type="number"
                    id="percentage"
                    name="percentage"
                    max={90}
                    min={60}
                    value={percentage}
                    onChange={handlePercentageChange}
                    placeholder="Nhập %"
                    className={styled.input}
                  />
                </div>
                <div className="w-full flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      // setActiveUserId(null);
                      setCheckView(false);
                    }}
                    className={styled.buttonPrimary10}
                  >
                    Trở lại
                  </button>
                  <button type="submit" className={styled.buttonPrimary}>
                    Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-[300px] flex items-center justify-center">
          <p className="text-lg text-primary font-semibold">Không có dữ liệu</p>
        </div>
      )}
    </>
  );
};
