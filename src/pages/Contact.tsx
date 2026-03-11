import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { onTop } from "../functions/functions";
import "../styles/contact.css";
import SEO from "../components/SEO";

interface ContactInfo {
  facebookLink: string;
  whatsappLink: string;
  instagramLink: string;
  locationEmbed: string;
  address: string;
  emailAddress: string;
  phone: string;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const [contact, setContact] = useState<ContactInfo>({
    facebookLink: "",
    whatsappLink: "",
    instagramLink: "",
    locationEmbed: "",
    address: "",
    emailAddress: "",
    phone: "",
  });

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const clearFormData = () => {
    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scriptUrl =
        "https://script.google.com/macros/s/AKfycbxGPR9rMwm2vjRYM6niuZ7AivuvQc0ja7UDJkZjGxRNBBS0-fT9rgGFnM6Itdk35J10/exec" +
        "?t=" +
        Date.now();
      await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        credentials: "omit",
        mode: "no-cors",
      });
      setIsSuccess(true);
      clearFormData();
    } catch (error: any) {
      console.log("Error: " + error.message);
    }
  };

  useEffect(() => {
    const fetchContactLinks = async () => {
      const contactLinks = await getDocs(collection(db, "contacts"));
      contactLinks.forEach((item) => {
        setContact({
          facebookLink: item.data().facebook,
          whatsappLink: item.data().whatsapp,
          instagramLink: item.data().instagram,
          locationEmbed: item.data().location,
          address: item.data().address,
          emailAddress: item.data().email,
          phone: item.data().phone,
        });
      });
    };

    fetchContactLinks();
    onTop("instant");
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <div className="">
      <SEO
        title="LTR Studio - Leading 3D Visualization & Architectural Design Studio | Contact Us"
        description="Get in touch with LTR Studio for professional 3D visualization and architectural design services. Located in Da Nang, Vietnam, we're ready to bring your vision to life."
        url="https://ltrvisuals.com/contact"
      />
      <div className="bg-black">
        <div className="relative">
          <div className="w-screen relative lg:h-[400px] md:h-[350px] h-[300px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 z-10"></div>
            <img
              className="w-full h-full bg-top object-cover lg:object-center md:object-[-200px] transform scale-105 filter brightness-90"
              src="../assets/images/bgr-contact.jpg"
              alt="Contact background"
            />
          </div>
          <div className="container lg:px-16 px-8 w-full h-full mx-auto lg:pb-20 md:pb-16 pb-10 absolute top-0 left-0 right-0 bottom-0 text-white flex flex-col justify-end z-20">
            <p className="uppercase sofia-pro text-15 tracking-widest sm:mb-5 mb-2 text-white/90">
              Let's Talk
            </p>
            <div className="flex sm:flex-row flex-col sm:items-center items-start xl:gap-20 lg:gap-6 sm:gap-12 gap-6">
              <div>
                <h1 className="2xl:text-7xl xl:text-6xl lg:text-5xl md:text-4xl text-3xl sofia-medium uppercase relative">
                  Contact
                  <div className="absolute -bottom-4 left-0 w-20 h-1 bg-gradient-to-r from-[#F15E22] to-transparent"></div>
                </h1>
              </div>
              <ul className="flex gap-6 text-2xl">
                <a
                  href={contact.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="relative p-2 rounded-full border border-white/10 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300">
                    <Icon
                      className="xl:text-3xl sm:text-2xl text-xl cursor-pointer text-white group-hover:text-[#1877F2] transition-all"
                      icon="ri:facebook-fill"
                    />
                  </div>
                </a>
                <a
                  href={contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="relative p-2 rounded-full border border-white/10 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300">
                    <Icon
                      className="xl:text-3xl sm:text-2xl text-xl cursor-pointer text-white group-hover:text-[#25D366] transition-all"
                      icon="ri:whatsapp-fill"
                    />
                  </div>
                </a>
                <a
                  href={contact.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="relative p-2 rounded-full border border-white/10 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300">
                    <Icon
                      className="xl:text-3xl sm:text-2xl text-xl cursor-pointer text-white group-hover:text-[#E4405F] transition-all"
                      icon="ri:instagram-fill"
                    />
                  </div>
                </a>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-[#FAF6F3] overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FAF6F3] to-white/80"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F15E22]/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F15E22]/20 to-transparent"></div>
        </div>
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, #F15E22 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="container mx-auto lg:px-16 px-8 lg:pt-24 pt-16 2xl:pb-36 pb-24 relative">
          <div className="flex flex-col items-center">
            <h1 className="2xl:text-6xl md:text-5xl text-4xl mb-5 text-center sofia-medium relative">
              You Have An Idea, Let Us Make It Happen!
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-[#F15E22] to-transparent"></div>
            </h1>
            <p className="uppercase sofia-pro text-15 tracking-widest mb-12 text-gray-600">
              Contact Us Via
            </p>
            <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 w-full max-w-6xl">
              {/* Email Box */}
              <div className="group relative transform transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-5">
                  <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md shadow-inner group-hover:from-[#F15E22]/40 group-hover:to-white/40 transition-all duration-300">
                    <Icon
                      icon="ri:mail-line"
                      className="text-2xl text-[#F15E22] transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="sofia-light-italic mb-2 text-gray-600/90 lg:text-base text-sm tracking-wide">
                      Trung Le - Founder
                    </p>
                    <p className="sofia-pro text-[#F15E22] font-medium transform group-hover:translate-x-1.5 transition-all duration-300 relative inline-block">
                      {contact.emailAddress}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] group-hover:w-full transition-all duration-500"></span>
                    </p>
                  </div>
                </div>
              </div>
              {/* Phone Box */}
              <div className="group relative transform transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-5">
                  <div className="p-3.5 rounded-xl backdrop-blur-md shadow-inner group-hover:from-[#F15E22]/40 group-hover:to-white/40 transition-all duration-300">
                    <Icon
                      icon="ri:phone-line"
                      className="text-2xl text-[#F15E22] transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="sofia-light-italic mb-2 text-gray-600/90 lg:text-base text-sm tracking-wide">
                      Whatsapp - Call
                    </p>
                    <p className="sofia-pro text-[#F15E22] font-medium transform group-hover:translate-x-1.5 transition-all duration-300 relative inline-block">
                      +84 {contact.phone}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] group-hover:w-full transition-all duration-500"></span>
                    </p>
                  </div>
                </div>
              </div>
              {/* Address Box */}
              <div className="group relative transform transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-5">
                  <div className="p-3.5 rounded-xl bg-white/5 backdrop-blur-md shadow-inner group-hover:from-[#F15E22]/40 group-hover:to-white/40 transition-all duration-300">
                    <Icon
                      icon="ri:map-pin-line"
                      className="text-2xl text-[#F15E22] transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="sofia-light-italic mb-2 text-gray-600/90 lg:text-base text-sm tracking-wide">
                      Address: Da Nang City, VietNam
                    </p>
                    <p className="sofia-pro transform group-hover:translate-x-1.5  text-[#F15E22] transition-all duration-300 relative inline-block">
                      {contact.address}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] group-hover:w-full transition-all duration-500"></span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto lg:px-16 px-0">
            <div className="formBox 2xl:mx-80 xl:mx-52 lg:mx-20 md:mx-20 sm:mx-0 mx-0 md:px-12 sm:px-8 px-6 md:py-12 sm:py-8 py-6 bg-white border border-gray-100 rounded-xl shadow-lg sm:mt-20 mt-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F15E22] via-[#F15E22]/50 to-transparent"></div>
              <form onSubmit={submitForm} className="relative">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex flex-col">
                    <label
                      className="lg:text-base text-sm mb-2 text-gray-700 font-medium"
                      htmlFor="name"
                    >
                      Your Name
                    </label>
                    <input
                      value={form.name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      required
                      className="lg:text-base text-sm px-4 h-12 outline-none bg-gray-50 rounded-lg border border-gray-200 focus:border-[#F15E22] transition-all duration-300"
                      type="text"
                      id="name"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      className="lg:text-base text-sm mb-2 text-gray-700 font-medium"
                      htmlFor="email"
                    >
                      Your Email
                    </label>
                    <input
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                      className="lg:text-base text-sm px-4 h-12 outline-none bg-gray-50 rounded-lg border border-gray-200 focus:border-[#F15E22] transition-all duration-300"
                      type="email"
                      id="email"
                    />
                  </div>
                </div>
                <div className="flex flex-col mt-8">
                  <label
                    className="lg:text-base text-sm mb-2 text-gray-700 font-medium"
                    htmlFor="subject"
                  >
                    Subject
                  </label>
                  <input
                    value={form.subject}
                    onChange={handleInputChange}
                    placeholder="Enter subject"
                    required
                    className="lg:text-base text-sm px-4 h-12 outline-none bg-gray-50 rounded-lg border border-gray-200 focus:border-[#F15E22] transition-all duration-300"
                    type="text"
                    id="subject"
                  />
                </div>
                <div className="flex flex-col mt-8">
                  <label
                    className="lg:text-base text-sm mb-2 text-gray-700 font-medium"
                    htmlFor="message"
                  >
                    Leave us a Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={handleInputChange}
                    placeholder="Please type your message here..."
                    required
                    className="lg:text-base text-sm px-4 py-3 outline-none bg-gray-50 rounded-lg border border-gray-200 focus:border-[#F15E22] transition-all duration-300 min-h-[120px]"
                    name="message"
                    id="message"
                    rows={5}
                  ></textarea>
                </div>
                {isSuccess && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 flex items-center gap-2">
                      <Icon icon="ri:check-line" className="text-xl" />
                      Thank you for your message, we will respond as soon as
                      possible.
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  className="mt-8 bg-[#F15E22] text-white lg:text-base text-sm hover:translate-y-1 transition-all duration-300 rounded-lg sofia-pro px-8 py-3 flex items-center gap-2 group"
                >
                  Send Message
                  <Icon
                    icon="ri:send-plane-fill"
                    className="text-xl transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </form>
            </div>
          </div>

          <div className="mt-20 rounded-xl overflow-hidden border border-gray-100 shadow-lg">
            <iframe
              className="w-full"
              src={
                contact.locationEmbed ||
                "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d300.55058601531243!2d108.223029!3d16.0102393!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421b00243fbec5%3A0x6f43f3eefab9d798!2sLTR%20Studio%20-%20Architectural%20Visualization!5e1!3m2!1svi!2s!4v1741942890088!5m2!1svi!2s"
              }
              width="600"
              height="500"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
