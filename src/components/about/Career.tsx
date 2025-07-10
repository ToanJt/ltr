"use client";
import { AnimatedNumber } from "../motion-primitives/animated-number";
import { useInView } from "motion/react";
import { useRef, useState } from "react";
import { Icon } from "@iconify/react";

export default function Career() {
  const [clients, setClients] = useState(0);
  const [countries, setCountries] = useState(0);
  const [renders, setRenders] = useState(0);
  const [projects, setProjects] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref);

  if (
    isInView &&
    clients === countries &&
    countries === renders &&
    renders === projects &&
    projects === 0
  ) {
    setClients(45);
    setCountries(12);
    setRenders(5000);
    setProjects(500);
  }
  // const statItem =
  //   "flex items-center justify-between w-full relative group backdrop-blur-sm border-b border-white/10 last:border-b-0";
  // const statNumber =
  //   "lg:text-8xl sm:text-7xl text-4xl font-heading-test font-normal tracking-tighter";
  // const statTitle =
  //   "lg:text-[38px] sm:text-3xl text-2xl sofia-pro tracking-wide";
  const iconStyle =
    "lg:text-6xl text-4xl text-black transition-all duration-500 group-hover:text-black group-hover:scale-125";
  return (
    <div className="container mx-auto md:px-16 px-4 lg:mb-24 mb-16 md:mt-24 mt-16">
      <h1 className="2xl:text-6xl md:text-5xl sm:text-4xl text-3xl mb-16 text-center sofia-medium">
        <span className="relative text-transparent bg-clip-text bg-black">
          We Are Proud To Have Achieved
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-[rgb(241,94,34)] to-transparent"></div>
        </span>
      </h1>
      <div className="relative 2xl:pb-0 lg:pb-20 md:pb-32 sm:pb-10 pb-20 sm:mb-0 mb-60">
        <img
          className="md:px-20 px-8 pt-12 w-full opacity-20"
          src="../../assets/images/logo-gray.png"
          alt=""
        />
        <div className="absolute top-0 w-full z-50">
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-center justify-between 2xl:px-40 md:px-20 px-6 xl:py-12 md:py-8 py-6 backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 group">
              <div className="flex items-center mb-2 sm:mb-0">
                <AnimatedNumber
                  value={clients}
                  springOptions={{
                    bounce: 0,
                    duration: 2000,
                  }}
                  className="2xl:text-8xl xl:text-7xl lg:text-6xl md:text-5xl sm:text-4xl text-4xl font-heading-test font-normal bg-clip-text text-transparent bg-black"
                />
                <Icon icon="material-symbols:add" className={iconStyle} />
              </div>
              <h1 className="2xl:text-[38px] xl:text-3xl lg:text-2xl md:text-xl sm:text-lg text-xl sofia-pro text-transparent bg-clip-text bg-main-color transition-all duration-300">
                Clients
              </h1>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[rgb(241,94,34)] to-transparent z-10"></div>
          </div>

          <div className="relative">
            <div
              ref={ref}
              className="flex flex-col sm:flex-row items-center justify-between 2xl:px-40 md:px-20 px-6 xl:py-12 md:py-8 py-6 backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 group"
            >
              <h1 className="2xl:text-[38px] xl:text-3xl lg:text-2xl md:text-xl sm:text-lg text-xl sofia-pro text-transparent bg-clip-text bg-main-color transition-all duration-300 order-2 sm:order-1 mt-2 sm:mt-0">
                Countries
              </h1>
              <div className="flex items-center order-1 sm:order-2">
                <AnimatedNumber
                  value={countries}
                  springOptions={{
                    bounce: 0,
                    duration: 2000,
                  }}
                  className="2xl:text-8xl xl:text-7xl lg:text-6xl md:text-5xl sm:text-4xl text-4xl font-heading-test font-normal bg-clip-text text-transparent bg-black"
                />
                <Icon icon="material-symbols:add" className={iconStyle} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[rgb(241,94,34)] to-transparent z-10"></div>
          </div>

          <div className="relative">
            <div className="flex flex-col sm:flex-row items-center justify-between 2xl:px-40 md:px-20 px-6 xl:py-12 md:py-8 py-6 backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 group">
              <div className="flex items-center mb-2 sm:mb-0">
                <AnimatedNumber
                  value={renders}
                  springOptions={{
                    bounce: 0,
                    duration: 2000,
                  }}
                  className="2xl:text-8xl xl:text-7xl lg:text-6xl md:text-5xl sm:text-4xl text-4xl font-heading-test font-normal bg-clip-text text-transparent bg-black"
                />
                <Icon icon="material-symbols:add" className={iconStyle} />
              </div>
              <h1 className="2xl:text-[38px] xl:text-3xl lg:text-2xl md:text-xl sm:text-lg text-xl sofia-pro text-transparent bg-clip-text bg-main-color transition-all duration-300">
                Renders
              </h1>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[rgb(241,94,34)] to-transparent z-10"></div>
          </div>

          <div className="relative">
            <div className="flex flex-col sm:flex-row items-center justify-between 2xl:px-40 md:px-20 px-6 xl:py-12 md:py-8 py-6 backdrop-blur-sm bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 group">
              <h1 className="2xl:text-[38px] xl:text-3xl lg:text-2xl md:text-xl sm:text-lg text-xl sofia-pro text-transparent bg-clip-text bg-main-color transition-all duration-300 order-2 sm:order-1 mt-2 sm:mt-0">
                Projects
              </h1>
              <div className="flex items-center order-1 sm:order-2">
                <AnimatedNumber
                  value={projects}
                  springOptions={{
                    bounce: 0,
                    duration: 2000,
                  }}
                  className="2xl:text-8xl xl:text-7xl lg:text-6xl md:text-5xl sm:text-4xl text-4xl font-heading-test font-normal bg-clip-text text-transparent bg-black"
                />
                <Icon icon="material-symbols:add" className={iconStyle} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
