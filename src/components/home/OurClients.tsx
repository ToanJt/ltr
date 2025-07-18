import { useEffect } from "react";
import type { LoadableComponent } from "../../functions/interface";
import { InfiniteSlider } from "../../components/motion-primitives/infinite-slider";
import "../../styles/ourclients.css";

const OurClients = ({ onLoad }: LoadableComponent) => {
  useEffect(() => {
    // Add a small delay to ensure all assets are loaded
    const timer = setTimeout(() => {
      onLoad?.();
    }, 100);

    return () => clearTimeout(timer);
  }, [onLoad]);

  return (
    <main className=" mx-auto overflow-hidden container lg:pb-24 pb-10 lg:mt-24 mt-16">
      <div className="flex flex-col items-center lg:mb-24 sm:mb-16 mb-8">
        <p className="uppercase sofia-pro text-15 text-center text-gray-600 tracking-widest sm:mb-5 mb-2">
          With over 45 clients and 500 completed projects
        </p>
        <h1 className="2xl:text-6xl md:text-5xl text-4xl text-center sofia-medium">
          Our Featured Clients
        </h1>
      </div>
      <div className="slider-container container !w-screen mx-auto overflow-hidden px-16">
        {/* <div className="slide-decoration-left"></div> */}
        <InfiniteSlider speedOnHover={20}>
          <div>
            <img src="../../assets/images/logo-1.png" alt="" />
          </div>
          <div>
            <img src="../../assets/images/logo-2.png" alt="" />
          </div>
          <div>
            <img src="../../assets/images/logo-3.png" alt="" />
          </div>
          <div>
            <img src="../../assets/images/logo-4.png" alt="" />
          </div>
          <div>
            <img src="../../assets/images/logo-5.png" alt="" />
          </div>
          <div>
            <img className="" src="../../assets/images/logo-1.png" alt="" />
          </div>
          <div>
            <img src="../../assets/images/logo-2.png" alt="" />
          </div>
          <div>
            <img src="../../assets/images/logo-3.png" alt="" />
          </div>
          <div>
            <img src="../../assets/images/logo-4.png" alt="" />
          </div>
          <div>
            <img src="../../assets/images/logo-5.png" alt="" />
          </div>
        </InfiniteSlider>
        {/* <div className="slide-decoration-right"></div> */}
      </div>
    </main>
  );
};

export default OurClients;
