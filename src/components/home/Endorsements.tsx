import { useState, useEffect, useRef } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../styles/endorsements.css";

import { getDocs, collection } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

const Endorsements = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const swiperInstance = useRef<any>(null);
  const modules = [Navigation, Pagination];

  const onSwiper = (swiper: any) => {
    swiperInstance.current = swiper;
  };

  const nextSlide = () => {
    if (swiperInstance.current) {
      swiperInstance.current.slideNext();
    }
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const feedbacksSnapshot = await getDocs(collection(db, "feedbacks"));
      const feedbacksData = feedbacksSnapshot.docs.map((doc) => doc.data());
      setFeedbacks(feedbacksData);
    };

    fetchFeedbacks();

    const interval = setInterval(() => {
      nextSlide();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-black text-white overflow-hidden w-screen">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(243,244,246,0.05),transparent_50%)]" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />

      <div className="container mx-auto px-8 lg:px-36 py-24 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center md:mb-16 mb-8"
        >
          <h1 className="2xl:text-6xl md:text-5xl text-4xl text-left sofia-medium uppercase">
            Client Endorsements
          </h1>
        </motion.div>

        <Swiper
          speed={1000}
          centeredSlides
          className="endorsements-slider"
          pagination={{
            clickable: true,
            renderBullet: (index, className) => {
              return `<span class="${className} custom-bullet"></span>`;
            },
          }}
          loop
          modules={modules}
          onSwiper={onSwiper}
        >
          {feedbacks.map((feedback, index) => (
            <SwiperSlide key={index}>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid lg:grid-cols-12 gap-8 items-start"
              >
                <div className="lg:col-span-4 relative group">
                  <div className="relative rounded-2xl overflow-hidden">
                    <img
                      className="w-full aspect-[3/4] object-cover transform 
                               transition-transform duration-700 group-hover:scale-110"
                      src={feedback.avatar}
                      loading="lazy"
                      alt={feedback.customerName}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                </div>

                <div className="lg:col-span-8 lg:pl-8">
                  <div className="relative">
                    <div className="lg:absolute -left-8 lg:-left-12 top-0 text-8xl text-main-color/20">
                      "
                    </div>

                    <div className="space-y-6 relative pl-0 xl:pl-12 md:pl-4">
                      <p className="text-gray-400 text-base lg:text-17 leading-relaxed">
                        {feedback.content1}
                      </p>
                      {feedback.content2 && (
                        <p className="text-gray-400 text-base lg:text-17 leading-relaxed">
                          {feedback.content2}
                        </p>
                      )}
                      {feedback.content3 && (
                        <p className="text-gray-400 text-base lg:text-17 leading-relaxed">
                          {feedback.content3}
                        </p>
                      )}

                      <div className="pt-8 mt-8 border-t border-white/10">
                        <h3 className="text-main-color font-medium text-lg mb-1">
                          {feedback.customerName}
                        </h3>
                        <p className="text-gray-400">{feedback.from}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom navigation buttons */}
        <div className="flex justify-end gap-4 mt-12">
          <button
            onClick={() => swiperInstance.current?.slidePrev()}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center
                     transition-all duration-300 hover:bg-main-color hover:border-main-color cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => swiperInstance.current?.slideNext()}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center
                     transition-all duration-300 hover:bg-main-color hover:border-main-color cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Endorsements;
