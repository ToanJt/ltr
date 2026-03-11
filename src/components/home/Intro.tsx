import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { Icon } from "@iconify/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import type { LoadableComponent } from "../../functions/interface";
import "../../styles/intro.css";

interface Background {
  id: string;
  title: string;
  content1: string;
  content2?: string;
  content3?: string;
  image: string;
}

// Constants - tách ra ngoài để tránh tạo lại mỗi render
const AUTO_SLIDE_DELAY = 15000;
const TRANSITION_DURATION = 1000;
const PRELOAD_ADJACENT_SLIDES = 1; // Số slides kề cận cần preload

// Memoized Navigation Dots Component
interface NavigationDotsProps {
  backgrounds: Background[];
  activeIndex: number;
  onNavigate: (index: number) => void;
}

const NavigationDots = memo(
  ({ backgrounds, activeIndex, onNavigate }: NavigationDotsProps) => (
    <div className="absolute bottom-12 right-8 lg:right-16 flex items-center gap-3 pointer-events-auto">
      {backgrounds.map((_, idx) => (
        <button
          key={idx}
          onClick={() => onNavigate(idx)}
          aria-label={`Go to slide ${idx + 1}`}
          className={`h-[2px] transition-all duration-300 ${
            activeIndex === idx
              ? "w-8 bg-white"
              : "w-4 bg-white/50 hover:bg-white/70"
          }`}
        />
      ))}
    </div>
  )
);

NavigationDots.displayName = "NavigationDots";

// Memoized Slide Content Component
interface SlideContentProps {
  background: Background;
  isActive: boolean;
  isTransitioning: boolean;
  onExploreClick: () => void;
}

const SlideContent = memo(
  ({
    background,
    isActive,
    isTransitioning,
    onExploreClick,
  }: SlideContentProps) => (
    <div className="container mx-auto px-8 lg:px-16 h-full flex flex-col justify-center">
      <div className="space-y-8 max-w-4xl">
        {/* Title */}
        <div className="pt-24">
          <h1 className="sofia-medium 2xl:text-7xl lg:text-6xl sm:text-5xl text-4xl leading-tight text-white">
            {background.title}
          </h1>
        </div>

        {/* Content Sections */}
        <div className="space-y-4 max-w-3xl">
          <p className="text-white/90 sm:text-left text-justify lg:text-17 text-15 font-light leading-relaxed">
            {background.content1}
          </p>

          {background.content2 && (
            <p className="text-white/80 sm:text-left text-justify lg:text-17 text-15 font-light leading-relaxed">
              {background.content2.trim().replace(/\s+/g, " ")}
            </p>
          )}

          {background.content3 && (
            <p className="text-white/70 sm:text-left text-justify lg:text-17 text-15 font-light leading-relaxed">
              {background.content3}
            </p>
          )}
        </div>

        {/* Explore Button */}
        <div className="pt-8 pointer-events-auto">
          {!isTransitioning && isActive && (
            <button
              onClick={onExploreClick}
              className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-none transition-all duration-300"
            >
              <span className="text-white lg:text-lg sm:text-17 text-15 font-light tracking-wider">
                Explore Projects
              </span>
              <Icon
                icon="material-symbols:arrow-forward-rounded"
                className="text-white lg:text-xl sm:text-lg text-17 transition-transform duration-300 group-hover:translate-x-1"
              />
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
);

SlideContent.displayName = "SlideContent";

const BackgroundSlider = ({ onLoad }: LoadableComponent) => {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const swiperRef = useRef<any>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  // Preload images with optimized loading strategy
  const preloadImage = useCallback(
    (src: string, priority: "high" | "low" = "low") => {
      return new Promise((resolve, reject) => {
        // Kiểm tra nếu ảnh đã được load
        if (loadedImages.has(src)) {
          resolve(src);
          return;
        }

        const img = new Image();
        // LCP Optimization: First image uses sync decoding for faster LCP
        img.decoding = priority === "high" ? "sync" : "async";

        // Set fetchPriority based on priority parameter
        if (priority === "high") {
          img.fetchPriority = "high";
        } else {
          // Lower priority for non-critical images to avoid LCP conflicts
          img.fetchPriority = "low";
        }

        img.src = src;

        img.onload = () => {
          setLoadedImages((prev) => new Set(prev).add(src));
          resolve(src);
        };

        img.onerror = () => {
          console.error(`Failed to load image: ${src}`);
          reject(new Error(`Failed to load image: ${src}`));
        };
      });
    },
    [loadedImages]
  );

  // Preload adjacent slides for smoother transitions
  // LCP Optimization: Delay preloading to avoid LCP conflicts
  const preloadAdjacentSlides = useCallback(
    (currentIndex: number) => {
      if (backgrounds.length === 0) return;

      // Don't preload immediately - wait a bit to let LCP settle
      setTimeout(() => {
      const indicesToPreload: number[] = [];

      for (let i = 1; i <= PRELOAD_ADJACENT_SLIDES; i++) {
        const nextIndex = (currentIndex + i) % backgrounds.length;
        const prevIndex =
          (currentIndex - i + backgrounds.length) % backgrounds.length;
        indicesToPreload.push(nextIndex, prevIndex);
      }

        // Preload adjacent slides in background with low priority
      indicesToPreload.forEach((index) => {
        const bg = backgrounds[index];
        if (bg && !loadedImages.has(bg.image)) {
          preloadImage(bg.image, "low").catch(() => {
            // Silently handle preload errors
          });
        }
      });
      }, 1000); // Delay 1s to avoid LCP conflicts
    },
    [backgrounds, loadedImages, preloadImage]
  );

  // Fetch backgrounds data and preload images
  useEffect(() => {
    let isMounted = true;

    const fetchBackgrounds = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "backgrounds"));
        const data = querySnapshot.docs.map<Background>((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Background, "id">),
        }));

        if (!isMounted) return;

        setBackgrounds(data);

        // LCP Optimization: Only preload first image with high priority
        // Delay other images to avoid multiple LCP candidates
        if (data.length > 0) {
          await preloadImage(data[0].image, "high");

          if (onLoad && isMounted) {
            onLoad();
          }

          // Delay preloading other images to avoid LCP conflicts
          // Only preload after first image is loaded and LCP is determined
          setTimeout(() => {
            if (data.length > 1 && isMounted) {
            Promise.all(
              data.slice(1, 3).map((bg) => preloadImage(bg.image, "low"))
            ).catch(() => {
              // Handle errors silently
            });
          }
          }, 2000); // Delay 2s to let LCP settle
        }
      } catch (error) {
        console.error("Error fetching backgrounds:", error);
      }
    };

    fetchBackgrounds();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle slide navigation - memoized
  const handleSlideNavigation = useCallback((targetIndex: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(targetIndex);
    }
  }, []);

  // Handle explore button click - memoized
  const handleExploreClick = useCallback(() => {
    navigate("/projects");
  }, [navigate]);

  // Handle auto slide - optimized
  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }

    // Chỉ bật auto slide khi có đủ slides để loop
    if (backgrounds.length < 2) return;

    autoSlideRef.current = setInterval(() => {
      if (swiperRef.current && !document.hidden) {
        swiperRef.current.slideNext();
      }
    }, AUTO_SLIDE_DELAY);
  }, [backgrounds.length]);

  // Initialize auto slide with visibility check
  useEffect(() => {
    if (backgrounds.length === 0) return;

    startAutoSlide();

    // Pause auto slide when tab is not visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (autoSlideRef.current) {
          clearInterval(autoSlideRef.current);
        }
      } else {
        startAutoSlide();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [backgrounds.length, startAutoSlide]);

  // Handle slide change with optimized updates
  const handleSlideChange = useCallback(
    (swiper: any) => {
      const newIndex = swiper.activeIndex;

      requestAnimationFrame(() => {
        setIsTransitioning(true);
        setActiveIndex(newIndex);
        startAutoSlide();

        // Preload adjacent slides
        preloadAdjacentSlides(newIndex);

        // Reset transitioning state after animation completes
        setTimeout(() => {
          setIsTransitioning(false);
        }, TRANSITION_DURATION);
      });
    },
    [startAutoSlide, preloadAdjacentSlides]
  );

  // Memoize swiper config
  const swiperConfig = useMemo(
    () => ({
      modules: [Autoplay, EffectFade],
      effect: "fade" as const,
      fadeEffect: {
        crossFade: true,
      },
      className: "!absolute !inset-0 !w-full !h-full",
      slidesPerView: 1,
      speed: TRANSITION_DURATION,
      // Chỉ bật loop khi có đủ slides (>= 2) để tránh warning
      ...(backgrounds.length >= 2 && { loop: true }),
      allowTouchMove: false,
      simulateTouch: false,
      grabCursor: false,
      watchSlidesProgress: true,
      preventInteractionOnTransition: true,
      // LCP Optimization: Lazy load all slides except first to reduce LCP candidates
      lazy: {
        loadPrevNext: false, // Don't preload adjacent slides immediately
        loadPrevNextAmount: 0, // Only load when needed
        checkInView: true, // Only load when slide is in view
      },
      // Chỉ bật autoplay khi có đủ slides để loop
      ...(backgrounds.length >= 2 && {
      autoplay: {
        delay: AUTO_SLIDE_DELAY,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
    }),
    }),
    [backgrounds.length]
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 w-full h-full">
        <Swiper
          {...swiperConfig}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={handleSlideChange}
        >
          {backgrounds.map((background, index) => {
            const isActive = activeIndex === index;
            const isLoaded = loadedImages.has(background.image);
            // LCP Optimization: Only first slide should be LCP candidate
            const isFirstSlide = index === 0;
            // Only use will-change for active slide to reduce LCP candidates
            const shouldOptimize = isActive || isFirstSlide;

            return (
              <SwiperSlide
                key={background.id}
                className="relative w-full h-full"
              >
                <div className="relative w-full h-full">
                  {/* Background Image with Overlay */}
                  <div
                    className={`absolute inset-0 w-full h-full bg-cover bg-center transform transition-transform duration-1000 ${
                      shouldOptimize ? "will-change-transform" : ""
                    } ${!isLoaded ? "bg-gray-900" : ""}`}
                    style={{
                      backgroundImage: isLoaded
                        ? `url(${background.image})`
                        : undefined,
                      transform: isActive ? "scale(1)" : "scale(1.05)",
                    }}
                  >
                    {!isLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
                  </div>

                  {/* Content Container */}
                  <div className="relative h-full w-full pointer-events-none">
                    <SlideContent
                      background={background}
                      isActive={isActive}
                      isTransitioning={isTransitioning}
                      onExploreClick={handleExploreClick}
                    />

                    <NavigationDots
                      backgrounds={backgrounds}
                      activeIndex={activeIndex}
                      onNavigate={handleSlideNavigation}
                    />
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default BackgroundSlider;
