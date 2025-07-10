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

const BackgroundSlider = () => {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [textTrigger, setTextTrigger] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const swiperRef = useRef<any>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch backgrounds data
  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "backgrounds"));
        const data = querySnapshot.docs.map<Background>((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Background, "id">),
        }));
        setBackgrounds(data);
      } catch (error) {
        console.error("Error fetching backgrounds:", error);
      }
    };
    fetchBackgrounds();
  }, []);

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
                  className="absolute inset-0 w-full h-full bg-cover bg-center transform transition-all duration-[2000ms]"
                  style={{
                    backgroundImage: `url(${background.image})`,
                    transform:
                      activeIndex === index ? "scale(1)" : "scale(1.1)",
                    opacity: activeIndex === index ? 1 : 0,
                  }}
                >
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
