import { lazy, Suspense } from "react";
import Services from "../components/home/Services";
import Intro from "../components/home/Intro";
import SEO from "../components/SEO";

// Lazy load non-critical components to improve LCP
const CompanyStrengths = lazy(
  () => import("../components/home/CompanyStrengths")
);
const Endorsements = lazy(() => import("../components/home/Endorsements"));
const OurClients = lazy(() => import("../components/home/OurClients"));
const ProjectsShow = lazy(() => import("../components/home/ProjectsShow"));

// Simple loading placeholder
const SectionSkeleton = () => (
  <div className="w-full py-24 bg-transparent">
    <div className="container mx-auto px-8 lg:px-16">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen">
      <SEO
        title="LTR Studio - Leading 3D Visualization & Architectural Design Studio"
        description="Transform your architectural vision with LTR Studio's professional 3D visualization services. Expert interior & exterior design rendering."
        keywords="ltr, LTR Studio, 3D visualization, architectural design, interior design, Vietnam architecture, rendering studio"
      />
      <Suspense fallback={<SectionSkeleton />}>
        <Intro />
      </Suspense>
      {/* Critical: Load immediately for LCP */}

      <Suspense fallback={<SectionSkeleton />}>
        <Services />
      </Suspense>
      {/* Non-critical: Lazy load after LCP */}
      <Suspense fallback={<SectionSkeleton />}>
        <CompanyStrengths />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <ProjectsShow />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <Endorsements />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <OurClients />
      </Suspense>
      {/* <TextParticles /> */}
    </div>
  );
}
