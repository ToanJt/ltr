import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { LoadableComponent } from "../../functions/interface";
import "../../styles/services.css";

interface Service {
  title: string;
  description: string;
  image: string;
  type: string;
  stats: {
    projects: number;
    rating: number;
  };
}

const Services = ({ onLoad }: LoadableComponent) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add a small delay to ensure all assets are loaded
    const timer = setTimeout(() => {
      onLoad?.();
    }, 100);

    return () => clearTimeout(timer);
  }, [onLoad]);

  const services: Service[] = [
    {
      title: "Exterior Rendering",
      description:
        "Stunning architectural visualizations that bring your exterior designs to life",
      image: "/assets/images/exterior-min.jpg",
      type: "exterior",
      stats: {
        projects: 150,
        rating: 4.9,
      },
    },
    {
      title: "Interior Rendering",
      description:
        "Transform interior spaces into photorealistic 3D environments",
      image: "/assets/images/pov5-min.jpg",
      type: "interior",
      stats: {
        projects: 200,
        rating: 4.8,
      },
    },
    {
      title: "360° Rendering",
      description:
        "Immersive 360-degree visualizations for complete spatial experience",
      image: "/assets/images/POV3_OPTIONAL-min.jpg",
      type: "360",
      stats: {
        projects: 80,
        rating: 4.9,
      },
    },
    {
      title: "Animation",
      description:
        "Dynamic architectural animations that tell your project's story",
      image: "/assets/images/POV2-min.jpg",
      type: "animation",
      stats: {
        projects: 100,
        rating: 4.7,
      },
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("service-animate");
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    const serviceElements = document.querySelectorAll(".service-box");
    serviceElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-vr-light-gray lg:pt-24 pt-16 pb-24 overflow-hidden">
      <section className="container w-full mx-auto">
        <div className="h-full lg:px-16 px-8 mx-0 grid-cols-1 md:gap-10 gap-6">
          <div className="flex flex-col items-center lg:mb-16 mb-12">
            <p className="uppercase sofia-pro text-15 text-gray-600 tracking-widest sm:mb-5 mb-2">
              Our Services
            </p>

            <h1 className="2xl:text-6xl md:text-5xl text-4xl text-center sofia-medium">
              What We Offer
            </h1>
          </div>

          <div className="w-full h-full grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6">
            {services.map((service, index) => (
              <div key={index} className="service-box rounded-xl">
                <div className="relative h-[450px] rounded-xl overflow-hidden cursor-pointer">
                  <div className="image-container absolute inset-0">
                    <img
                      className="w-full h-full object-cover"
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                    />
                  </div>

                  <div className="overlay absolute inset-0 z-10"></div>
                  <div className="overlay absolute inset-0 z-10"></div>

                  <div className="content absolute inset-0 z-20 p-6 flex flex-col justify-end">
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {service.title}
                    </h3>

                    <p className="description text-gray-200 text-sm mb-4">
                      {service.description}
                    </p>

                    <button
                      onClick={() => navigate(`/projects/`)}
                      className="btn w-full py-3 px-6 rounded-lg text-white 
                               text-sm font-medium tracking-wide"
                    >
                      Explore {service.title}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
};

export default Services;
