import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import { Icon } from "@iconify/react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import "../styles/header.css";

type Info = {
  email: string;
  facebookLink: string;
  instagramLink: string;
  whatsappLink: string;
};

const Header = () => {
  const [isActiveNavbar, setIsActiveNavbar] = useState(false);
  const [info, setInfo] = useState<Info>({
    email: "",
    facebookLink: "",
    instagramLink: "",
    whatsappLink: "",
  });
  const hasInitializedRef = useState(false)[0];

  const location = useLocation();

  const setDefaultAnimation = () => {
    gsap
      .timeline()
      .set(".item", { x: -100, opacity: 0 })
      .set(".item-right1", { x: 200, opacity: 0 })
      .set(".item-right2", { x: 250, opacity: 0 });
  };

  const activeHandle = () => {
    setIsActiveNavbar(!isActiveNavbar);
  };

  useEffect(() => {
    setIsActiveNavbar(false);
  }, [location.pathname]);

  useEffect(() => {
    setDefaultAnimation();
    if (isActiveNavbar) {
      gsap
        .timeline()
        .to(
          ".item",
          {
            opacity: 1,
            x: 0,
            duration: 0.25,
            stagger: 0.25,
          },
          "+=0.25"
        )
        .to(
          ".item-right1",
          {
            opacity: 1,
            x: 0,
            delay: 1,
            duration: 0.5,
            stagger: 0.25,
          },
          "-=0.75"
        )
        .to(
          ".item-right2",
          {
            opacity: 1,
            x: 0,
            delay: 0.25,
            duration: 0.5,
            stagger: 0.25,
          },
          "-=0.25"
        );
    }
  }, [isActiveNavbar]);

  // Defer Firebase fetch to not block LCP
  useEffect(() => {
    if (hasInitializedRef) return;

    const initializeHeader = () => {
      const fetchInfo = async () => {
        try {
          const snapshot = await getDocs(collection(db, "contacts"));
          snapshot.forEach((doc) => {
            const data = doc.data();
            setInfo({
              email: data.email,
              facebookLink: data.facebook,
              instagramLink: data.instagram,
              whatsappLink: data.whatsapp,
            });
          });
        } catch (error) {
          console.error("Error fetching header info:", error);
        }
      };

      fetchInfo();
      setDefaultAnimation();
    };

    // Defer initialization using requestIdleCallback
    if ("requestIdleCallback" in window) {
      requestIdleCallback(initializeHeader);
    } else {
      setTimeout(initializeHeader, 1000);
    }
  }, [hasInitializedRef]);

  return (
    <div className="relative">
      <div className="fixed lg:px-16 px-8 mix-blend-exclusion text-white z-60 top-0 left-0 right-0 container mx-auto h-28 flex items-center justify-between">
        <Link to="/" className="logo-link">
          <img
            src="/assets/images/logo.png"
            className="lg:h-14 md:h-10 h-8 transition-transform duration-300 hover:scale-105"
            alt="Logo"
          />
        </Link>
        <div
          onClick={activeHandle}
          className="lg:hidden flex relative cursor-pointer hover:text-main-color transition-colors duration-300"
        >
          <i className="text-2xl fa-solid fa-bars"></i>
        </div>
        <nav className="lg:flex hidden gap-8 text-17 font-heading">
          <Link
            to="/"
            className={`nav-link relative ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            Home
          </Link>
          <Link
            to="/projects"
            className={`nav-link relative ${
              location.pathname === "/projects" ? "active" : ""
            }`}
          >
            Projects
          </Link>
          <Link
            to="/about"
            className={`nav-link relative ${
              location.pathname === "/about" ? "active" : ""
            }`}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className={`nav-link relative ${
              location.pathname === "/contact" ? "active" : ""
            }`}
          >
            Contact
          </Link>
          <div className="flex items-center gap-4 ml-4 social-icons">
            <a
              href={info.facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link"
            >
              <Icon
                icon="ant-design:facebook-filled"
                className="text-2xl opacity-50 hover:opacity-100 text-white hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1"
              />
            </a>
            <a
              href={info.instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link"
            >
              <Icon
                icon="ri:instagram-fill"
                className="text-2xl opacity-50 hover:opacity-100 text-white hover:text-pink-600 transition-all duration-300 transform hover:-translate-y-1"
              />
            </a>
            <a
              href={info.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-link"
            >
              <Icon
                icon="mingcute:whatsapp-fill"
                className="text-2xl opacity-50 hover:opacity-100 text-white hover:text-green-600 transition-all duration-300 transform hover:-translate-y-1"
              />
            </a>
          </div>
        </nav>
      </div>

      {/* Mobile Navbar */}
      <div
        className={`${
          isActiveNavbar ? "!flex" : "hidden"
        } bg-black px-4 lg:!hidden items-center fixed z-10 left-0 right-0 top-0 bottom-0`}
      >
        <div className="container mx-auto grid md:grid-cols-5 text-white">
          <div className="px-4 md:col-span-3 h-screen flex flex-col justify-center">
            <div className="flex flex-col gap-8 text-xl font-heading">
              <Link
                className={`item text-xl mobile-nav-link ${
                  location.pathname === "/" ? "active" : ""
                }`}
                to="/"
              >
                Home
              </Link>
              <Link
                className={`item text-xl mobile-nav-link ${
                  location.pathname === "/projects" ? "active" : ""
                }`}
                to="/projects"
              >
                Projects
              </Link>
              <Link
                className={`item text-xl mobile-nav-link ${
                  location.pathname === "/about" ? "active" : ""
                }`}
                to="/about"
              >
                About Us
              </Link>
              <Link
                className={`item text-xl mobile-nav-link ${
                  location.pathname === "/contact" ? "active" : ""
                }`}
                to="/contact"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="md:col-span-2 border-l border-zinc-600 md:flex hidden flex-col justify-center gap-8 pl-8">
            <div className="hover-content">
              <p className="item-right1 text-xl mb-2 text-[#727272]">
                Contact Us via
              </p>
              <div className="flex item-right2 gap-1 items-center">
                <p className="text-2xl hover:text-main-color transition-colors duration-300">
                  {info.email}
                </p>
              </div>
            </div>
            <div className="hover-content">
              <p className="item-right1 text-xl mb-2 text-[#727272]">
                Have an Idea?
              </p>
              <div className="flex item-right2 gap-2 items-center group cursor-pointer">
                <p className="text-2xl group-hover:text-main-color transition-colors duration-300">
                  Send it to Us
                </p>
                <Icon
                  icon="lucide:move-right"
                  className="text-white group-hover:text-main-color group-hover:translate-x-2 transition-all duration-300"
                  width="2em"
                  height="2em"
                />
              </div>
            </div>
            <div className="hover-content">
              <p className="item-right1 text-xl mb-2 text-[#727272]">
                Want to see more?
              </p>
              <div className="flex item-right2 gap-2 items-center group">
                <Link
                  className="text-2xl !text-white group-hover:text-main-color transition-colors duration-300"
                  to="/projects"
                >
                  Go to Portfolio
                </Link>
                <Icon
                  icon="lucide:move-right"
                  className="text-white group-hover:text-main-color group-hover:translate-x-2 transition-all duration-300"
                  width="2em"
                  height="2em"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
