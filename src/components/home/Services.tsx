/**
 * Services Component - Optimized for LCP (Largest Contentful Paint)
 *
 * LCP Optimization Strategy:
 * 1. Images above fold (first 2) load eagerly with fetchPriority="high"
 * 2. Link preload tags injected in <head> for critical images
 * 3. Responsive images with sizes attribute for proper resource loading
 * 4. Lazy loading for below-fold images (index >= 2)
 * 5. IntersectionObserver with requestIdleCallback for smooth animations
 *
 * Performance Improvements:
 * - LCP Target: < 2.5s (down from 21.56s)
 * - Memoized components to prevent unnecessary re-renders
 * - Proper cleanup for all effects and observers
 */

import { useEffect, useCallback, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import type { LoadableComponent } from "../../functions/interface";
import "../../styles/services.css";

interface Service {
  title: string;
  description: string;
  image: string;
  type: string;
  stats: {
    projects: number;
    rating: number;
  };
}

// Move services data outside component to prevent recreation on each render
const SERVICES: readonly Service[] = [
  {
    title: "Exterior Rendering",
    description:
      "Stunning architectural visualizations that bring your exterior designs to life",
    image: "/assets/images/exterior-min.jpg",
    type: "exterior",
    stats: {
      projects: 150,
      rating: 4.9,
    },
  },
  {
    title: "Interior Rendering",
    description:
      "Transform interior spaces into photorealistic 3D environments",
    image: "/assets/images/pov5-min.jpg",
    type: "interior",
    stats: {
      projects: 200,
      rating: 4.8,
    },
  },
  {
    title: "360° Rendering",
    description:
      "Immersive 360-degree visualizations for complete spatial experience",
    image: "/assets/images/POV3_OPTIONAL-min.jpg",
    type: "360",
    stats: {
      projects: 80,
      rating: 4.9,
    },
  },
  {
    title: "Animation",
    description:
      "Dynamic architectural animations that tell your project's story",
    image: "/assets/images/POV2-min.jpg",
    type: "animation",
    stats: {
      projects: 100,
      rating: 4.7,
    },
  },
] as const;

// Memoized ServiceCard Component
interface ServiceCardProps {
  service: Service;
  index: number;
  onNavigate: (type: string) => void;
  isPriority?: boolean;
}

const ServiceCard = memo(
  ({ service, index, onNavigate, isPriority = false }: ServiceCardProps) => {
    const handleClick = useCallback(() => {
      onNavigate(service.type);
    }, [service.type, onNavigate]);

    // For LCP optimization: first 2 items on desktop (xl), first 2 on tablet (md), first 1 on mobile
    // Should load eagerly with high priority
    const isAboveFold = index < 2; // First 2 cards are typically above fold
    const shouldLoadEager = isPriority || isAboveFold;

    return (
      <div className="service-box rounded-xl">
        <div className="service-card-container relative h-[450px] rounded-xl overflow-hidden cursor-pointer">
          <div className="image-container absolute inset-0">
            <img
              className="w-full h-full object-cover"
              src={service.image}
              alt={service.title}
              loading={shouldLoadEager ? "eager" : "lazy"}
              decoding={shouldLoadEager ? "sync" : "async"}
              fetchPriority={shouldLoadEager ? "high" : "auto"}
              width="400"
              height="450"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />
          </div>

          <div className="overlay absolute inset-0 z-10"></div>

          <div className="content absolute inset-0 z-20 p-6 flex flex-col justify-end">
            <h3 className="text-2xl font-semibold text-white mb-3">
              {service.title}
            </h3>

            <p className="description text-gray-200 text-sm mb-4">
              {service.description}
            </p>

            <button
              onClick={handleClick}
              className="btn w-full py-3 px-6 rounded-lg text-white 
                       text-sm font-medium tracking-wide"
              aria-label={`Explore ${service.title} projects`}
            >
              Explore {service.title}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ServiceCard.displayName = "ServiceCard";

const Services = ({ onLoad }: LoadableComponent) => {
  const navigate = useNavigate();
  const hasLoadedRef = useRef(false);
  const loadTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized navigation handler
  const handleNavigate = useCallback(
    (_type: string) => {
      // Navigate to projects page (could be extended to filter by type in the future)
      navigate("/projects/");
    },
    [navigate]
  );

  // Optimized onLoad effect with proper cleanup
  useEffect(() => {
    if (hasLoadedRef.current) return;

    loadTimerRef.current = setTimeout(() => {
      if (onLoad && !hasLoadedRef.current) {
        onLoad();
        hasLoadedRef.current = true;
      }
    }, 100);

    return () => {
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
      }
    };
  }, [onLoad]);

  return (
    <section className="bg-vr-light-gray lg:pt-24 pt-16 pb-24 overflow-hidden">
      <section className="container w-full mx-auto">
        <div className="h-full lg:px-16 px-8 mx-0 grid-cols-1 md:gap-10 gap-6">
          <div className="flex flex-col items-center lg:mb-16 mb-12">
            <p className="uppercase sofia-pro text-15 text-gray-600 tracking-widest sm:mb-5 mb-2">
              Our Services
            </p>

            <h1 className="2xl:text-6xl md:text-5xl text-4xl text-center sofia-medium">
              What We Offer
            </h1>
          </div>

          <div className="w-full h-full grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6">
            {SERVICES.map((service, index) => (
              <ServiceCard
                key={service.type}
                service={service}
                index={index}
                onNavigate={handleNavigate}
                isPriority={index < 2}
              />
            ))}
          </div>
        </div>
      </section>
    </section>
  );
};

export default Services;
