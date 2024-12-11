import React from "react";

const ModalCustom = ({ children, isOpen, onclose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[800]">
      <div className="max-w-[100rem] relative bg-white shadow-tooltip max-h-[90vh] scrollbar-thin overflow-y-auto">
        {/* Close button */}
        <div className="sticky p-6 bg-white top-0 w-full flex items-center justify-between pb-3 border-b border-gray1">
          <h4 className="text-primary text-lg font-medium">{title}</h4>
          <button
            onClick={onclose}
            className="w-max text-end z-[100]"
          >
            <span className="block w-max hover:rotate-180 transform transition-all ease-in-out duration-500 text-primary hover:text-primary/50">
              ✕
            </span>
          </button>
        </div>
        <div className="w-max bg-white ">
        {children}

        </div>
        {/* Modal content */}
      </div>
    </div>
  );
};

export default ModalCustom;
