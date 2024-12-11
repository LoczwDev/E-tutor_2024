import React, { useEffect } from "react";
import { MainLayout } from "../../components/layouts/MainLayout";
import Hero from "../../components/Hero";
import SectionCategory from "../../containers/homePage/SectionCategory";
import SectionTopCourses from "../../containers/homePage/SectionTopCourses";
import SectionStepTutor from "../../containers/homePage/SectionStepTutor";
import SectionDisplayTutor from "../../containers/homePage/SectionDisplayTutor";
import { useGetLayout } from "../../hooks/useLayout";
import SectionTopPost from "../../containers/homePage/SectionTopPost";

export const HomePage = () => {
  const { data, isLoading } = useGetLayout("Banner");
  return (
    <MainLayout>
      {!isLoading && <Hero data={data?.layout?.banner} />}
      <SectionCategory />
      <SectionTopCourses />
      <SectionTopPost />
      <SectionStepTutor />
      <SectionDisplayTutor />
    </MainLayout>
  );
};
