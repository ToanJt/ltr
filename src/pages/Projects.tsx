import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import slugify from "slugify";
import { onTop, convertToImageData } from "../functions/functions";
import type { ImageData } from "../functions/interface";
import { db } from "../config/firebaseConfig";
import {
  getDocs,
  getDocsFromCache,
  collection,
  doc,
  setDoc,
} from "firebase/firestore";

import "../styles/gallery.css";

const BATCH_SIZE = 12;
const MAX_RETRY = 3;

// ─── Module-level cache ───────────────────────────────────────────────────────
// Survives component unmount/remount (navigation back from project detail).
// Without this, every navigate-back triggers a full Firestore fetch + image
// reload from scratch, causing the gallery to flash and re-render entirely.
let projectsCache: ImageData[] | null = null;

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = ({ featured }: { featured: boolean }) => (
  <div
    className={`break-inside-avoid rounded-[4px] overflow-hidden bg-zinc-200 animate-pulse ${
      featured ? "aspect-[3/4]" : "aspect-[4/3]"
    }`}
  />
);

// ─── LazyImage ────────────────────────────────────────────────────────────────
//
// Root cause of "some images don't load on first visit but load after
// navigating to detail and back":
//
//   The custom IntersectionObserver had a race condition with the debounced
//   filter (120ms). Sequence:
//     1. Cards render → observer setup (async callback, not yet fired)
//     2. Debounce fires → setDisplayedProjects() → React re-render
//     3. Observer cleanup runs (re-render) → old observer disconnected
//     4. New observer set up, but card already in viewport → callback fires
//        only on next async tick → another re-render might have already
//        reset visible=false → image never loaded
//   After visiting project detail: image cached in browser → loads instantly
//   on return, bypassing the timing issue entirely.
//
// Fix: native loading="lazy" — browser handles intersection natively with
// no async race. Retry via key={retryCount} remains unchanged.
const LazyImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const mountedRef = useRef(true);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  // Reset when src changes (filter switches project list)
  useEffect(() => {
    setLoaded(false);
    setError(false);
    setRetryCount(0);
  }, [src]);

  const handleLoad = () => {
    if (mountedRef.current) setLoaded(true);
  };

  // Exponential backoff retry: 1s → 2s → 4s
  // key={retryCount} forces React to unmount→remount <img>, making the
  // browser issue a genuine new network request on each attempt.
  const handleError = () => {
    if (!mountedRef.current) return;
    if (retryTimer.current) clearTimeout(retryTimer.current);

    if (retryCount < MAX_RETRY) {
      const delay = 1000 * Math.pow(2, retryCount);
      retryTimer.current = setTimeout(() => {
        if (mountedRef.current) setRetryCount((c) => c + 1);
      }, delay);
    } else {
      setError(true);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Skeleton while loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-zinc-200 animate-pulse" />
      )}

      {/* Error fallback after all retries exhausted */}
      {error && (
        <div className="absolute inset-0 bg-zinc-100 flex flex-col items-center justify-center gap-2 text-zinc-400">
          <Icon icon="ph:image-broken" className="text-3xl" />
          <span className="text-xs">Không tải được ảnh</span>
        </div>
      )}

      {!error && (
        <img
          key={retryCount}
          src={src}
          alt={alt}
          loading="lazy" // browser-native lazy load — no race condition
          decoding="async" // non-blocking decode, improves scroll performance
          onLoad={handleLoad}
          onError={handleError}
          className={`absolute inset-0 ${className} transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Projects = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const [allProjects, setAllProjects] = useState<ImageData[]>([]);
  const [displayedProjects, setDisplayedProjects] = useState<ImageData[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ImageData[]>([]);

  // 5 tabs: All / Exterior / Interior / 360 / Animation
  const [isActive, setIsActive] = useState<boolean[]>([
    true,
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

  const filterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<boolean>(false);

  // loadImageDimensions intentionally removed:
  // We use fixed CSS aspect-ratios (aspect-[3/4] / aspect-[4/3]) so real
  // pixel dimensions are never needed. Loading every Image() up-front was
  // causing "preloaded but not used" warnings that fought with LazyImage's
  // IntersectionObserver and prevented some images from rendering correctly.

  // ── Email helpers ───────────────────────────────────────────────────────────
  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = email ? validateEmail(email) : false;
    setIsValidEmail(valid);
    if (!valid) return;

    try {
      setIsSentSuccessfully(true);
      const customerDoc = doc(collection(db, "customers"));
      await setDoc(customerDoc, {
        email: email.trim(),
        isRead: false,
        createAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  // ── Fetch from Firestore (cache-first) ──────────────────────────────────────
  const getProjectsDb = async () => {
    // If we already have data from a previous mount (e.g. navigated back),
    // restore instantly — zero loading flash, zero Firestore round-trip.
    if (projectsCache) {
      setAllProjects(projectsCache);
      return;
    }

    try {
      setLoading(true);
      abortRef.current = false;

      let snapshot;
      try {
        snapshot = await getDocsFromCache(collection(db, "projects"));
        if (snapshot.empty) throw new Error("cache empty");
      } catch {
        snapshot = await getDocs(collection(db, "projects"));
      }

      if (abortRef.current) return;

      const projectsData: ImageData[] = [];
      snapshot.forEach((d) => {
        projectsData.push({ id: d.id, ...convertToImageData(d.data()) });
      });

      if (abortRef.current) return;

      projectsCache = projectsData; // store for next mount
      setAllProjects(projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Filter logic (debounced) ────────────────────────────────────────────────
  const filterProjects = useCallback(
    (projects: ImageData[], option: number, type: string) => {
      if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
      console.log("Filtering projects with option:", option, "type:", type);
      filterDebounceRef.current = setTimeout(() => {
        setFilterLoading(true);

        let filtered = [...projects];

        if (option === 1) {
          filtered = filtered.filter((item) => item.type === "exterior");
        } else if (option === 2) {
          filtered = filtered.filter((item) => item.type === "interior");
        } else if (option === 3) {
          filtered = filtered.filter((item) => item.is360 === true);
        } else if (option === 4) {
          filtered = filtered.filter((item) => item.isAnimation === true);
        }
        // option === 0  →  show all

        setFilteredProjects(filtered);
        setDisplayedProjects(filtered.slice(0, BATCH_SIZE));
        setCurrentPage(1);
        setFilterLoading(false);
      }, 120);
    },
    [],
  );

  const loadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    const start = (nextPage - 1) * BATCH_SIZE;
    setDisplayedProjects((prev) => [
      ...prev,
      ...filteredProjects.slice(start, start + BATCH_SIZE),
    ]);
    setCurrentPage(nextPage);
  }, [currentPage, filteredProjects]);

  // Re-filter whenever deps change
  useEffect(() => {
    filterProjects(allProjects, currentOption, projectType);
  }, [currentOption, projectType, filterProjects, allProjects]);

  // Init on route change
  useEffect(() => {
    abortRef.current = false;

    const newIsActive = [false, false, false, false, false];
    let newOption = 0;
    let newType = "all";

    if (type === "exterior") {
      newIsActive[1] = true;
      newOption = 1;
      newType = "exterior";
    } else if (type === "interior") {
      newIsActive[2] = true;
      newOption = 2;
      newType = "interior";
    } else if (type === "360") {
      newIsActive[3] = true;
      newOption = 3;
      newType = "360";
    } else if (type === "animation") {
      newIsActive[4] = true;
      newOption = 4;
      newType = "animation";
    } else {
      newIsActive[0] = true;
    }

    setIsActive(newIsActive);
    setCurrentOption(newOption);
    setProjectType(newType);

    getProjectsDb();
    onTop("instant");

    // Abort any in-flight work when component unmounts or type changes
    return () => {
      abortRef.current = true;
    };
  }, [type]);

  // ── Tab click ───────────────────────────────────────────────────────────────
  const activeHandle = (optionNumber: number) => {
    const newIsActive = [false, false, false, false, false];
    newIsActive[optionNumber] = true;
    setIsActive(newIsActive);
    setCurrentOption(optionNumber);

    const typeMap: Record<number, string> = {
      0: "all",
      1: "exterior",
      2: "interior",
      3: "360",
      4: "animation",
    };
    setProjectType(typeMap[optionNumber] ?? "all");
  };

  // ── Tab label config ────────────────────────────────────────────────────────
  const tabs = [
    { label: "All" },
    { label: "Exterior" },
    { label: "Interior" },
    { label: "360°" },
    { label: "Animation" },
  ];

  const tabClass = (active: boolean) =>
    `relative cursor-pointer transition-all duration-300 ${
      active
        ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-black"
        : "text-zinc-500 hover:text-black hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300"
    }`;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-screen">
      <div className="bg-vr-light-gray">
        <div className="container mx-auto lg:px-16 px-8 lg:pt-40 md:pt-24 pt-16 lg:pb-36 pb-20">
          {/* Header + Tabs */}
          <div className="flex flex-col items-center">
            <h1 className="2xl:text-6xl md:text-5xl text-4xl text-center sofia-medium">
              Our Projects
            </h1>

            <ul className="flex flex-wrap 2xl:gap-x-12 gap-x-10 gap-y-2 justify-center 2xl:text-2xl lg:text-xl md:text-lg text-sm lg:mt-12 mt-8 uppercase">
              {tabs.map((tab, i) => (
                <li
                  key={tab.label}
                  onClick={() => activeHandle(i)}
                  className={tabClass(isActive[i])}
                >
                  {tab.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Gallery */}
          <div className="mt-8 animate-fadeIn relative">
            {filterLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner" />
              </div>
            )}

            <div className="columns-1 sm:columns-2 2xl:columns-3 gap-6 space-y-6">
              {loading
                ? // Show 6 skeletons while data loads
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} featured={i % 5 === 0} />
                  ))
                : displayedProjects.map((project, index) => {
                    const isFeatured = index % 5 === 0;

                    return (
                      <div
                        key={project.id || project.name}
                        className="relative project-image cursor-pointer overflow-hidden group rounded-[4px] shadow-lg transform transition-all duration-500 hover:scale-[1.02] break-inside-avoid"
                      >
                        <div
                          onClick={() =>
                            navigate(
                              `/project-details/${slugify(project.name)}`,
                            )
                          }
                          className={`image-wrapper ${
                            isFeatured ? "aspect-[3/4]" : "aspect-[4/3]"
                          }`}
                        >
                          {/* LazyImage handles skeleton, retry, error */}
                          <LazyImage
                            src={project.thumbnailURL}
                            alt={project.description || project.name}
                            className="w-full h-full object-cover group-hover:scale-110"
                          />

                          {/* Hover overlay */}
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

            {/* Load more button */}
            {!loading && displayedProjects.length < filteredProjects.length && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  className="group relative inline-flex items-center gap-2 px-8 py-3 bg-black hover:bg-black/90 transition-all duration-500"
                >
                  <span className="relative z-10 text-white text-15 font-light tracking-wider">
                    Load More Projects
                  </span>
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
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white/40 transition-all duration-300 group-hover:w-full" />
                  <div className="absolute top-0 right-0 h-[1px] w-0 bg-white/40 transition-all duration-300 group-hover:w-full" />
                  <div className="absolute top-0 left-0 w-[1px] h-0 bg-white/40 transition-all duration-300 group-hover:h-full" />
                  <div className="absolute bottom-0 right-0 w-[1px] h-0 bg-white/40 transition-all duration-300 group-hover:h-full" />
                </button>
              </div>
            )}
          </div>

          {/* ── Contact Form ── */}
          <div className="relative bg-black/95 backdrop-blur-sm mt-20 rounded overflow-hidden">
            {/* Decorative background (unchanged) */}
            <div className="absolute inset-0">
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
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(241,94,34,0.03),transparent_70%)]" />
              <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-main-color/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-main-color/5 rounded-full blur-3xl" />
            </div>

            <div className="grid grid-cols-5 relative">
              <img
                className="lg:col-span-2 lg:block hidden p-8 object-cover w-full h-full hover:scale-[1.02] transition-transform duration-700"
                src="../assets/images/VIEW01_POOL-min.jpg"
                alt="Architectural visualization"
              />
              <div className="lg:col-span-3 col-span-5 py-12 pr-8 lg:pl-0 pl-8 flex flex-col justify-between relative">
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
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white px-6 py-4 pr-36 outline-none focus:border-main-color transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10"
                      placeholder="Your Email Address"
                      type="email"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 bg-main-color/90 text-white px-6 py-2 transition-all duration-300 hover:bg-main-color hover:scale-[1.02] hover:shadow-lg hover:shadow-main-color/20 active:scale-[0.98]"
                    >
                      <span className="relative z-10">Send For Us</span>
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
          {/* ── End Contact Form ── */}
        </div>
      </div>
    </div>
  );
};

export default Projects;
