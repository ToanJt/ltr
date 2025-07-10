import { useState, useEffect } from "react";
import TeamSquad from "../components/about/TeamSquad";
import Career from "../components/about/Career";
import { onTop } from "../functions/functions";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { motion } from "framer-motion";

const About = () => {
  const [teamActive, setTeamActive] = useState(false);

  useEffect(() => {
    onTop("instant");
    getIsActive();
  }, []);

  const getIsActive = async () => {
    const dataRef = doc(db, "actives", "isActiveTeam");
    const data = await getDoc(dataRef);
    if (data.exists()) {
      setTeamActive(data.data().isactive);
    }
  };

  return (
    <div className="w-screen">
      <div className="relative bg-black w-full lg:py-40 md:py-32 py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(241,94,34,0.05),transparent_70%)]" />
          <div className="absolute inset-0 grid grid-cols-24 gap-2 opacity-[0.02]">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="h-full w-[1px] bg-white transform translate-x-full"
              />
            ))}
          </div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-3 md:grid-cols-5 grid-cols-1 lg:gap-16 gap-10"
          >
            <div className="lg:col-span-1 md:col-span-2 relative group">
              {/* Refined decorative elements for image */}
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#F15E22]/10 to-white/5 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <motion.img
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.6 }}
                className="relative w-full rounded-lg shadow-xl border border-white/5"
                src="../assets/images/avt.png"
                alt="About us"
              />
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-10 h-10">
                <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-[#F15E22]/50 to-transparent"></div>
                <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-[#F15E22]/50 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 right-0 w-10 h-10">
                <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-[#F15E22]/50 to-transparent"></div>
                <div className="absolute bottom-0 right-0 h-[1px] w-full bg-gradient-to-l from-[#F15E22]/50 to-transparent"></div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 md:col-span-3 w-full h-full justify-center text-light-dark flex flex-col items-start space-y-8"
            >
              <div className="relative">
                <h1 className="2xl:text-7xl xl:text-6xl lg:text-5xl md:text-4xl text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 sofia-medium uppercase">
                  About us
                </h1>
                <div className="absolute -bottom-4 left-0 h-[1px] w-24 bg-gradient-to-r from-[#F15E22] to-transparent"></div>
              </div>

              <div className="space-y-6">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-white/90 text-justify 2xl:text-17 lg:text-17 text-15 leading-relaxed"
                >
                  Founded by Trung Le in 2021, LTR Studio provides high-quality
                  rendering services worldwide for architects, designers, real
                  estate investors, developers, and marketing agencies.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-white/80 text-justify 2xl:text-17 lg:text-17 text-15 leading-relaxed"
                >
                  We have a team of experienced 3D artists, architects, and
                  designers who work seamlessly together to deliver visually
                  compelling and technically accurate renderings that
                  communicate design ideas clearly and strikingly, ensuring
                  complete customer satisfaction.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-white/70 text-justify 2xl:text-17 lg:text-17 text-15 leading-relaxed"
                >
                  Let us know if you have an exciting project and would like to
                  collaborate!
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Career />
      {teamActive && <TeamSquad />}
    </div>
  );
};

export default About;
