import React from "react";

const StateItemCourse = ({ stat, icon: Icon }) => {
  return (
    <div className={`p-4 rounded-lg shadow-section bg-white flex items-start gap-3`}>
      <div className={`${stat.color} w-12 h-12 flex items-center justify-center`}>
        <Icon className="w-6 h6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{stat.value}</h3>
        <p className="text-sm">{stat.title}</p>
      </div>
    </div>
  );
};

export default StateItemCourse;
