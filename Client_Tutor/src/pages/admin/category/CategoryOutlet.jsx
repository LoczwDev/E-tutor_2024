import React, { useEffect, useState } from "react";
import CategoryTable from "../../../containers/adminPage/categories/CategoryContainer";
import SalesByCategoryChart from "../../../containers/adminPage/salesManager/SalesByCategoryChart";
import { usegetOverviewAnalytics } from "../../../hooks/useAnalytics";
import Loading from "../../../components/loader/Loading";
import CategoryDistributionChart from "../../../containers/adminPage/overview/CategoryDistributionChart";

const CategoryOutlet = () => {
  const { data, isLoading } = usegetOverviewAnalytics();
  const [dataOverview, setDataOverview] = useState(null);

  // Cập nhật khi data sẵn sàng
  useEffect(() => {
    if (data && !isLoading) {
      setDataOverview(data?.data);
    }
  }, [data, isLoading]);
  return (
    <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
      {isLoading ? (
        <div className="relative w-full h-[80vh] flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <CategoryDistributionChart data={dataOverview} />
            <SalesByCategoryChart />
          </div>
          <CategoryTable />
        </>
      )}
    </main>
  );
};

export default CategoryOutlet;
