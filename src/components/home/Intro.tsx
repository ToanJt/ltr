import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { TextEffect } from "../motion-primitives/text-effect";
import { useNavigate } from "react-router-dom";
import type { Variants } from "framer-motion";
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

const AUTO_SLIDE_DELAY = 15000;
const TRANSITION_DURATION = 1000;
const TEXT_TRIGGER_DELAY = 100;
const IMAGE_QUALITY = 90; // Chất lượng hình ảnh tối ưu

const BackgroundSlider = ({ onLoad }: LoadableComponent) => {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [textTrigger, setTextTrigger] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const swiperRef = useRef<any>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const imageCache = useRef<Map<string, string>>(new Map());

  // Tối ưu URL hình ảnh
  const optimizeImageUrl = useCallback((url: string) => {
    if (imageCache.current.has(url)) {
      return imageCache.current.get(url)!;
    }

    // Thêm tham số chất lượng vào URL nếu là URL Cloudinary hoặc tương tự
    if (url.includes("cloudinary.com")) {
      const optimizedUrl = url.replace(
        "/upload/",
        `/upload/q_${IMAGE_QUALITY},f_auto/`
      );
      imageCache.current.set(url, optimizedUrl);
      return optimizedUrl;
    }

    return url;
  }, []);

  // Preload images with optimized loading strategy
  const preloadImage = useCallback(
    (src: string) => {
      return new Promise((resolve, reject) => {
        const optimizedSrc = optimizeImageUrl(src);
        const img = new Image();

        // Thêm loading="eager" cho ảnh đầu tiên, lazy cho các ảnh còn lại
        if (backgrounds.length === 0) {
          img.loading = "eager";
        } else {
          img.loading = "lazy";
        }

        // Thêm fetchpriority cho ảnh đầu tiên
        if (backgrounds.length === 0) {
          img.fetchPriority = "high";
        }

        img.decoding = "async"; // Sử dụng async decoding
        img.src = optimizedSrc;

        img.onload = () => {
          setLoadedImages((prev) => {
            const newSet = new Set(prev).add(src);
            if (newSet.size === backgrounds.length && onLoad) {
              onLoad();
            }
            return newSet;
          });
          resolve(src);
        };
        img.onerror = reject;
      });
    },
    [backgrounds.length, onLoad, optimizeImageUrl]
  );

  // Fetch backgrounds data and preload images
  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "backgrounds"));
        const data = querySnapshot.docs.map<Background>((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Background, "id">),
        }));
        setBackgrounds(data);

        // Preload first image immediately, then others
        if (data.length > 0) {
          await preloadImage(data[0].image);
          // Preload remaining images
          Promise.all(data.slice(1).map((bg) => preloadImage(bg.image)));
        }
      } catch (error) {
        console.error("Error fetching backgrounds:", error);
      }
    };
    fetchBackgrounds();
  }, [preloadImage]);

  // Reset text trigger with delay
  const resetTextTrigger = useCallback(() => {
    setTextTrigger(false);
    setTimeout(() => setTextTrigger(true), TEXT_TRIGGER_DELAY);
  }, []);

  // Handle slide navigation
  const handleSlideNavigation = useCallback((targetIndex: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(targetIndex);
    }
  }, []);

  // Handle auto slide
  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }

    autoSlideRef.current = setInterval(() => {
      if (swiperRef.current) {
        const isLastSlide = activeIndex === backgrounds.length - 1;
        if (isLastSlide) {
          handleSlideNavigation(0);
        } else {
          swiperRef.current.slideNext();
        }
      }
    }, AUTO_SLIDE_DELAY);
  }, [activeIndex, backgrounds.length, handleSlideNavigation]);

  // Initialize auto slide
  useEffect(() => {
    if (backgrounds.length > 0) {
      startAutoSlide();
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [backgrounds.length, startAutoSlide]);

  // Handle slide change
  const handleSlideChange = useCallback(
    (swiper: any) => {
      setIsTransitioning(true);
      setActiveIndex(swiper.activeIndex);
      resetTextTrigger();
      startAutoSlide();

      // Reset transitioning state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, TRANSITION_DURATION);
    },
    [resetTextTrigger, startAutoSlide]
  );

  // Animation variants
  const textVariants = useMemo(
    () => ({
      container: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.03,
            delayChildren: 0.2,
          },
        },
        exit: {
          transition: {
            staggerChildren: 0.02,
            staggerDirection: 1,
          },
        },
      } as Variants,
      item: {
        hidden: {
          opacity: 0,
          y: 20,
          scale: 0.95,
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            damping: 15,
            stiffness: 80,
            duration: 0.6,
          },
        },
        exit: {
          opacity: 0,
          y: -10,
          scale: 0.95,
          transition: {
            duration: 0.4,
          },
        },
      } as Variants,
    }),
    []
  );

  const content2Variants = useMemo(
    () => ({
      ...textVariants,
      container: {
        ...textVariants.container,
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.03,
            delayChildren: 0.4,
          },
        },
      } as Variants,
    }),
    [textVariants]
  );

  const content3Variants = useMemo(
    () => ({
      ...textVariants,
      container: {
        ...textVariants.container,
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.03,
            delayChildren: 0.6,
          },
        },
      } as Variants,
    }),
    [textVariants]
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 w-full h-full">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{
            crossFade: true,
          }}
          className="!absolute !inset-0 !w-full !h-full"
          slidesPerView={1}
          speed={TRANSITION_DURATION}
          loop={true}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={handleSlideChange}
          allowTouchMove={false}
          simulateTouch={false}
          grabCursor={false}
          watchSlidesProgress={true}
          preventInteractionOnTransition={true}
          autoplay={{
            delay: AUTO_SLIDE_DELAY,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
        >
          {backgrounds.map((background, index) => (
            <SwiperSlide key={background.id} className="relative w-full h-full">
              <div className="relative w-full h-full">
                {/* Background Image with Overlay */}
                <div
                  className={`absolute inset-0 w-full h-full bg-cover bg-center transform will-change-transform ${
                    !loadedImages.has(background.image) ? "bg-gray-900" : ""
                  }`}
                  style={{
                    backgroundImage: loadedImages.has(background.image)
                      ? `url(${optimizeImageUrl(background.image)})`
                      : undefined,
                    transform:
                      activeIndex === index ? "scale(1)" : "scale(1.1)",
                    opacity: activeIndex === index ? 1 : 0,
                  }}
                >
                  {!loadedImages.has(background.image) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
                </div>

                {/* Content Container */}
                <div className="relative h-full w-full pointer-events-none">
                  <div className="container mx-auto px-8 lg:px-16 h-full flex flex-col justify-center">
                    <div className="space-y-8 max-w-4xl">
                      {/* Title */}
                      <div className="overflow-hidden pt-24">
                        <TextEffect
                          per="word"
                          trigger={textTrigger && activeIndex === index}
                          variants={textVariants}
                          className="sofia-medium 2xl:text-7xl lg:text-6xl sm:text-5xl text-4xl leading-tight text-white"
                        >
                          {background.title}
                        </TextEffect>
                      </div>

                      {/* Content Sections */}
                      <div className="space-y-4 max-w-3xl">
                        <TextEffect
                          per="word"
                          trigger={textTrigger && activeIndex === index}
                          variants={textVariants}
                          className="text-white/90 sm:text-left text-justify lg:text-17 text-15 font-light leading-relaxed"
                        >
                          {background.content1}
                        </TextEffect>

                        {background.content2 && (
                          <TextEffect
                            per="word"
                            trigger={textTrigger && activeIndex === index}
                            variants={content2Variants}
                            className="text-white/80 sm:text-left text-justify lg:text-17 text-15 font-light leading-relaxed"
                          >
                            {background.content2.trim().replace(/\s+/g, " ")}
                          </TextEffect>
                        )}

                        {background.content3 && (
                          <TextEffect
                            per="word"
                            trigger={textTrigger && activeIndex === index}
                            variants={content3Variants}
                            className="text-white/70 sm:text-left text-justify lg:text-17 text-15 font-light leading-relaxed"
                          >
                            {background.content3}
                          </TextEffect>
                        )}
                      </div>

                      {/* Explore Button */}
                      <div className="pt-8 pointer-events-auto">
                        {!isTransitioning && activeIndex === index && (
                          <button
                            onClick={() => navigate("/projects")}
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

                    {/* Slide Navigation */}
                    <div className="absolute bottom-12 right-8 lg:right-16 flex items-center gap-3 pointer-events-auto">
                      {backgrounds.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSlideNavigation(idx)}
                          className={`h-[2px] transition-all duration-300 ${
                            activeIndex === idx
                              ? "w-8 bg-white"
                              : "w-4 bg-white/50 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default BackgroundSlider;
