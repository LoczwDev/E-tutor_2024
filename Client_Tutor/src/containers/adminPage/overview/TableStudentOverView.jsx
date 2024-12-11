import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Paper,
  TextField,
} from "@mui/material";
import { Search } from "lucide-react";
import Loading from "../../../components/loader/Loading";
import ModalCustom from "../../../components/modal/ModalCustom";
import useUser, { useGetStuddentByTutor } from "../../../hooks/useUser";
import { useChatClient } from "../../../hooks/useChatClient2";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TableStudentOverView = () => {
  const user = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useGetStuddentByTutor();
  const [dataUsers, setDataUsers] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("fullName");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [checkView, setCheckView] = useState(false);
  const [activeUserId, setActiveUserId] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (data && !isLoading) {
      setDataUsers(data?.students);
    }
  }, [data, isLoading]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setDataUsers(data?.students);
    } else {
      const filtered = data?.students?.filter(
        (user) =>
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );

      setDataUsers(filtered);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    const sortedData = [...dataUsers].sort((a, b) => {
      if (a[property] < b[property]) {
        return isAsc ? -1 : 1;
      }
      if (a[property] > b[property]) {
        return isAsc ? 1 : -1;
      }
      return 0;
    });
    setDataUsers(sortedData);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleFormVisibility = (userId) => {
    setActiveUserId(userId);
    setCheckView(!checkView);
  };
  const { chatClient, isLoading: clientLoading } = useChatClient();

  // Hàm tạo cuộc trò chuyện mới
  const createNewChat = async (studentId) => {
    if (!user || !user._id) {
      toast.error("Vui lòng đăng nhập để sử dụng chức năng này.");
      return;
    }

    if (!studentId) {
      toast.error("Dữ liệu học sinh không hợp lệ.");
      return;
    }

    if (clientLoading) {
      console.log("Client is loading, please wait...");
      return;
    }

    if (!chatClient) {
      console.error("Stream client is not available.");
      return;
    }

    try {
      const channel = chatClient.channel("messaging", {
        members: [user._id, studentId],
      });

      await channel.create();
      navigate("/messenger", { state: { channelId: channel.id } });
    } catch (error) {
      console.error("Lỗi khi tạo cuộc trò chuyện: ", error);
      toast.error("Failed to create chat.");
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="relative w-full h-[80vh] flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <div className="bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray9">
              Danh sách học sinh
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm học sinh..."
                className="bg-gray1 text-gray9 placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "fullName"}
                      direction={order}
                      onClick={() => handleSort("fullName")}
                    >
                      Tên
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "email"}
                      direction={order}
                      onClick={() => handleSort("email")}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <td className="flex gap-2 items-center">
                          <img
                            src={
                              user.avatar ? user.avatar.url : images.AvatarCur
                            }
                            alt="avatar user"
                            className="w-10 h-10 rounded-full border border-gray-300"
                          />
                          {user.fullName}
                        </td>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => createNewChat(user?._id)}
                          className="text-secondary"
                        >
                          Tin nhắn
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
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
        </div>
      )}

      {/* <ModalCustom
        isOpen={checkView}
        onClose={() => setCheckView(!checkView)}
        title="Thông tin quyền của tài khoản"
      >
 
      </ModalCustom> */}
    </>
  );
};

export default TableStudentOverView;

// const FormListBlock = ({
//   activeUserId,
//   setActiveUserId,
//   setCheckView,
//   refetchTable,
// }) => {
//   const { data, isLoading, refetch } = useGetProfileUserByAdmin(activeUserId);
//   useEffect(() => {
//     refetch();
//   }, [activeUserId]);

//   const [permissions, setPermissions] = useState({
//     commentblock: false,
//     postblock: false,
//     courseblock: false,
//     loginblock: false,
//   });
//   const [percentage, setPercentage] = useState("");
//   const { mutate, isPending } = useMutation({
//     mutationFn: ({ userId, updateData }) => {
//       return updateListBlock({
//         userId,
//         updateData,
//       });
//     },
//     onSuccess: (data) => {
//       toast.success(data.message || "Cập nhật quyền thành công");
//       // setActiveUserId(null);
//       setCheckView(false);
//       refetchTable();
//     },
//     onError: (error) => {
//       toast.error(error.message);
//       console.log(error);
//     },
//   });

//   useEffect(() => {
//     if (data?.user) {
//       // Set initial permission states based on the current data
//       setPermissions({
//         commentblock: data.user?.listBlock?.commentblock || false,
//         postblock: data.user?.listBlock?.postblock || false,
//         courseblock: data.user?.listBlock?.courseblock || false,
//         loginblock: data.user?.listBlock?.loginblock || false,
//       });
//       setPercentage(data.user.percent || 60);
//     }
//   }, [data]);

//   const handlePermissionChange = (e) => {
//     const { name, checked } = e.target;
//     setPermissions((prev) => ({
//       ...prev,
//       [name]: checked,
//     }));
//   };

//   const handlePercentageChange = (e) => {
//     setPercentage(e.target.value);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     updatePermissions({
//       permissions,
//       percentage,
//     });
//   };

//   const updatePermissions = async (updateData) => {
//     mutate({ userId: activeUserId, updateData });
//   };

//   if (isLoading)
//     return (
//       <div className="relative w-full h-[50vh] flex items-center justify-center">
//         <Loading />
//       </div>
//     );

//   return (
//     <>
//       {isPending && <Loader />}
//       {activeUserId ? (
//         <div className="w-full min-w-[700px] bg-white p-6 shadow-lg rounded-lg">
//           <div className="flex flex-col sm:flex-row justify-between gap-5 mb-6">
//             {/* Avatar and Industry Section */}
//             <div className="sticky top-0 flex flex-col items-center w-full sm:w-1/3 border border-gray-200 p-4 rounded-lg mb-6 sm:mb-0">
//               <div className="w-32 h-32 mb-4 overflow-hidden rounded-full">
//                 <img
//                   src={
//                     data?.user?.avatar ? data.user.avatar.url : images.AvatarCur
//                   }
//                   alt="Ảnh đại diện"
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//               <span className="text-lg font-medium text-gray-800 mb-2">
//                 {data?.user?.fullName}
//               </span>
//               <p className="text-xs text-gray-500 line-clamp-1 mb-4">
//                 {data?.user?.title || "Chưa cung cấp"}
//               </p>
//               <h3 className="text-lg font-medium mb-2 text-gray-700">
//                 Ngành nghề
//                 <p className="text-primary text-center">
//                   {data?.user.branch || "Học viên"}
//                 </p>
//               </h3>
//             </div>

//             {/* Information Section */}
//             <div className="w-full sm:w-2/3">
//               <form onSubmit={handleSubmit}>
//                 <fieldset className="mb-4">
//                   <label className="mb-2 flex items-center gap-3">
//                     <input
//                       type="checkbox"
//                       name="commentblock"
//                       checked={permissions.commentblock}
//                       onChange={handlePermissionChange}
//                       className="checkbox checkbox-error"
//                     />
//                     Cấm bình luận
//                   </label>
//                   <label className="mb-2 flex items-center gap-3">
//                     <input
//                       type="checkbox"
//                       name="postblock"
//                       checked={permissions.postblock}
//                       onChange={handlePermissionChange}
//                       className="checkbox checkbox-error"
//                     />
//                     Cấm đăng bài
//                   </label>
//                   <label className="mb-2 flex items-center gap-3">
//                     <input
//                       type="checkbox"
//                       name="courseblock"
//                       checked={permissions.courseblock}
//                       onChange={handlePermissionChange}
//                       className="checkbox checkbox-error"
//                     />
//                     Cấm đăng khóa học
//                   </label>
//                   <label className="mb-2 flex items-center gap-3">
//                     <input
//                       type="checkbox"
//                       name="loginblock"
//                       checked={permissions.loginblock}
//                       onChange={handlePermissionChange}
//                       className="checkbox checkbox-error"
//                     />
//                     Cấm đăng nhập
//                   </label>
//                 </fieldset>
//                 <div className="mb-4">
//                   <label
//                     htmlFor="percentage"
//                     className="block text-gray-700 font-medium mb-1"
//                   >
//                     % doanh thu:
//                   </label>
//                   <input
//                     type="number"
//                     id="percentage"
//                     name="percentage"
//                     max={90}
//                     min={60}
//                     value={percentage}
//                     onChange={handlePercentageChange}
//                     placeholder="Nhập %"
//                     className={styled.input}
//                   />
//                 </div>
//                 <div className="w-full flex items-center justify-between">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       // setActiveUserId(null);
//                       setCheckView(false);
//                     }}
//                     className={styled.buttonPrimary10}
//                   >
//                     Trở lại
//                   </button>
//                   <button type="submit" className={styled.buttonPrimary}>
//                     Xác nhận
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="w-full h-[300px] flex items-center justify-center">
//           <p className="text-lg text-primary font-semibold">Không có dữ liệu</p>
//         </div>
//       )}
//     </>
//   );
// };
