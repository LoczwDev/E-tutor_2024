import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useGetAllApply, useGetApplyById } from "../../../hooks/useApply";
import ModalCustom from "../../../components/modal/ModalCustom";
import { useMutation } from "@tanstack/react-query";
import { deleteApply, updateStatus } from "../../../services/applyService";
import Loader from "../../../components/loader/Loader";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
} from "@mui/material";
import images from "../../../constants/images/images";
import styled from "../../../constants/styles/styles";

const ApplyTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, refetch } = useGetAllApply();
  const [dataApplys, setDataApplys] = useState([]);
  const [selectIdApply, setSelectIdApply] = useState(null);
  const [checkView, setCheckView] = useState(false);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleViewApply = (id) => {
    setSelectIdApply(id);
    setCheckView(true);
  };

  useEffect(() => {
    if (data && !isLoading) {
      setDataApplys(data?.applys);
    }
  }, [data, isLoading]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setDataApplys(data?.applys);
    } else {
      const filtered = data?.applys?.filter(
        (apply) =>
          apply.user.fullName.toLowerCase().includes(term) ||
          apply.branch.toLowerCase().includes(term)
      );
      setDataApplys(filtered);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: ({ applyId }) => {
      return deleteApply({
        applyId,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Xóa thành công");
      refetch();
      setSelectIdApply(null);
      setCheckView(false);
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const handleDelteApply = (id) => {
    mutate({ applyId: id });
  };

  const sortData = (data) => {
    return data.sort((a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === "asc" ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedData = sortData(dataApplys);
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      {isPending && <Loader />}
      <motion.div
        className="bg-white shadow-lg rounded-xl py-6 border border-gray1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-6 px-6">
          <h2 className="text-xl font-semibold text-gray9">
            Danh sách đơn đăng ký
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

        <TableContainer component={Paper} className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-700">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleRequestSort("name")}
                  >
                    Tên
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "email"}
                    direction={orderBy === "email" ? order : "asc"}
                    onClick={() => handleRequestSort("email")}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "branch"}
                    direction={orderBy === "branch" ? order : "asc"}
                    onClick={() => handleRequestSort("branch")}
                  >
                    Ngành
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "status"}
                    direction={orderBy === "status" ? order : "asc"}
                    onClick={() => handleRequestSort("status")}
                  >
                    Trạng thái
                  </TableSortLabel>
                </TableCell>
                <TableCell>Hành dộng</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((apply) => (
                  <TableRow key={apply._id}>
                    <TableCell className="text-sm font-medium text-gray5 flex gap-2 items-center">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            apply?.user.avatar
                              ? apply?.user.avatar.url
                              : images.AvatarCur
                          }
                          alt="avatar apply?.user"
                          className="size-10 rounded-full"
                        />
                        {apply?.user.fullName}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray5">
                      {apply?.user.email}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {apply.branch}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          apply?.status === "Chưa trả lời"
                            ? "bg-secondary/10 text-secondary"
                            : apply?.status === "Đã duyệt"
                              ? "bg-success/10 text-success"
                              : "bg-error/10 text-error"
                        }`}
                      >
                        {apply.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray5">
                      {apply?.status === "Chưa trả lời" ? (
                        <button
                          onClick={() => handleViewApply(apply._id)}
                          className="text-indigo-400 hover:text-indigo-300 mr-2"
                        >
                          Xem
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelteApply(apply._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Xóa
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-gray-500 py-4"
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedData.length}
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

      {checkView && (
        <ModalCustom
          isOpen={checkView}
          onClose={() => setCheckView(false)}
          applyId={selectIdApply}
        >
          <ViewApply
            selectIdApply={selectIdApply}
            refetchTable={refetch}
            setSelectIdApply ={setSelectIdApply }
            setCheckView={setCheckView}
          />
        </ModalCustom>
      )}
    </>
  );
};

export default ApplyTable;

const ViewApply = ({
  selectIdApply,
  refetchTable,
  setSelectIdApply,
  setCheckView,
}) => {
  const { data, isLoading, refetch } = useGetApplyById(selectIdApply);
  console.log(data);

  useEffect(() => {
    refetch();
  }, [selectIdApply]);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ applyId, status }) => {
      return updateStatus({
        applyId,
        status,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Cập nhật thành công");
      refetchTable();
      setSelectIdApply(null);
      setCheckView(false);
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const handleChangeStatus = (status) => {
    mutate({ applyId: selectIdApply, status: status });
  };
  return (
    <>
      {isPending && <Loader />}
      {selectIdApply ? (
        <div className="w-full max-w-[1000px] bg-white p-6 shadow-lg rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between gap-5 mb-6">
            {/* Avatar and Industry Section */}
            <div className="h-max flex flex-col items-center w-full sm:w-1/3 border border-gray-200 p-4 rounded-lg sm:mb-0">
              <div className="w-40 h-40 mb-4 overflow-hidden rounded-full">
                <img
                  src={
                    data?.apply.user?.avatar
                      ? data?.apply.user?.avatar?.url
                      : images.AvatarCur
                  }
                  alt="Ảnh đại diện"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-medium text-gray-800 mb-2">
                {data?.apply?.user?.fullName}
              </span>
              <p className="text-xs text-gray-500 line-clamp-1 mb-4">
                {data?.apply?.user?.title || "Chưa cung cấp"}
              </p>
              <h3 className="text-lg font-medium mb-2 text-gray-700">
                Ngành nghề{" "}
                <span className="text-primary">
                  {data?.apply.branch || "Chưa chọn"}
                </span>
              </h3>
              <div>
                {data?.apply.file ? (
                  <a
                    href={data?.apply.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Xem CV của bạn
                  </a>
                ) : (
                  <p className="text-sm text-gray-600">Chưa tải lên CV</p>
                )}
              </div>
            </div>

            {/* Information Section */}
            <div className="w-full sm:w-2/3">
              <h3 className="text-xl font-medium mb-2 text-gray-700">
                Thông tin đăng ký
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 mb-6">
                {[
                  {
                    label: "Họ và tên",
                    value: data?.apply.user?.fullName || "N/A",
                  },
                  {
                    label: "Website",
                    value: data?.apply.website || "Chưa cung cấp",
                  },
                  {
                    label: "Số điện thoại",
                    value: data?.apply.phone || "Chưa cung cấp",
                  },
                  {
                    label: "Facebook",
                    value: data?.apply.facebook || "Chưa cung cấp",
                  },
                  {
                    label: "TikTok",
                    value: data?.apply.tiktok || "Chưa cung cấp",
                  },
                  {
                    label: "YouTube",
                    value: data?.apply.youtube || "Chưa cung cấp",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col">
                    <strong className="text-sm font-medium text-gray-700">
                      {item.label}
                    </strong>
                    <span className="text-sm text-gray-600">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <strong className="text-sm font-medium text-gray-700">
                  Giới thiêu
                </strong>
                <p className="text-sm text-gray-600 text-justify">
                  {data?.apply.aboutMe}
                </p>
              </div>
            </div>
          </div>
          {data?.apply?.status === "Đã duyệt" ? (
            <div className="w-full sticky bottom-0 flex items-center justify-end gap-5 bg-white py-6">
              <button
                disabled
                onClick={() => handleChangeStatus("Đã duyệt")}
                className={styled.buttonPrimary}
              >
                Đã duyệt
              </button>
              <button
                onClick={() => {
                  setSelectIdApply(null);
                  setCheckView(false);
                }}
                className={styled.buttonTran}
              >
                Trở về
              </button>
            </div>
          ) : (
            <div className="w-full sticky bottom-0 flex items-center justify-end gap-5 bg-white py-6">
              <button
                onClick={() => handleChangeStatus("Bỏ qua")}
                className={styled.buttonPrimary10}
              >
                Bỏ qua
              </button>
              <button
                onClick={() => handleChangeStatus("Đã duyệt")}
                className={styled.buttonPrimary}
              >
                Duyệt
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-[300px] flex items-center justify-center">
          <p className="text-lg text-primary font-semibold">Không có dữ liẹu</p>
        </div>
      )}
    </>
  );
};
