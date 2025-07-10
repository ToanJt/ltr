import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import slugify from "slugify";
import { onTop, convertToImageData } from "../functions/functions";
import type { ImageData } from "../functions/interface";
import { db } from "../config/firebaseConfig";
import { getDocs, collection, doc, setDoc } from "firebase/firestore";

import "react-photo-album/masonry.css";
import "../styles/gallery.css";

const BATCH_SIZE = 12; // Number of images to load per batch

const Projects = () => {
  const { type } = useParams();
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
  const projectsCache = useRef<Map<string, ImageData>>(new Map());
  const filteredCache = useRef<Map<string, ImageData[]>>(new Map());
  const observer = useRef<IntersectionObserver | null>(null);

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

  const loadImageDimensions = async (imageArray: ImageData[]) => {
    const updatedImages = await Promise.all(
      imageArray.map((image) => {
        return new Promise<ImageData>((resolve) => {
          const cachedImage = projectsCache.current.get(image.thumbnailURL);
          if (cachedImage) {
            resolve(cachedImage);
            return;
          }

          const img = new Image();
          img.src = image.thumbnailURL;

          const imageElement = document.querySelector(
            `[data-image-url="${image.thumbnailURL}"]`
          );
          if (imageElement) {
            imageElement
              .closest(".image-wrapper")
              ?.classList.add("image-loading");
          }

          img.onload = () => {
            if (imageElement) {
              const wrapper = imageElement.closest(".image-wrapper");
              wrapper?.classList.remove("image-loading");
              wrapper?.classList.add("image-loaded");
            }
            const updatedImage: ImageData = {
              ...image,
              widthOrigin: img.width,
              heightOrigin: img.height,
            };
            projectsCache.current.set(image.thumbnailURL, updatedImage);
            resolve(updatedImage);
          };

          img.onerror = () => {
            if (imageElement) {
              const wrapper = imageElement.closest(".image-wrapper");
              wrapper?.classList.remove("image-loading");
              wrapper?.classList.add("image-loaded");
            }
            const defaultImage: ImageData = {
              ...image,
              widthOrigin: 800,
              heightOrigin: 600,
            };
            projectsCache.current.set(image.thumbnailURL, defaultImage);
            resolve(defaultImage);
          };
        });
      })
    );

    return updatedImages;
  };

  const getProjectsDb = async () => {
    try {
      setLoading(true);
      const projectsDb = await getDocs(collection(db, "projects"));

      const projectsData: ImageData[] = [];
      projectsDb.forEach((doc) => {
        const docData = convertToImageData(doc.data());
        projectsData.push(docData);
      });

      const updatedImages = await loadImageDimensions(projectsData);
      setAllProjects(updatedImages);

      filteredCache.current.clear();
      filterProjects(updatedImages, currentOption, projectType);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilterCacheKey = (option: number, type: string) => {
    if (option === 0) return "all";
    if (option === 4) return "360";
    if (option === 5) return "animation";
    return type;
  };

  const filterProjects = useCallback(
    (projects: ImageData[], option: number, type: string) => {
      setFilterLoading(true);

      const cacheKey = getFilterCacheKey(option, type);
      const cachedResults = filteredCache.current.get(cacheKey);

      if (cachedResults) {
        setFilteredProjects(cachedResults);
        setDisplayedProjects(cachedResults.slice(0, BATCH_SIZE));
        setCurrentPage(1);
        setFilterLoading(false);
        return;
      }

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

      filteredCache.current.set(cacheKey, filtered);

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

  const lastImageRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          displayedProjects.length < filteredProjects.length
        ) {
          loadMore();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, displayedProjects.length, filteredProjects.length, loadMore]
  );

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

  const createGalleries = (
    images: Array<ImageData>,
    columns: number
  ): Array<Array<ImageData>> => {
    const galleries: Array<Array<ImageData>> = Array.from(
      { length: columns },
      () => []
    );
    images.forEach((image: ImageData, index: number) => {
      galleries[index % columns].push(image);
    });
    return galleries;
  };

  let columns = 3;

  if (window.innerWidth > 1280) {
    columns = 3;
  } else if (window.innerWidth > 640) {
    columns = 2;
  } else {
    columns = 1;
  }
  const galleries = useMemo(() => {
    return createGalleries(displayedProjects, columns);
  }, [displayedProjects, columns]);

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
          <div className="grid 2xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-6  mt-8 animate-fadeIn relative">
            {filterLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            {galleries.map((column, columnIndex) => (
              <div
                key={columnIndex}
                className="column col-span-1 gallery transform transition-all duration-500"
              >
                {column.map((image, imageIndex) => {
                  const isLastImage =
                    columnIndex === galleries.length - 1 &&
                    imageIndex === column.length - 1;

                  return (
                    <div
                      key={imageIndex}
                      ref={isLastImage ? lastImageRef : null}
                      className="relative project-image cursor-pointer overflow-hidden mb-6 group rounded-[4px] shadow-lg transform transition-all duration-500 hover:scale-[1.02]"
                    >
                      <Link to={`/project-details/${slugify(image.name)}`}>
                        <div className="image-wrapper">
                          <img
                            loading="lazy"
                            data-image-url={image.thumbnailURL}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                            src={image.thumbnailURL}
                            alt={image.description || undefined}
                          />
                        </div>
                        <div className="project-description absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center items-center p-6 text-white">
                          <h1 className="text-2xl font-medium text-center mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            {image.name}
                          </h1>
                          <div className="flex flex-col items-center space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                            {image.client && (
                              <p className="text-sm opacity-90">
                                Client: {image.client}
                              </p>
                            )}
                            {image.year && (
                              <p className="text-sm opacity-90">
                                Year: {image.year}
                              </p>
                            )}
                            {image.type && (
                              <p className="text-sm opacity-90 capitalize">
                                Type: {image.type}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ))}
            {loading && (
              <div className="col-span-full flex justify-center items-center py-8">
                <div className="loading-spinner"></div>
              </div>
            )}
          </div>
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
