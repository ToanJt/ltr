import CompanyStrengths from "../components/home/CompanyStrengths";
import Endorsements from "../components/home/Endorsements";
import Intro from "../components/home/Intro";
import Services from "../components/home/Services";
import OurClients from "../components/home/OurClients";
import ProjectsShow from "../components/home/ProjectsShow";
import SEO from "../components/SEO";
import { useEffect } from "react";
import { onTop } from "../functions/functions";

export default function Home() {
  useEffect(() => {
    onTop("instant");
  }, []);

  return (
    <div>
      <SEO
        title="LTR Studio - Leading 3D Visualization & Architectural Design Studio"
        description="Transform your architectural vision with LTR Studio's professional 3D visualization services. Expert interior & exterior design rendering."
        keywords="ltr, LTR Studio, 3D visualization, architectural design, interior design, Vietnam architecture, rendering studio"
      />
      <Intro></Intro>
      <Services></Services>
      <CompanyStrengths></CompanyStrengths>
      <ProjectsShow></ProjectsShow>
      <Endorsements></Endorsements>
      <OurClients></OurClients>
    </div>
  );
}
