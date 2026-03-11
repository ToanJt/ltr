// App.tsx or MainLayout.tsx
import { useEffect, useRef, lazy, Suspense, useState } from "react";
import gsap from "gsap";
import "./App.css"; // CSS cho .hidden-preloader và cursor
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import SEO from "./components/SEO";
import Preloader from "./components/Preloader";

// Lazy load non-home pages
const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
const Footer = lazy(() => import("./components/Footer"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));

const App = () => {
  const [_, setIsLoading] = useState(true);
  const bigBallRef = useRef<HTMLDivElement>(null);
  const smallBallRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Defer cursor animations to after LCP using requestIdleCallback
    const initializeCursor = () => {
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;

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

      return () => {
        document.body.removeEventListener("mousemove", onMouseMove);
        $hoverables.forEach((el) => {
          el.removeEventListener("mouseenter", onMouseHover);
          el.removeEventListener("mouseleave", onMouseHoverOut);
        });
      };
    };

    // Defer cursor initialization to not block LCP
    if ("requestIdleCallback" in window) {
      requestIdleCallback(initializeCursor);
    } else {
      setTimeout(initializeCursor, 1000);
    }
  }, []);

  return (
    <div className="">
      <Preloader onComplete={() => setIsLoading(false)} />
      <SEO />
      {/* Cursor - hidden initially to not affect LCP */}
      <div
        className="cursor"
        style={{ opacity: 0 }}
        onLoad={() => {
          // Fade in cursor after mount
          if (bigBallRef.current?.parentElement) {
            bigBallRef.current.parentElement.style.opacity = "1";
          }
        }}
      >
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
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project-details/:id" element={<ProjectDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>

      {/* Footer lazy loaded */}
      <Suspense fallback={<div className="h-20"></div>}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default App;
