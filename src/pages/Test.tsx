import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";

interface PreloaderProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
}

const Preloader = ({ isLoading, onLoadingComplete }: PreloaderProps) => {
  const [progress, setProgress] = useState(0);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) return;

    document.body.style.overflow = "hidden";

    // Initialize GSAP timeline
    const tl = gsap.timeline();

    // Animate logo appearance
    tl.fromTo(
      logoRef.current,
      {
        opacity: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
      }
    );

    // Simulate loading progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 100) currentProgress = 100;
      setProgress(Math.min(currentProgress, 100));

      if (currentProgress >= 100) {
        clearInterval(interval);

        // Final animation sequence
        const exitTl = gsap.timeline({
          onComplete: () => {
            setTimeout(() => {
              onLoadingComplete?.();
            }, 200);
          },
        });

        // Animate progress bar completion
        exitTl
          .to(progressBarRef.current, {
            width: "100%",
            duration: 0.5,
            ease: "power2.inOut",
          })
          .to(progressTextRef.current, {
            y: -20,
            opacity: 0,
            duration: 0.4,
          })
          .to(
            logoRef.current,
            {
              y: -30,
              opacity: 0,
              duration: 0.4,
            },
            "<"
          )
          .to(overlayRef.current, {
            y: "-100%",
            duration: 0.8,
            ease: "power2.inOut",
          });
      }
    }, 150);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = "auto";
    };
  }, [isLoading, onLoadingComplete]);

  if (!isLoading) return null;

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black"
      >
        {/* Animated background lines */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                top: `${i * 10}%`,
                left: 0,
                right: 0,
                animation: `scanline ${2 + i * 0.5}s linear infinite`,
                opacity: 0.1 + i * 0.02,
              }}
            />
          ))}
        </div>

        <div className="relative h-full flex flex-col items-center justify-center">
          {/* Logo */}
          <div ref={logoRef} className="mb-12 relative">
            <div className="text-white text-5xl font-bold tracking-wider relative z-10">
              LTR
              <div className="absolute -inset-4 bg-white/5 blur-xl rounded-full" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-48 h-[2px] bg-white/10 relative overflow-hidden">
            <div
              ref={progressBarRef}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-400"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Text */}
          <div
            ref={progressTextRef}
            className="mt-4 text-white/70 text-sm font-light tracking-wider"
          >
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
