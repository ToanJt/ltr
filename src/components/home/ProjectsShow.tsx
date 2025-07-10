import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { convertToImageData } from "../../functions/functions";
import type { ImageData } from "../../functions/interface";
import { useNavigate } from "react-router-dom";
import { ColumnsPhotoAlbum } from "react-photo-album";
import { motion } from "framer-motion";
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

const ProjectsShow = () => {
  const [projects, setProjects] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const PROJECT_LIMIT = 21;

  const getProjectsDb = async () => {
    try {
      const projectsDb = await getDocs(collection(db, "projects"));
      const projectsData: ImageData[] = [];
      projectsDb.forEach((doc) => {
        if (projectsData.length < PROJECT_LIMIT) {
          const docData = convertToImageData(doc.data());
          projectsData.push(docData);
        }
      });
      await loadImageDimensions(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadImageDimensions = async (imageArray: ImageData[]) => {
    const updatedImages = await Promise.all(
      imageArray.slice(0, PROJECT_LIMIT).map((image) => {
        return new Promise<ImageData>((resolve) => {
          const img = new Image();
          img.src = image.largeURL;

          img.onload = () => {
            resolve({
              ...image,
              widthOrigin: img.width,
              heightOrigin: img.height,
            });
          };

          img.onerror = () => {
            resolve({
              ...image,
              widthOrigin: 800,
              heightOrigin: 600,
            });
          };
        });
      })
    );

    setProjects(updatedImages);
  };

  useEffect(() => {
    getProjectsDb();
  }, []);

  const photos = projects.map((item) => ({
    src: item.thumbnailURL,
    width: item.widthOrigin || 800,
    height: item.heightOrigin || 600,
    key: item.name,
    description: item.name || item.name,
    alt: item.description || item.name,
  }));

  const [index, setIndex] = useState(-1);

  const fadeInUp = {
    initial: { y: 30, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5 },
  };

  return (
    <section className="bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5"></div>
      <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-main-color/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-main-color/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto md:py-24 py-16 lg:px-16 px-8 relative">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="flex flex-col items-center lg:mb-16 mb-12"
        >
          <p className="uppercase sofia-pro text-15 text-gray-600 tracking-widest sm:mb-5 mb-2">
            Let the Magic Begin!
          </p>
          <h1 className="2xl:text-6xl md:text-5xl text-4xl text-center sofia-medium">
            Our Latest Creations
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center mt-12"
        >
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
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsShow;
