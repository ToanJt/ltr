import { useRef } from "react";
import "../styles/textParticles.css";

export default function TextParticles() {
  const magicContainer = useRef<HTMLDivElement>(null);

  return (
    <section className="relative w-screen">
      <div id="magic" ref={magicContainer}></div>
    </section>
  );
}
