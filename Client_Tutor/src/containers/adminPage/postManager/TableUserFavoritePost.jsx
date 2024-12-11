import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useGetAllUser } from "../../../hooks/useUser";
import images from "../../../constants/images/images";
import { Rate } from "antd";

const TableUserFavoritePost = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dataUsers, setDataUsers] = useState([]);

  useEffect(() => {
    if (data) {
      setDataUsers(data?.usersWhoLikedPost);
    }
  }, [data]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setDataUsers(data?.usersWhoLikedPost);
    } else {
      const filtered = data?.usersWhoLikedPost?.filter(
        (user) =>
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );

      setDataUsers(filtered);
    }
  };

  return (
    <motion.div
      className="bg-white bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray9">
          Danh sách tài khoản đã thích
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="bg-gray1 text-gray9 placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray9 uppercase tracking-wider">
                Hành dộng
              </th>
            </tr>
          </thead>
          {dataUsers?.length > 0 ? (
            <tbody className="divide-y divide-gray-700">
              {dataUsers.map((user) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray5 flex gap-2 items-center">
                    <img
                      src={user.avatar ? user.avatar.url : images.AvatarCur}
                      alt="avatar user"
                      className="size-10 rounded-full"
                    />
                    {user.fullName}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray5">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-base leading-7 font-semibold rounded-full ${
                        user?.role === "user"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {user?.role === "user" ? "Học viên" : "Giáo viên"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user?.status === "Active"
                          ? "bg-green-800 text-green-100"
                          : "bg-red-800 text-red-100"
                      }`}
                    >
                      {user.status ? "StatusDemo" : "Chuasetup"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray5">
                    <button className="text-indigo-400 hover:text-indigo-300 mr-2">
                      Edit
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          ) : (
            <td colSpan={5} className="text-center py-6">
              <p className="text-error text-lg font-medium">
                Chưa có lượt thích nào
              </p>
            </td>
          )}
        </table>
      </div>
    </motion.div>
  );
};
export default TableUserFavoritePost;
