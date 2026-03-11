import { motion } from "framer-motion";
import type { LoadableComponent } from "../../functions/interface";
import { useEffect } from "react";

const CompanyStrengths = ({ onLoad }: LoadableComponent) => {
  useEffect(() => {
    // Add a small delay to ensure all assets are loaded
    const timer = setTimeout(() => {
      onLoad?.();
    }, 100);

    return () => clearTimeout(timer);
  }, [onLoad]);

  return (
    <section className="bg-vr-light-gray relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5"></div>
      <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-main-color/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-main-color/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto md:pb-32 pb-16 lg:px-16 px-8 relative">
        <div className="flex flex-col items-center lg:mb-16 mb-12">
          <h1 className="2xl:text-6xl md:text-5xl text-4xl text-center sofia-medium">
            Our Core Strengths Driving Success
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 xl:gap-8 gap-6 2xl:mx-20">
          {strengths.map((strength, index) => (
            <motion.div
              key={index}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={{
                initial: { y: 30, opacity: 0 },
                animate: {
                  y: 0,
                  opacity: 1,
                  transition: { delay: index * 0.2 },
                },
              }}
              className="group relative bg-white rounded-xl p-8 hover:shadow-2xl transition-all duration-300
                         border border-gray-100 hover:border-main-color/20
                         transform hover:scale-[1.02]"
            >
              <div className="relative z-10">
                <div
                  className="w-14 h-14 rounded-xl bg-main-color/5 flex items-center justify-center
                              group-hover:bg-main-color/10 transition-colors duration-300"
                >
                  <img
                    src={strength.icon}
                    className="h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-110"
                    alt={strength.title}
                  />
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-4 group-hover:text-main-color transition-colors duration-300">
                  {strength.title}
                </h3>

                <p className="text-gray-600 leading-relaxed text-[15px]">
                  {strength.description}
                </p>
              </div>

              {/* Decorative corner */}
              <div
                className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100
                            transition-opacity duration-300"
              >
                <div
                  className="absolute top-0 right-0 w-full h-full bg-main-color/5 
                              rounded-br-2xl rounded-tl-[100px]"
                ></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const strengths = [
  {
    title: "Detail-Oriented Professionalism",
    description:
      "With a meticulous workflow and unwavering attention to detail, we are committed to delivering the highest quality products that meet the most demanding client requirements.",
    icon: "/assets/icons/search.png",
  },
  {
    title: "Optimized Cost-Effectiveness",
    description:
      "Leveraging the resources of Vietnam, we provide competitive 3D services, enabling you to maximize your budget without compromising on exceptional quality.",
    icon: "/assets/icons/rocket.png",
  },
  {
    title: "Great Communication",
    description:
      "We prioritize clear communication and understand your needs, ensuring information is conveyed accurately and providing 24/7 support to address any concerns.",
    icon: "/assets/icons/user.png",
  },
];

export default CompanyStrengths;
