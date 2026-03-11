import { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
// import TextParticles from "../threejs/TextParticles";
import { Link } from "react-router-dom";
import Typed from "typed.js";
import { motion } from "framer-motion";
import "../styles/footer.css";

type Info = {
  email: string;
  facebookLink: string;
  instagramLink: string;
  whatsappLink: string;
};

const Footer = () => {
  const [info, setInfo] = useState<Info>({
    email: "",
    facebookLink: "",
    instagramLink: "",
    whatsappLink: "",
  });

  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isSentSuccessfully, setIsSentSuccessfully] = useState(false);
  const typedRef = useRef<HTMLSpanElement>(null);
  const typed = useRef<Typed | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = email ? validateEmail(email) : false;
    setIsValidEmail(isValid);

    if (!isValid) return;

    const customerEmail = {
      email: email.trim(),
      isRead: false,
      createAt: new Date(),
    };

    try {
      const customerDoc = doc(collection(db, "customers"));
      await setDoc(customerDoc, customerEmail);
      setIsSentSuccessfully(true);
      setEmail(""); // Clear input after successful submission
    } catch (error) {
      console.log("Failed to send Email!! " + error);
      setIsSentSuccessfully(false);
    }
  };

  const onTop = (behavior: ScrollBehavior = "smooth") => {
    window.scrollTo({
      top: 0,
      behavior,
    });
  };

  useEffect(() => {
    const fetchInfo = async () => {
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
    };
    fetchInfo();

    // Initialize typed with a delay to ensure DOM is ready
    const initTyped = () => {
      if (typedRef.current && !typed.current) {
        typed.current = new Typed(typedRef.current, {
          strings: ["make a difference.", "create beauty.", "build trust."],
          typeSpeed: 130,
          backSpeed: 130,
          loop: true,
          showCursor: true,
          cursorChar: "|",
          autoInsertCss: true,
        });
      }
    };

    // Try to initialize after a short delay
    setTimeout(initTyped, 500);

    return () => {
      if (typed.current) {
        typed.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(241,94,34,0.03),transparent_70%)]" />
      {/* <TextParticles /> */}
      <footer className="relative bg-black text-white lg:py-24 md:py-16 py-12 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          {/* Fine grid pattern */}
          <div className="absolute inset-0 grid grid-cols-24 gap-2 opacity-[0.015]">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="h-full w-[1px] bg-white transform translate-x-full"
              />
            ))}
          </div>
          <div className="absolute inset-0 grid grid-rows-12 gap-2 opacity-[0.015]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full h-[1px] bg-white" />
            ))}
          </div>

          {/* Secondary grid pattern */}
          <div className="absolute inset-0 grid grid-cols-6 gap-8 opacity-[0.02]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`sec-${i}`}
                className="h-full w-[1px] bg-white transform translate-x-full"
              />
            ))}
          </div>
          <div className="absolute inset-0 grid grid-rows-3 gap-8 opacity-[0.02]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`sec-${i}`} className="w-full h-[1px] bg-white" />
            ))}
          </div>

          {/* Main decorative lines */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[70%] bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-50" />

          {/* Corner decorations with smaller size */}
          <div className="absolute top-0 left-0 w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-main-color/30 to-transparent" />
            <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-main-color/30 to-transparent" />
          </div>
          <div className="absolute top-0 right-0 w-20 h-20">
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-main-color/30 to-transparent" />
            <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-main-color/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 w-20 h-20">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-main-color/30 to-transparent" />
            <div className="absolute bottom-0 left-0 h-full w-[1px] bg-gradient-to-t from-main-color/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 right-0 w-20 h-20">
            <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-main-color/30 to-transparent" />
            <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-main-color/30 to-transparent" />
          </div>

          {/* Subtle diagonal accents */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-[1px] h-[200%] bg-gradient-to-b from-transparent via-white/5 to-transparent transform -rotate-45 origin-top-left"
                  style={{ left: `${(i + 1) * 15}%`, opacity: 0.02 }}
                />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-[1px] h-[200%] bg-gradient-to-b from-transparent via-white/5 to-transparent transform rotate-45 origin-top-right"
                  style={{ right: `${(i + 1) * 15}%`, opacity: 0.02 }}
                />
              ))}
            </div>
          </div>

          {/* Subtle radial accents */}
          <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-main-color/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-main-color/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto lg:px-16 px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-5 grid-cols-1 lg:gap-20 gap-16 relative"
          >
            <div className="lg:col-span-3 relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="2xl:text-7xl md:text-6xl text-5xl font-heading mb-6 relative">
                  We{" "}
                  <span className="typed-container">
                    <span ref={typedRef} className="typed-text"></span>
                  </span>
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-16"
              >
                <p className="text-lg mb-6 sofia-pro text-main-color/90">
                  Subscribe to Our Newsletter
                </p>
                <div className="relative max-w-md">
                  <form onSubmit={handleSubmit} className="relative group">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-white px-6 py-4 pr-36 
                               rounded-full outline-none focus:border-main-color transition-all duration-300
                               group-hover:border-white/20 group-hover:bg-white/10"
                      placeholder="Your Email Address"
                      type="email"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 bg-main-color/90 text-white px-6 py-2 rounded-full
                               transition-all duration-300 hover:bg-main-color hover:scale-[1.02] hover:shadow-lg
                               hover:shadow-main-color/20 active:scale-[0.98]"
                    >
                      Subscribe
                    </button>
                  </form>
                  {isSentSuccessfully && isValidEmail && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-main-color flex items-center gap-2"
                    >
                      <Icon icon="ph:check-circle-fill" className="text-lg" />
                      Thank you! We'll be in touch soon.
                    </motion.p>
                  )}
                  {!isValidEmail && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500 flex items-center gap-2"
                    >
                      <Icon icon="ph:warning-circle-fill" className="text-lg" />
                      Please enter a valid email address
                    </motion.p>
                  )}
                  <p className="mt-4 text-sm text-gray-400/80">
                    Start your project today. Just leave your email, and we'll
                    contact you promptly.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-2 grid sm:grid-cols-2 grid-cols-1 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-xl mb-8 sofia-bold relative inline-block">
                  Contact
                  <span className="absolute -bottom-2 left-0 w-1/2 h-px bg-gradient-to-r from-main-color to-transparent"></span>
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/about"
                      className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                    >
                      <span className="relative overflow-hidden">
                        <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                          About Us
                        </span>
                        <span className="absolute top-full left-0 inline-block transition-transform duration-300 group-hover:-translate-y-full text-main-color">
                          About Us
                        </span>
                      </span>
                      <Icon
                        icon="material-symbols:arrow-outward"
                        className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                    >
                      <span className="relative overflow-hidden">
                        <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                          Email Us
                        </span>
                        <span className="absolute top-full left-0 inline-block transition-transform duration-300 group-hover:-translate-y-full text-main-color">
                          Email Us
                        </span>
                      </span>
                      <Icon
                        icon="material-symbols:arrow-outward"
                        className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                    >
                      <span className="relative overflow-hidden">
                        <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                          Call Us
                        </span>
                        <span className="absolute top-full left-0 inline-block transition-transform duration-300 group-hover:-translate-y-full text-main-color">
                          Call Us
                        </span>
                      </span>
                      <Icon
                        icon="material-symbols:arrow-outward"
                        className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                      />
                    </Link>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-xl mb-8 sofia-bold relative inline-block">
                  Our Projects
                  <span className="absolute -bottom-2 left-0 w-1/2 h-px bg-gradient-to-r from-main-color to-transparent"></span>
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link
                      to="/projects"
                      className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                    >
                      <span className="relative overflow-hidden">
                        <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                          Interior
                        </span>
                        <span className="absolute top-full left-0 inline-block transition-transform duration-300 group-hover:-translate-y-full text-main-color">
                          Interior
                        </span>
                      </span>
                      <Icon
                        icon="material-symbols:arrow-outward"
                        className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/projects"
                      className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                    >
                      <span className="relative overflow-hidden">
                        <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                          Exterior
                        </span>
                        <span className="absolute top-full left-0 inline-block transition-transform duration-300 group-hover:-translate-y-full text-main-color">
                          Exterior
                        </span>
                      </span>
                      <Icon
                        icon="material-symbols:arrow-outward"
                        className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/projects"
                      className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                    >
                      <span className="relative overflow-hidden">
                        <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                          360 Rendering
                        </span>
                        <span className="absolute top-full left-0 inline-block transition-transform duration-300 group-hover:-translate-y-full text-main-color">
                          360 Rendering
                        </span>
                      </span>
                      <Icon
                        icon="material-symbols:arrow-outward"
                        className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/projects"
                      className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                    >
                      <span className="relative overflow-hidden">
                        <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                          Animation
                        </span>
                        <span className="absolute top-full left-0 inline-block transition-transform duration-300 group-hover:-translate-y-full text-main-color">
                          Animation
                        </span>
                      </span>
                      <Icon
                        icon="material-symbols:arrow-outward"
                        className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                      />
                    </Link>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-24 pt-12 border-t border-white/10"
          >
            <div className="flex flex-wrap justify-between items-center gap-8">
              <div>
                <h3 className="text-xl mb-4 sofia-bold relative inline-block">
                  Get in touch
                  <span className="absolute -bottom-2 left-0 w-1/2 h-px bg-gradient-to-r from-main-color to-transparent"></span>
                </h3>
                <a
                  href={`mailto:${info.email}`}
                  className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300"
                >
                  <span className="relative overflow-hidden inline-block">
                    <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                      {info.email}
                    </span>
                    <span className="absolute top-full left-0 inline-block transition-transform duration-300 group-hover:-translate-y-full text-main-color">
                      {info.email}
                    </span>
                  </span>
                  <Icon
                    icon="material-symbols:arrow-outward"
                    className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                  />
                </a>
              </div>

              <div className="flex items-center gap-8">
                <a
                  href={info.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <span className="absolute inset-0 rounded-full bg-main-color/20 opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-150"></span>
                  <Icon
                    icon="ic:baseline-facebook"
                    className="text-2xl text-gray-400 transition-all duration-300 group-hover:text-white relative z-10"
                  />
                </a>
                <a
                  href={info.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <span className="absolute inset-0 rounded-full bg-main-color/20 opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-150"></span>
                  <Icon
                    icon="ic:baseline-whatsapp"
                    className="text-2xl text-gray-400 transition-all duration-300 group-hover:text-white relative z-10"
                  />
                </a>
                <a
                  href={info.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <span className="absolute inset-0 rounded-full bg-main-color/20 opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-150"></span>
                  <Icon
                    icon="dashicons:instagram"
                    className="text-2xl text-gray-400 transition-all duration-300 group-hover:text-white relative z-10"
                  />
                </a>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2024 TrungTeam®. All rights reserved.
              </p>
              <button
                onClick={() => onTop()}
                className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300"
              >
                <span className="relative overflow-hidden inline-block">
                  <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full">
                    Back to top
                  </span>
                  <span className="absolute top-full left-0 inline-block transition-transform duration-300 group-hover:-translate-y-full text-main-color">
                    Back to top
                  </span>
                </span>
                <Icon
                  icon="material-symbols:arrow-outward"
                  className="rotate-[-45deg] opacity-0 -translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                />
              </button>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
