import React from "react";
import { NavItem } from "./NavItem";
import CurrencyLanguageSelector from "./CurrencyLanguageSelector";
import useUser from "../hooks/useUser";

const Navbar = () => {
  const user = useUser();
  const navInfoItem = [
    {
      link: "/",
      name: "Trang chủ",
    },
    {
      link: "/list-courses",
      name: "Khóa học",
    },
    {
      link: "/list-posts",
      name: "Cộng đồng",
    },
  ];

  const handleAuth = (active) => {
    if (active === "becometutor") {
      document.getElementById("becometutor").classList.add("modal-open");
    }
  };
  return (
    <div className="w-full flex items-center justify-between text-sm font-medium bg-gray9 px-10 h-[52px]">
      <ul className="flex items-center justify-center gap-5 h-full pl-0">
        {navInfoItem?.map((item, index) => (
          <NavItem item={item} key={index} />
        ))}
        {!user || user?.role === "user" ? (
          <li className="group flex items-center justify-center m-3 lg:m-0 relative h-full">
            <button
              onClick={() => handleAuth("becometutor")}
              className="h-full flex items-center justify-center relative p-2 before:absolute before:h-[3px] before:rounded-full before:transition-all before:duration-500 before:bg-primary before:top-0 before:w-0 group-hover:before:w-full text-gray5"
            >
              Đăng ký giáo viên
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
};

export default Navbar;
