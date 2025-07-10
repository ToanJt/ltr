// App.tsx or MainLayout.tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./App.css"; // CSS cho .hidden-preloader và cursor
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import ProjectDetails from "./pages/ProjectDetails";
import SEO from "./components/SEO";

const App = () => {
  // const [isLoading, setIsLoading] = useState(true);
  // const location = useLocation();

  const bigBallRef = useRef<HTMLDivElement>(null);
  const smallBallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const $bigBall = bigBallRef.current;
    const $smallBall = smallBallRef.current;
    const $hoverables = document.querySelectorAll(".hoverable");

    const onMouseMove = (e: MouseEvent) => {
      if ($bigBall && $smallBall) {
        gsap.to($bigBall, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.4,
        });
        gsap.to($smallBall, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
        });
      }
    };

    const onMouseHover = () => {
      if ($bigBall) {
        gsap.to($bigBall, { scale: 3, duration: 0.3 });
      }
    };

    const onMouseHoverOut = () => {
      if ($bigBall) {
        gsap.to($bigBall, { scale: 1, duration: 0.3 });
      }
    };

    document.body.addEventListener("mousemove", onMouseMove);
    $hoverables.forEach((el) => {
      el.addEventListener("mouseenter", onMouseHover);
      el.addEventListener("mouseleave", onMouseHoverOut);
    });

    // startLoading();

    return () => {
      document.body.removeEventListener("mousemove", onMouseMove);
      $hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseHover);
        el.removeEventListener("mouseleave", onMouseHoverOut);
      });
    };
  }, []);

  // useEffect(() => {
  //   startLoading();
  // }, [location.pathname]);

  // const startLoading = () => {
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 1500);
  // };

  return (
    <div className="">
      <SEO />
      {/* Cursor */}
      <div className="cursor">
        <div ref={bigBallRef} className="cursor__ball cursor__ball--big fixed">
          <svg height="30" width="30">
            <circle cx="15" cy="15" r="12" strokeWidth="0" />
          </svg>
        </div>
        <div
          ref={smallBallRef}
          className="cursor__ball cursor__ball--small fixed"
        >
          <svg height="10" width="10">
            <circle cx="5" cy="5" r="4" strokeWidth="0" />
          </svg>
        </div>
      </div>

      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project-details/:id" element={<ProjectDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
