import { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { convertToImageData } from "../../functions/functions";
import type { ImageData } from "../../functions/interface";
import { useNavigate } from "react-router-dom";
import { ColumnsPhotoAlbum } from "react-photo-album";
import "react-photo-album/columns.css";
import "../../styles/projectsshow.css";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// import optional lightbox plugins
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import type { LoadableComponent } from "../../functions/interface";

interface PhotoType {
  src: string;
  width: number;
  height: number;
  key: string;
  title: string;
  description: string;
  alt: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
}

const ProjectsShow = ({ onLoad }: LoadableComponent) => {
  const [projects, setProjects] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const PROJECT_LIMIT = 21;

  // Intersection Observer to only load when section is near viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoad) {
            setShouldLoad(true);
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [shouldLoad]);

  // Load image dimensions
  const loadImageDimensions = async (
    imageData: ImageData
  ): Promise<ImageData> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageData.thumbnailURL;

      img.onload = () => {
        resolve({
          ...imageData,
          widthOrigin: img.width,
          heightOrigin: img.height,
        });
      };

      img.onerror = () => {
        // Use default dimensions if image fails to load
        resolve({
          ...imageData,
          widthOrigin: 800,
          heightOrigin: 600,
        });
      };
    });
  };

  useEffect(() => {
    // Only fetch data when shouldLoad is true
    if (!shouldLoad) return;
    const getProjectsDb = async () => {
      try {
        // Use Firestore limit() to fetch only needed documents
        const projectsQuery = query(
          collection(db, "projects"),
          limit(PROJECT_LIMIT)
        );
        const projectsDb = await getDocs(projectsQuery);
        const projectsData: ImageData[] = [];

        // Get all returned projects
        projectsDb.forEach((doc) => {
          const docData = convertToImageData(doc.data());
          projectsData.push({
            id: doc.id,
            ...docData,
          });
        });

        // Load dimensions for all images
        const projectsWithDimensions = await Promise.all(
          projectsData.map(loadImageDimensions)
        );

        setProjects(projectsWithDimensions);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setIsLoading(false);
      }
    };

    getProjectsDb();
  }, [shouldLoad]);

  // Call onLoad only when data is loaded
  useEffect(() => {
    if (!isLoading && onLoad) {
      onLoad();
    }
  }, [isLoading, onLoad]);

  // Preload first critical images only after they start loading
  useEffect(() => {
    if (shouldLoad && projects.length > 0) {
      const preloadCount = Math.min(6, projects.length);
      for (let i = 0; i < preloadCount; i++) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = projects[i].thumbnailURL || projects[i].largeURL;
        if (i === 0) {
          link.setAttribute("fetchpriority", "high");
        } else if (i < 3) {
          link.setAttribute("fetchpriority", "high");
        } else {
          link.setAttribute("fetchpriority", "low");
        }
        // Add imagesizes for responsive images
        link.setAttribute(
          "imagesizes",
          "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        );
        document.head.appendChild(link);
      }
    }
  }, [projects, shouldLoad]);

  // Apply image optimization attributes directly to img elements
  useEffect(() => {
    if (!isLoading && projects.length > 0) {
      const applyImageAttributes = () => {
        const images = document.querySelectorAll(
          ".react-photo-album--photo img"
        );
        images.forEach((img, index) => {
          const imgElement = img as HTMLImageElement;
          const project = projects[index];

          if (!project) return;

          // Apply loading attribute
          if (index < 6) {
            imgElement.loading = "eager";
            imgElement.setAttribute(
              "fetchpriority",
              index === 0 ? "high" : "high"
            );
          } else {
            imgElement.loading = "lazy";
            imgElement.setAttribute("fetchpriority", "low");
          }

          // Apply decoding attribute for better performance
          imgElement.decoding = "async";

          // Apply sizes attribute for responsive images
          imgElement.setAttribute(
            "sizes",
            "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          );

          // Set width and height to prevent layout shift
          if (project.widthOrigin && project.heightOrigin) {
            imgElement.width = project.widthOrigin;
            imgElement.height = project.heightOrigin;
            // Set aspect-ratio for modern browsers
            imgElement.style.aspectRatio = `${project.widthOrigin} / ${project.heightOrigin}`;
          }
        });
      };

      // Apply immediately and also after a short delay to catch dynamically loaded images
      applyImageAttributes();
      const timeoutId = setTimeout(applyImageAttributes, 100);
      const observer = new MutationObserver(() => {
        applyImageAttributes();
      });

      // Observe changes in the gallery container
      const galleryContainer = document.querySelector(".react-photo-album");
      if (galleryContainer) {
        observer.observe(galleryContainer, {
          childList: true,
          subtree: true,
        });
      }

      return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
      };
    }
  }, [isLoading, projects]);

  const photos: PhotoType[] = projects.map((item, index) => ({
    src: item.thumbnailURL || item.largeURL,
    width: item.widthOrigin || 800,
    height: item.heightOrigin || 600,
    key: item.id || item.name,
    title: item.name,
    description: item.name || item.name,
    alt: item.name || item.name,
    // Optimize loading: eager for first 6 images (above the fold), lazy for others
    loading: index < 6 ? ("eager" as const) : ("lazy" as const),
    // Set fetch priority: high for first 3, low for others to avoid blocking
    fetchPriority:
      index === 0
        ? ("high" as const)
        : index < 3
        ? ("high" as const)
        : ("low" as const),
    // Responsive image sizes for better performance
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  }));

  const [index, setIndex] = useState(-1);

  return (
    <section ref={sectionRef} className="bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5"></div>
      <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-main-color/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-main-color/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto md:py-24 py-16 lg:px-16 px-8 relative">
        <div className="flex flex-col items-center lg:mb-16 mb-12">
          <p className="uppercase sofia-pro text-15 text-gray-600 tracking-widest sm:mb-5 mb-2">
            Let the Magic Begin!
          </p>
          <h1 className="2xl:text-6xl md:text-5xl text-4xl text-center sofia-medium">
            Our Latest Creations
          </h1>
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="relative">
              <ColumnsPhotoAlbum
                photos={photos}
                columns={(containerWidth) => {
                  if (containerWidth < 640) return 1;
                  if (containerWidth < 1024) return 2;
                  return 3;
                }}
                onClick={({ index }) => setIndex(index)}
                spacing={20}
              />
              <Lightbox
                slides={photos}
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                plugins={[
                  Fullscreen,
                  Slideshow,
                  Download,
                  Captions,
                  Zoom,
                  Counter,
                  Thumbnails,
                ]}
                carousel={{
                  spacing: 20,
                  padding: 20,
                }}
              />
            </div>
          )}
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate("/projects")}
            className="group relative overflow-hidden rounded-xl 
                     bg-gradient-to-r from-[#f3f4f6] to-white
                     shadow-[0_2px_8px_rgba(0,0,0,0.08)]
                     border border-gray-100 px-8 py-3
                     hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]
                     hover:border-main-color/30
                     transition-all duration-500 ease-out"
          >
            <div className="relative flex items-center gap-3 cursor-pointer">
              <span
                className="text-15 font-medium text-gray-800 
                           group-hover:text-main-color transition-colors duration-500"
              >
                Explore All Projects
              </span>
              <svg
                className="w-5 h-5 text-gray-800 transition-all duration-500 
                         group-hover:text-main-color group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>

              {/* Glass reflection effect */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-xl">
                <div
                  className="absolute top-0 left-[-100%] w-full h-full 
                             bg-gradient-to-r from-transparent via-white to-transparent 
                             opacity-50 group-hover:animate-shine"
                />
              </div>

              {/* Bottom light effect */}
              <div
                className="absolute bottom-0 left-0 w-full h-[1px] 
                           bg-gradient-to-r from-transparent via-main-color/30 to-transparent 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsShow;
