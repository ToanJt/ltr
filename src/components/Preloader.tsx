import { useEffect, useState, useRef } from "react";
import "./Preloader.css";

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const startTimeRef = useRef<number>(Date.now());
  const pageLoadedRef = useRef<boolean>(false);
  const minDisplayTime = 3000; // Minimum 3 seconds to show animation (LTR animation takes ~2.8s)

  useEffect(() => {
    // Check if page is loaded
    const checkPageLoad = () => {
      pageLoadedRef.current = true;
      // Don't hide immediately - wait for animation to complete
      checkCanHide();
    };

    // Check if we can hide preloader
    const checkCanHide = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const hasMinTimeElapsed = elapsed >= minDisplayTime;

      if (pageLoadedRef.current && hasMinTimeElapsed) {
        // Both conditions met: page loaded AND animation completed
        setTimeout(() => {
          setIsVisible(false);
          if (onComplete) {
            onComplete();
          }
        }, 500); // Delay for smooth fade out
      } else if (pageLoadedRef.current && !hasMinTimeElapsed) {
        // Page loaded but animation not done yet - wait
        const remainingTime = minDisplayTime - elapsed;
        setTimeout(() => {
          checkCanHide();
        }, remainingTime);
      }
    };

    // Listen for load event
    window.addEventListener("load", checkPageLoad);

    // Also check immediately in case page is already loaded
    if (document.readyState === "complete") {
      checkPageLoad();
    }

    // Periodic check to ensure we hide after minimum time even if page loads slowly
    const hideCheckInterval = setInterval(() => {
      if (pageLoadedRef.current) {
        checkCanHide();
      }
    }, 100);

    return () => {
      clearInterval(hideCheckInterval);
      window.removeEventListener("load", checkPageLoad);
    };
  }, [onComplete, minDisplayTime]);

  if (!isVisible) return null;

  return (
    <div className={`preloader ${!isVisible ? "preloader--hidden" : ""}`}>
      <div className="preloader__content">
        {/* Animated LTR Logo */}
        <div className="preloader__logo-animation">
          <svg
            width="600"
            height="400"
            viewBox="0 0 600 400"
            xmlns="http://www.w3.org/2000/svg"
            className="preloader__svg"
          >
            {/* Chữ L */}
            <g className="l-left">
              {/* Thanh dọc */}
              <rect x="50" y="50" width="40" height="300" />
              {/* Thanh ngang */}
              <rect x="50" y="310" width="160" height="40" />
            </g>

            {/* Chữ L ngược (theo chiều Y-X) */}
            <g className="l-right">
              {/* Thanh ngang trên */}
              <rect x="130" y="50" width="160" height="40" />
              {/* Thanh dọc */}
              <rect x="250" y="50" width="40" height="300" />
            </g>

            {/* Đường cung */}
            <path
              className="arc-path"
              d="M 330 70 L 450 70 Q 570 70, 570 165 Q 570 260, 450 260 L 400 260"
              stroke="#f15e22"
              strokeWidth="40"
              fill="none"
              strokeLinejoin="round"
            />

            {/* Chân của chữ R (hình bình hành) */}
            <path
              className="leg-shape"
              d="M 429 260 L 471 260 L 511 350 L 469 350 Z"
              fill="#f15e22"
            />
          </svg>
        </div>

        {/* Minimal loading bar */}
        <div className="preloader__loading-bar-container">
          <div className="preloader__loading-bar">
            <div className="preloader__loading-bar-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
