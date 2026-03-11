import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import slugify from "slugify";
import { db } from "../config/firebaseConfig";
import { collection, getDocs, query } from "firebase/firestore";
import { onTop } from "../functions/functions";
import "../styles/projectdetails.css";
import "react-photo-album/rows.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface ProjectDetails {
  name: string;
  largeURL: string;
  thumbnailURL: string;
  widthOrigin: string;
  heightOrigin: string;
  description: string;
  client: string;
  location: string;
  year: string;
  type: string;
  size: string;
  is360: boolean;
  isAnimation: boolean;
  link360: string;
  images: string[]; // plain string array — no need to preload dimensions
}

interface Information {
  email: string;
  facebookLink: string;
  instagramLink: string;
  whatsappLink: string;
}

export default function ProjectDetail() {
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(
    null,
  );
  const [information, setInformation] = useState<Information>({
    email: "",
    facebookLink: "",
    instagramLink: "",
    whatsappLink: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(-1);
  const navigate = useNavigate();
  const { id } = useParams();

  function goBack() {
    navigate(-1);
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, "projects"));
        const querySnapshot = await getDocs(q);
        let foundProject = false;

        for (const docSnap of querySnapshot.docs) {
          if (slugify(docSnap.data().name) === id) {
            foundProject = true;
            const projectData = docSnap.data();

            // loadImageDimensions removed:
            // Previously used new Image() to measure every photo before render.
            // This preloaded ALL images immediately on page load — slow on mobile,
            // and caused "preloaded but not used" warnings on other routes.
            // yet-another-react-lightbox works fine with width/height set to
            // reasonable defaults; it re-measures lazily on its own.
            setProjectDetails({
              name: projectData.name,
              largeURL: projectData.largeURL,
              thumbnailURL: projectData.thumbnailURL,
              widthOrigin: projectData.widthOrigin,
              heightOrigin: projectData.heightOrigin,
              description: projectData.description,
              client: projectData.client,
              location: projectData.location,
              year: projectData.year,
              type: projectData.type,
              size: projectData.size,
              is360: projectData.is360,
              isAnimation: projectData.isAnimation,
              link360: projectData.link360,
              images: projectData.images || [],
            });
            break;
          }
        }

        if (!foundProject) {
          navigate("/projects");
          return;
        }

        const getInformation = await getDocs(collection(db, "contacts"));
        getInformation.forEach((item) => {
          setInformation({
            email: item.data().email,
            facebookLink: item.data().facebook,
            instagramLink: item.data().instagram,
            whatsappLink: item.data().whatsapp,
          });
        });

        onTop("instant");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  function getUrl() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    return url;
  }

  if (isLoading || !projectDetails) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-main-color/20 border-t-main-color rounded-full animate-spin" />
      </div>
    );
  }

  // Build slides for lightbox — use fallback dimensions (lightbox measures on open)
  const photos = projectDetails.images.map((src) => ({
    src,
    width: 1600,
    height: 900,
    key: src,
    alt: projectDetails.name,
  }));

  return (
    <div className="w-screen bg-white relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(241,94,34,0.03),transparent_70%)]" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid grid-cols-24 gap-2 opacity-[0.015]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="h-full w-[1px] bg-black transform translate-x-full"
            />
          ))}
        </div>
      </div>

      <div className="lg:pb-40 sm:pb-20 pb-16 lg:pt-48 md:pt-52 pt-36 container mx-auto lg:px-16 px-8 relative">
        {/* Project Title */}
        <div className="relative mb-16">
          <h1 className="md:text-6xl sm:text-5xl text-4xl sofia-medium relative inline-block">
            {projectDetails.name}
            <div className="absolute -bottom-2 left-0 w-1/2 h-px bg-gradient-to-r from-main-color to-transparent" />
            {projectDetails.is360 && (
              <span className="ml-3 inline-flex items-center px-3 py-1 text-sm bg-blue-500/10 text-blue-500 rounded-full">
                360°
              </span>
            )}
            {projectDetails.isAnimation && (
              <span className="ml-3 inline-flex items-center px-3 py-1 text-sm bg-red-500/10 text-red-500 rounded-full">
                Animation
              </span>
            )}
          </h1>
        </div>

        {/* Project Info Grid */}
        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2">
            <p className="text-lg sm:text-xl text-justify sofia-light leading-relaxed text-gray-600">
              {projectDetails.description}
            </p>
          </div>
          <div className="bg-gray-50/50 backdrop-blur-sm p-8 border-l-2 border-main-color/20">
            <div className="space-y-6">
              {[
                { label: "Client", value: projectDetails.client },
                { label: "Location", value: projectDetails.location },
                { label: "Year", value: projectDetails.year },
                { label: "Type", value: projectDetails.type },
                { label: "Size", value: projectDetails.size },
              ].map(({ label, value }) => (
                <div key={label}>
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">
                    {label}
                  </h3>
                  <p className="text-lg sofia-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Share */}
        <div className="flex items-center gap-8 py-8 border-t border-b border-gray-200">
          <span className="text-sm uppercase tracking-wider text-gray-500">
            Connect with us
          </span>
          <div className="flex gap-6">
            {[
              { href: information.facebookLink, icon: "ic:baseline-facebook" },
              { href: information.whatsappLink, icon: "ic:baseline-whatsapp" },
              { href: information.instagramLink, icon: "dashicons:instagram" },
            ].map(({ href, icon }) => (
              <a
                key={icon}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
              >
                <span className="absolute inset-0 rounded-full bg-main-color/20 opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-150" />
                <Icon
                  className="text-2xl text-gray-600 transition-all duration-300 group-hover:text-main-color relative z-10"
                  icon={icon}
                />
              </a>
            ))}
            <button onClick={getUrl} className="group relative">
              <span className="absolute inset-0 rounded-full bg-main-color/20 opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-150" />
              <Icon
                className="text-2xl text-gray-600 transition-all duration-300 group-hover:text-main-color relative z-10"
                icon="material-symbols:link"
              />
            </button>
          </div>
        </div>

        {/* 360 View */}
        {projectDetails.is360 && (
          <div className="my-20">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <iframe
                className="w-full aspect-video"
                src={projectDetails.link360}
                frameBorder="0"
                title="360 View"
              />
            </div>
          </div>
        )}

        {/* Image Grid — loading="lazy" + decoding="async", no preloading */}
        <div className="grid lg:grid-cols-2 gap-8 my-20">
          {photos.map((photo, i) => (
            <div
              key={photo.key}
              onClick={() => setIndex(i)}
              className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <Icon
                    icon="ph:arrows-out-bold"
                    className="text-2xl text-white/90"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Lightbox
          slides={photos}
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          styles={{ container: { backgroundColor: "rgba(0, 0, 0, .95)" } }}
          plugins={[Fullscreen, Thumbnails, Zoom, Download]}
        />

        {/* Back Button */}
        <button
          onClick={goBack}
          className="group flex items-center gap-3 mt-12 px-6 py-3 bg-black text-white hover:bg-main-color transition-all duration-500"
        >
          <Icon
            icon="material-symbols:arrow-back-rounded"
            className="text-2xl transition-transform duration-300 group-hover:-translate-x-1"
          />
          <span className="text-sm uppercase tracking-wider">
            Back to Projects
          </span>
        </button>
      </div>
    </div>
  );
}
