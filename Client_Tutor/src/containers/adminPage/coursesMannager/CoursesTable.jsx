import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../../hooks/formatCurrency";
import { useGetAllCourseByTutor } from "../../../hooks/useCourses";
import { toast } from "sonner";
import useUser from "../../../hooks/useUser";
import images from "../../../constants/images/images";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Toolbar,
  TextField,
  Button,
  Checkbox,
  Paper,
  IconButton,
  TablePagination,
} from "@mui/material";
import { Edit, Search, Trash2 } from "lucide-react";
import Loading from "../../../components/loader/Loading";
import styled from "../../../constants/styles/styles";
import { useMutation } from "@tanstack/react-query";
import { changeStatusByCourses, changeStatusCourse } from "../../../services/coursesService";
import { BiPaperPlane } from "react-icons/bi";

const CoursesTable = ({ checkCreateCourses, setCheckCreateCourses }) => {
  const user = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, refetch } = useGetAllCourseByTutor();

  const [dataCourses, setDataCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    if (data && !isLoading) {
      setDataCourses(data?.courses);
    }
  }, [data, isLoading]);
  //   console.log(isLoading);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ courseIds, status }) => {
      return changeStatusByCourses({
        courseIds,
        status,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Đã cập nhật thành công");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error);
    },
  });

  const { mutate: mutateChangeStatus, isPending: isPendingChangeStatus } =
    useMutation({
      mutationFn: ({ courseId, status }) => {
        return changeStatusCourse({
          courseId,
          status,
        });
      },
      onSuccess: (data) => {
        toast.success(data.message || "Đã cập nhật thành công");
        refetch();
      },
      onError: (error) => {
        toast.error(error.message);
        console.log(error);
      },
    });

  //   useEffect(() => {
  //     if (sortColumn && dataCourses.length > 0) {
  //       const sortedData = [...dataCourses].sort((a, b) => {
  //         const valueA =
  //           a[sortColumn] !== undefined && a[sortColumn] !== null
  //             ? a[sortColumn]
  //             : "";
  //         const valueB =
  //           b[sortColumn] !== undefined && b[sortColumn] !== null
  //             ? b[sortColumn]
  //             : "";

  //         if (typeof valueA === "string" && typeof valueB === "string") {
  //           return sortDirection === "asc"
  //             ? valueA.toLowerCase().localeCompare(valueB.toLowerCase())
  //             : valueB.toLowerCase().localeCompare(valueA.toLowerCase());
  //         }

  //         return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
  //       });
  //       setDataCourses(sortedData);
  //     }
  //   }, [sortColumn, sortDirection, dataCourses]);

  const sortedData = useMemo(() => {
    if (sortColumn && dataCourses.length > 0) {
      return [...dataCourses].sort((a, b) => {
        const valueA = a[sortColumn] ?? "";
        const valueB = b[sortColumn] ?? "";

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortDirection === "asc"
            ? valueA.toLowerCase().localeCompare(valueB.toLowerCase())
            : valueB.toLowerCase().localeCompare(valueA.toLowerCase());
        }

        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      });
    }
    return dataCourses;
  }, [sortColumn, sortDirection, dataCourses]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = data?.courses?.filter(
      (course) =>
        course.name.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term)
    );
    setDataCourses(filtered);
    setPage(0); // Reset to the first page when searching
  };

  const handleSort = (property) => {
    const isAsc = sortColumn === property && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(property);
  };

  const handleCreateCourse = () => {
    if (user && user?.listBlock?.courseblock) {
      toast.error("Bạn đang bị cấm tạo khóa học mới");
    } else {
      setCheckCreateCourses(!checkCreateCourses);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedCourses(dataCourses.map((course) => course._id));
    } else {
      setSelectedCourses([]);
    }
  };

  const handleSelectCourse = (courseId) => {
    setSelectedCourses((prevSelected) => {
      if (prevSelected.includes(courseId)) {
        return prevSelected.filter((id) => id !== courseId);
      } else {
        return [...prevSelected, courseId];
      }
    });
  };

  const handleDeleteSelected = (status) => {
    // Add logic to delete selected courses
    mutate({ courseIds: selectedCourses, status: status });
    refetch();
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginate the dataCourses
  const paginatedCourses = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangeStatus = (id, status) => {
    mutateChangeStatus({ courseId: id, status });
  };

  return (
    <div className="bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl py-6 border border-gray1 mb-8">
      <div className="w-full px-6">
        <h2 className="text-xl font-semibold text-gray9">Danh sách khóa học</h2>
      </div>

      <Toolbar>
        <div className="w-full flex items-center justify-between gap-5">
          <button
            onClick={() => handleDeleteSelected("Hoạt động")}
            disabled={selectedCourses.length === 0}
            className="btn btn-outline btn-success !rounded-lg"
          >
            Gửi kiểm duyệt
            <BiPaperPlane size={18} />
          </button>

          <button
            // onClick={handleDeleteSelected}
            disabled={selectedCourses.length === 0}
            onClick={() => handleDeleteSelected("Đã xóa")}
            className="btn btn-outline btn-error !rounded-lg"
          >
            Xóa
            <Trash2 size={18} />
          </button>
          <div className="w-full flex items-center justify-end">
            <TextField
              type="text"
              placeholder="Tìm khóa học..."
              variant="standard"
              color="warning"
              size="small"
              onChange={handleSearch}
              value={searchTerm}
              style={{ marginRight: "1rem" }}
            />
            <button
              onClick={handleCreateCourse}
              className={`${styled.buttonPrimary10} !rounded-xl`}
            >
              Thêm khóa học
            </button>
          </div>
        </div>
      </Toolbar>
      {isLoading ? (
        <div
          className="flex items-center justify-center"
          style={{ height: "80vh" }}
        >
          <Loading />
        </div>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      sx={{
                        color: "#FF6636",
                        "&.Mui-checked": {
                          color: "#FF6636",
                        },
                      }}
                      onChange={handleSelectAll}
                      checked={selectedCourses.length === dataCourses.length}
                    />
                  </TableCell>
                  {[
                    { label: "Tên", column: "name" },
                    { label: "Giáo viên", column: "tutor.fullName" },
                    { label: "Giá", column: "estimatedPrice" },
                    { label: "Phần trăm", column: "percent" },
                    { label: "Lượt mua", column: "purchased" },
                    { label: "Trạng thái", column: "status" },
                    { label: "Hành động", column: "" },
                  ].map(({ label, column }) => (
                    <TableCell
                      key={column}
                      align="left"
                      className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider text-nowrap"
                    >
                      {column ? (
                        <TableSortLabel
                          active={sortColumn === column}
                          direction={
                            sortColumn === column ? sortDirection : "asc"
                          }
                          onClick={() => handleSort(column)}
                        >
                          {label}
                        </TableSortLabel>
                      ) : (
                        label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCourses.map((course) => (
                  <TableRow key={course._id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCourses.includes(course._id)}
                        onChange={() => handleSelectCourse(course._id)}
                        sx={{
                          color: "#FF6636",
                          "&.Mui-checked": {
                            color: "#FF6636",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="left">
                      <div className="text-sm font-medium text-gray5 flex gap-2 items-center">
                        <img
                          src={
                            course.thumbnail
                              ? course.thumbnail.url
                              : images.CardCourse
                          }
                          alt="course img"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                          }}
                        />
                        <Link
                          to={`/admin/manager-courses/view/${course?._id}`}
                          className="line-clamp-1"
                        >
                          {course.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell align="left">{course.tutor?.fullName}</TableCell>
                    <TableCell align="left" style={{ fontWeight: "bold" }}>
                      <span className="text-primary font-bold">
                        {course.estimatedPrice
                          ? formatCurrency(course.estimatedPrice)
                          : "Chưa có"}
                      </span>
                    </TableCell>
                    <TableCell align="left">
                      {" "}
                      <div className="text-sm font-semibold text-success">
                        {`${course.percent}%`}
                      </div>
                    </TableCell>
                    <TableCell align="left">{course.purchased}</TableCell>
                    <TableCell align="left">
                      <span
                        style={{
                          color:
                            course?.status === "Hoạt động"
                              ? "#FF5733"
                              : "#1E90FF",
                        }}
                      >
                        {course?.status}
                      </span>
                    </TableCell>
                    <TableCell align="left" className="flex items-center">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/manager-course/edit/${course._id}`}
                          className="inline-block text-indigo-400 hover:text-indigo-300 mr-3"
                        >
                          <Edit size={18} />
                        </Link>
                        <IconButton
                          color="secondary"
                          onClick={() =>
                            handleChangeStatus(course._id, "Đã xóa")
                          }
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={dataCourses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} của ${count}`
            }
          />
        </>
      )}
    </div>
  );
};

export default CoursesTable;
