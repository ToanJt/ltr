import CompanyStrengths from "../components/home/CompanyStrengths";
import Endorsements from "../components/home/Endorsements";
import Intro from "../components/home/Intro";
import Services from "../components/home/Services";
import OurClients from "../components/home/OurClients";
import ProjectsShow from "../components/home/ProjectsShow";
import SEO from "../components/SEO";
import Preloader from "../components/Preloader";
import { useEffect, useRef, useState } from "react";
import { onTop } from "../functions/functions";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const loadedComponentsRef = useRef(new Set<string>());
  const totalComponents = 6; // Total number of main components to load

  const handleComponentLoad = (componentName: string) => {
    if (!loadedComponentsRef.current.has(componentName)) {
      loadedComponentsRef.current.add(componentName);

      if (
        loadedComponentsRef.current.size === totalComponents &&
        preloaderComplete
      ) {
        setTimeout(() => setIsLoading(false), 100); // Giảm delay xuống
      }
    }
  };

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true);
    if (loadedComponentsRef.current.size === totalComponents) {
      setTimeout(() => setIsLoading(false), 100); // Giảm delay xuống
    }
  };

  useEffect(() => {
    onTop("instant");
    // Không set overflow ở đây nữa vì đã được xử lý trong Preloader
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className={`min-h-screen ${isLoading ? "overflow-hidden" : ""}`}>
      <Preloader
        isLoading={isLoading}
        onLoadingComplete={handlePreloaderComplete}
      />
      <div
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <SEO
          title="LTR Studio - Leading 3D Visualization & Architectural Design Studio"
          description="Transform your architectural vision with LTR Studio's professional 3D visualization services. Expert interior & exterior design rendering."
          keywords="ltr, LTR Studio, 3D visualization, architectural design, interior design, Vietnam architecture, rendering studio"
        />
        <Intro onLoad={() => handleComponentLoad("intro")} />
        <Services onLoad={() => handleComponentLoad("services")} />
        <CompanyStrengths onLoad={() => handleComponentLoad("strengths")} />
        <ProjectsShow onLoad={() => handleComponentLoad("projects")} />
        <Endorsements onLoad={() => handleComponentLoad("endorsements")} />
        <OurClients onLoad={() => handleComponentLoad("clients")} />
      </div>
    </div>
  );
}
