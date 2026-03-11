import { useEffect, useRef } from "react";
import "../styles/textParticles.css";

// Declare global types for Three.js
declare global {
  interface Window {
    THREE: any;
    textParticlesEnv: any;
    initTextParticles: () => void;
  }
}

export default function TextParticles() {
  const magicContainer = useRef<HTMLDivElement>(null);
  const environmentRef = useRef<any>(null);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;

    const initTextParticles = async () => {
      // Wait for Three.js to be available
      if (typeof window === "undefined" || !window.THREE) {
        checkInterval = setInterval(() => {
          if (typeof window !== "undefined" && window.THREE) {
            if (checkInterval) clearInterval(checkInterval);
            initTextParticles();
          }
        }, 100);
        return;
      }

      // Check if element exists
      const container = document.querySelector("#magic");
      if (!container) {
        return;
      }

      // Check if already initialized
      if (window.textParticlesEnv || environmentRef.current) {
        return;
      }

      // Import and initialize script
      try {
        // Manually trigger initialization if function is available
        if (window.initTextParticles) {
          window.initTextParticles();
        }

        // Check if initialized after a delay
        setTimeout(() => {
          const env = window.textParticlesEnv;
          if (env) {
            environmentRef.current = env;
          }
        }, 500);
      } catch (error) {
        console.error("Failed to load text-particles script:", error);
      }
    };

    // Start initialization after component mounts
    const timer = setTimeout(() => {
      initTextParticles();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, []);

  return (
    <section className="relative w-screen">
      <div
        id="magic"
        ref={magicContainer}
        style={{ width: "100%", minHeight: "400px" }}
      ></div>
    </section>
  );
}
