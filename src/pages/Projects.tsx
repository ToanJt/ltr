import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import slugify from "slugify";
import { onTop, convertToImageData } from "../functions/functions";
import type { ImageData } from "../functions/interface";
import { db } from "../config/firebaseConfig";
import { getDocs, collection, doc, setDoc } from "firebase/firestore";

import "../styles/gallery.css";

const BATCH_SIZE = 12; // Number of images to load per batch

interface PhotoType {
  src: string;
  width: number;
  height: number;
  key: string;
  title: string;
  description: string;
  alt: string;
}

interface ContainerProps {
  photo: PhotoType;
  containerRef: React.RefObject<HTMLDivElement>;
  containerStyle: React.CSSProperties;
  imageProps: React.ImgHTMLAttributes<HTMLImageElement>;
}

const Projects = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState<ImageData[]>([]);
  const [displayedProjects, setDisplayedProjects] = useState<ImageData[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ImageData[]>([]);
  const [isActive, setIsActive] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [currentOption, setCurrentOption] = useState<number>(0);
  const [projectType, setProjectType] = useState<string>("all");
  const [email, setEmail] = useState<string>("");
  const [isValidEmail, setIsValidEmail] = useState<boolean>(true);
  const [isSentSuccessfully, setIsSentSuccessfully] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = email ? validateEmail(email) : false;
    setIsValidEmail(valid);
    if (!valid) return;

    const customerEmail = {
      email: email.trim(),
      isRead: false,
      createAt: new Date(),
    };

    try {
      setIsSentSuccessfully(true);
      const customerDoc = doc(collection(db, "customers"));
      await setDoc(customerDoc, customerEmail);
    } catch (error) {
      console.log("Failed send Email!! " + error);
    }
  };

  const getProjectsDb = async () => {
    try {
      setLoading(true);
      const projectsDb = await getDocs(collection(db, "projects"));

      const projectsData: ImageData[] = [];
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

      setAllProjects(projectsWithDimensions);
      filterProjects(projectsWithDimensions, currentOption, projectType);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = useCallback(
    (projects: ImageData[], option: number, type: string) => {
      setFilterLoading(true);

      let filtered = [...projects];

      if (option === 0) {
        // Do nothing, show all projects
      } else if (option === 4) {
        filtered = filtered.filter((item) => item.is360 === true);
      } else if (option === 5) {
        filtered = filtered.filter((item) => item.isAnimation === true);
      } else if (option >= 1 && option < 4) {
        filtered = filtered.filter((item) => item.type === type);
      }

      setFilteredProjects(filtered);
      setDisplayedProjects(filtered.slice(0, BATCH_SIZE));
      setCurrentPage(1);
      setFilterLoading(false);
    },
    []
  );

  const loadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    const start = (nextPage - 1) * BATCH_SIZE;
    const end = start + BATCH_SIZE;

    setDisplayedProjects((prev) => [
      ...prev,
      ...filteredProjects.slice(start, end),
    ]);
    setCurrentPage(nextPage);
  }, [currentPage, filteredProjects]);

  useEffect(() => {
    filterProjects(allProjects, currentOption, projectType);
  }, [currentOption, projectType, filterProjects, allProjects]);

  useEffect(() => {
    const initializeProjects = async () => {
      if (type) {
        setProjectType(String(type));
      }
      const newIsActive = [false, false, false, false, false, false];
      let newCurrentOption = 0;

      if (type === "exterior") {
        newIsActive[2] = true;
        newCurrentOption = 2;
      } else if (type === "interior") {
        newIsActive[3] = true;
        newCurrentOption = 3;
      } else if (type === "360") {
        newIsActive[4] = true;
        newCurrentOption = 4;
      } else if (type === "animation") {
        newIsActive[5] = true;
        newCurrentOption = 5;
      } else {
        newIsActive[0] = true;
        newCurrentOption = 0;
      }

      setIsActive(newIsActive);
      setCurrentOption(newCurrentOption);

      await getProjectsDb();
      onTop("instant");
    };

    initializeProjects();
  }, [type]);

  const activeHandle = (optionNumber: number) => {
    setFilterLoading(true);
    const newIsActive = [...isActive];
    newIsActive[currentOption] = false;
    newIsActive[optionNumber] = true;
    setIsActive(newIsActive);
    setCurrentOption(optionNumber);

    let newProjectType = "all";
    switch (optionNumber) {
      case 0:
        newProjectType = "all";
        break;
      case 1:
        newProjectType = "full-project";
        break;
      case 2:
        newProjectType = "exterior";
        break;
      case 3:
        newProjectType = "interior";
        break;
    }
    setProjectType(newProjectType);
    setFilterLoading(false);
  };

  // Convert projects to photo format for PhotoAlbum
  const photos: PhotoType[] = displayedProjects.map((item) => ({
    src: item.thumbnailURL || item.largeURL,
    width: item.widthOrigin || 800,
    height: item.heightOrigin || 600,
    key: item.id || item.name,
    title: item.name,
    description: item.description || item.name,
    alt: item.description || item.name,
  }));

  // Custom render function for project items
  const renderPhoto = ({
    photo,
    imageProps: { src, alt, style, ...restImageProps },
  }: {
    photo: PhotoType;
    imageProps: React.ImgHTMLAttributes<HTMLImageElement> & {
      style: React.CSSProperties;
    };
  }) => {
    const projectData = displayedProjects.find((p) => p.name === photo.title);

    return (
      <div
        className="relative project-image cursor-pointer overflow-hidden mb-6 group rounded-[4px] shadow-lg transform transition-all duration-500 hover:scale-[1.02]"
        style={style}
      >
        <div
          onClick={() => navigate(`/project-details/${slugify(photo.title)}`)}
          className="image-wrapper"
        >
          <img
            src={src}
            alt={alt}
            {...restImageProps}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          />
          <div className="project-description absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center items-center p-6 text-white">
            <h1 className="text-2xl font-medium text-center mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              {photo.title}
            </h1>
            <div className="flex flex-col items-center space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
              {projectData?.client && (
                <p className="text-sm opacity-90">
                  Client: {projectData.client}
                </p>
              )}
              {projectData?.year && (
                <p className="text-sm opacity-90">Year: {projectData.year}</p>
              )}
              {projectData?.type && (
                <p className="text-sm opacity-90 capitalize">
                  Type: {projectData.type}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-screen">
      <div className="bg-vr-light-gray">
        <div className="container mx-auto lg:px-16 px-8 lg:pt-40 md:pt-24 pt-16 lg:pb-36 pb-20">
          <div className="flex flex-col items-center">
            <h1 className="2xl:text-6xl md:text-5xl text-4xl text-center sofia-medium">
              Our Projects
            </h1>
            <ul className="flex flex-wrap 2xl:gap-x-12 gap-x-10 gap-y-2 justify-center 2xl:text-2xl lg:text-xl md:text-lg text-sm lg:mt-12 mt-8 uppercase">
              <li
                onClick={() => activeHandle(0)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isActive[0]
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black"
                    : "text-zinc-500 hover:text-black hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300"
                }`}
              >
                All
              </li>
              <li
                onClick={() => activeHandle(1)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isActive[1]
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black"
                    : "text-zinc-500 hover:text-black hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300"
                }`}
              >
                Full Project
              </li>
              <li
                onClick={() => activeHandle(2)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isActive[2]
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black"
                    : "text-zinc-500 hover:text-black hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300"
                }`}
              >
                Exterior
              </li>
              <li
                onClick={() => activeHandle(3)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isActive[3]
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black"
                    : "text-zinc-500 hover:text-black hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300"
                }`}
              >
                Interior
              </li>
              <li
                onClick={() => activeHandle(4)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isActive[4]
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black"
                    : "text-zinc-500 hover:text-black hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300"
                }`}
              >
                360°
              </li>
              <li
                onClick={() => activeHandle(5)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isActive[5]
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black"
                    : "text-zinc-500 hover:text-black hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300"
                }`}
              >
                Animation
              </li>
            </ul>
          </div>
          <div className="mt-8 animate-fadeIn relative">
            {filterLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            <div className="columns-1 sm:columns-2 2xl:columns-3 gap-6 space-y-6">
              {displayedProjects.map((project, index) => {
                // Determine if this project should be featured (larger)
                const isFeatured = index % 5 === 0;

                return (
                  <div
                    key={project.id || project.name}
                    className={`relative project-image cursor-pointer overflow-hidden group rounded-[4px] shadow-lg transform transition-all duration-500 hover:scale-[1.02] break-inside-avoid ${
                      isFeatured ? "row-span-2" : ""
                    }`}
                  >
                    <div
                      onClick={() =>
                        navigate(`/project-details/${slugify(project.name)}`)
                      }
                      className={`image-wrapper ${
                        isFeatured ? "aspect-[3/4]" : "aspect-[4/3]"
                      }`}
                    >
                      <img
                        src={project.thumbnailURL}
                        alt={project.description || project.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                      <div className="project-description absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center items-center p-6 text-white">
                        <h1
                          className={`${
                            isFeatured ? "text-3xl" : "text-2xl"
                          } font-medium text-center mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500`}
                        >
                          {project.name}
                        </h1>
                        <div className="flex flex-col items-center space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                          {project.client && (
                            <p className="text-sm opacity-90">
                              Client: {project.client}
                            </p>
                          )}
                          {project.year && (
                            <p className="text-sm opacity-90">
                              Year: {project.year}
                            </p>
                          )}
                          {project.type && (
                            <p className="text-sm opacity-90 capitalize">
                              Type: {project.type}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {loading && (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="loading-spinner"></div>
              </div>
            )}
            {displayedProjects.length < filteredProjects.length && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  className="group relative inline-flex items-center gap-2 px-8 py-3 bg-black hover:bg-black/90 transition-all duration-500"
                >
                  <span className="relative z-10 text-white text-15 font-light tracking-wider">
                    Load More Projects
                  </span>
                  {/* Arrow Icon */}
                  <svg
                    className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-y-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v13m0 0l-5-5m5 5l5-5"
                    />
                  </svg>
                  {/* Animated border */}
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white/40 transition-all duration-300 group-hover:w-full" />
                  <div className="absolute top-0 right-0 h-[1px] w-0 bg-white/40 transition-all duration-300 group-hover:w-full" />
                  <div className="absolute top-0 left-0 w-[1px] h-0 bg-white/40 transition-all duration-300 group-hover:h-full" />
                  <div className="absolute bottom-0 right-0 w-[1px] h-0 bg-white/40 transition-all duration-300 group-hover:h-full" />
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </button>
              </div>
            )}
          </div>

          {/* Contact Form Section */}
          <div className="relative bg-black/95 backdrop-blur-sm mt-20 rounded overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0">
              {/* Fine grid pattern */}
              <div className="absolute inset-0 grid grid-cols-24 gap-2 opacity-[0.015]">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full w-[1px] bg-white transform translate-x-full"
                  />
                ))}
              </div>
              <div className="absolute inset-0 grid grid-rows-12 gap-2 opacity-[0.015]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-full h-[1px] bg-white" />
                ))}
              </div>

              {/* Main decorative lines */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-20 h-20">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-main-color/30 to-transparent" />
                <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-main-color/30 to-transparent" />
              </div>
              <div className="absolute top-0 right-0 w-20 h-20">
                <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-main-color/30 to-transparent" />
                <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-main-color/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 w-20 h-20">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-main-color/30 to-transparent" />
                <div className="absolute bottom-0 left-0 h-full w-[1px] bg-gradient-to-t from-main-color/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 right-0 w-20 h-20">
                <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-main-color/30 to-transparent" />
                <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-main-color/30 to-transparent" />
              </div>

              {/* Radial gradient background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(241,94,34,0.03),transparent_70%)]" />

              {/* Subtle radial accents */}
              <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-main-color/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-main-color/5 rounded-full blur-3xl" />
            </div>

            <div className="grid grid-cols-5 relative">
              <img
                className="lg:col-span-2 lg:block hidden p-8 object-cover w-full h-full hover:scale-[1.02] transition-transform duration-700"
                src="../assets/images/VIEW01_POOL-min.jpg"
                alt="Architectural visualization"
              />
              <div className=" lg:col-span-3 col-span-5 py-12 pr-8 lg:pl-0 pl-8 flex flex-col justify-between relative">
                <div className="relative z-10">
                  <h1 className="text-left lg:mr-4 mr-0 2xl:text-6xl md:text-5xl text-4xl sofia-medium sm:mb-5 mb-3">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                      Are You Ready To Get Started?
                    </span>
                  </h1>
                  <p className="uppercase lg:mr-4 mr-0 text-left sofia-pro text-15 tracking-widest lg:pb-0 pb-5 text-white/80">
                    Leave Your Email And We'll Contact Your Right Away.
                  </p>
                </div>

                <div className="lg:mr-4 mr-0 relative z-10">
                  <form
                    onSubmit={handleSubmit}
                    className="relative max-w-md group"
                  >
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white px-6 py-4 pr-36 
                               outline-none focus:border-main-color transition-all duration-300
                               group-hover:border-white/20 group-hover:bg-white/10 "
                      placeholder="Your Email Address"
                      type="email"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 bg-main-color/90 text-white px-6 py-2
                               transition-all duration-300 hover:bg-main-color hover:scale-[1.02]
                               hover:shadow-lg hover:shadow-main-color/20 active:scale-[0.98]"
                    >
                      <span className="relative z-10">Send For Us</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                  </form>

                  {isSentSuccessfully && isValidEmail && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 backdrop-blur-sm py-2 px-4 border border-emerald-400/20">
                      <Icon icon="ph:check-circle-fill" className="text-lg" />
                      <p>
                        Email sent! We look forward to working with you soon.
                      </p>
                    </div>
                  )}

                  {!isValidEmail && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-400/10 backdrop-blur-sm py-2 px-4 border border-red-400/20">
                      <Icon icon="ph:warning-circle-fill" className="text-lg" />
                      <p>Please enter a valid Email address</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
