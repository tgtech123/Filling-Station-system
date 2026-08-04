"use client"
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Image from "next/image";
import fuelPumpImg from "../../../public/twemoji_fuel-pump.png";
import { FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import NumericInput from "@/components/inputs/NumericInput";
import { FaSpinner } from "react-icons/fa";
import usePlatformStore from "@/store/usePlatformStore";

export default function Contact() {
  const { settings, loading: settingsLoading, fetchPublicSettings } = usePlatformStore();

  useEffect(() => {
    fetchPublicSettings();
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const BACKEND = process.env.NEXT_PUBLIC_API || "https://fueldesk-station-server.onrender.com";
      const response = await fetch(`${BACKEND}/api/contactus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("✅ Message sent successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          message: "",
        });
      } else {
        toast.error(data.message || "❌ Something went wrong!");
      }
    } catch (error) {
      toast.error("⚠️ Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const teamData = [
    {
      id: 1,
      name: "Oboh ThankGod",
      img: "/obohT-1.jpeg",
      instaLink: "https://instagram.com/d-sentiment-guy",
      linkedInLink: "https://linkedin.com/d-sentiment-guy",
      twitterLink: "https://twitter.com/Utdgsentiment",
    },
    {
      id: 2,
      name: "Nnamdi Uzoigwe",
      img: null,
      instaLink: "https://instagram.com/d-sentiment-guy",
      linkedInLink: "https://linkedin.com/d-sentiment-guy",
      twitterLink: "https://twitter.com/d-sentiment-guy",
    },
    {
      id: 3,
      name: "Emmanuel Kawekwune",
      img: null,
      instaLink: "https://instagram.com/d-sentiment-guy",
      linkedInLink: "https://linkedin.com/d-sentiment-guy",
      twitterLink: "https://twitter.com/d-sentiment-guy",
    },
  ];

  const getInitials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const whatsappNumber = (settings?.contactPhone || "+234 7068690589").replace(/\D/g, "");

  return (
    <div className="bg-[#f8f8f8] dark:bg-gray-950 px-4 sm:px-6 lg:px-40">
      {/* header */}
      <header className="flex flex-col py-10 items-center justify-center">
        <h1 className="font-semibold mb-2 text-center text-[#454545] text-[34px] lg:text-[54px]">
          Contact Us
        </h1>
        <span className="text-[1.5rem] font-semibold text-orange-400">
          We’re Here to Help!
        </span>
        <p className="text-[1rem] text-center lg:text-[1.125rem] text-[#454545]">
          Have questions, feedback, or need assistance with our{" "}
          <span className="lg:text-[1.45rem] text-[1rem] font-semibold text-[#0080ff] pr-2">
            Filling Station <br /> Management System?
          </span>
          Reach out to us anytime, our support team is ready <br />
          to respond promptly and ensure you get the help you need.
        </p>
      </header>

      {/* form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 mb-20 rounded-[24px] flex flex-col lg:flex-row items-center w-full gap-4"
      >
        <div className="bg-[#0080ff] h-auto min-h-[500px] w-full lg:min-h-[600px] relative text-white rounded-[24px] p-6">
          <div>
            <h2 className="text-2xl mb-4 font-semibold">Contact Information</h2>
            <p className="text-gray-100">Say something to start a live chat</p>
          </div>

          <div className="mt-20 text-gray-100 flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <Phone />
              {settingsLoading && !settings ? (
                <div className="h-4 w-32 bg-blue-400/40 rounded animate-pulse" />
              ) : (
                <p>{settings?.contactPhone || "+234 7068690589"}</p>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <Mail />
              {settingsLoading && !settings ? (
                <div className="h-4 w-44 bg-blue-400/40 rounded animate-pulse" />
              ) : (
                <p>{settings?.contactEmail || "info@fueldesks.com"}</p>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <MapPin />
              {settingsLoading && !settings ? (
                <div className="h-4 w-56 bg-blue-400/40 rounded animate-pulse" />
              ) : (
                <p>{settings?.contactAddress || "Km 2 Airport Road, Rukpokwu, Port Harcourt, Rivers State"}</p>
              )}
            </div>
          </div>

          <div className="absolute bottom-0">
            <Image
              src={fuelPumpImg}
              height={200}
              width={200}
              alt="fuel pump img"
            />
          </div>
        </div>

        {/* form inputs */}
        <div className="grid grid-cols-1 w-full lg:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold">First name</p>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="border-2 border-[#d1d1d1] rounded-[8px] p-2 w-full"
            />
          </div>
          <div>
            <p className="font-semibold">Last name</p>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="border-2 border-[#d1d1d1] rounded-[8px] p-2 w-full"
            />
          </div>
          <div>
            <p className="font-semibold">Email address</p>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border-2 border-[#d1d1d1] rounded-[8px] p-2 w-full"
            />
          </div>
          <div>
            <p className="font-semibold">Phone number</p>
            <NumericInput
              variant="tel"
              maxLength={11}
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="border-2 border-[#d1d1d1] rounded-[8px] p-2 w-full"
            />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <p className="font-semibold">Your message</p>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="border-2 border-[#d1d1d1] h-auto min-h-[200px] rounded-[8px] p-2 w-full"
            ></textarea>
          </div>
          <div className="col-span-1 lg:col-span-2 flex justify-end w-full">
            <button
              type="submit"
              disabled={loading}
              className={`bg-[#0080ff] hover:bg-[#1273d4] text-white py-3 px-10 rounded-[10px] flex items-center gap-2 ${
                loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin text-white" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Reach out */}
      <div className="flex flex-col pb-40 justify-center items-center">
        <div>
          <h4 className="text-center font-semibold text-2xl text-[#454545] mb-2">
            Reach out to our expertise
          </h4>
          <p className="text-center text-[#454545]">
            Functional team behind the success of your station
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          {teamData.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow p-6"
            >
              <div className="relative h-[150px] w-[150px] rounded-full overflow-hidden ring-4 ring-orange-100 dark:ring-gray-600 shadow-md">
                {item.img ? (
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-[#0080ff] to-[#66b3ff]">
                    {getInitials(item.name)}
                  </div>
                )}
              </div>
              <h3 className="my-4 font-semibold text-xl text-[#737373] dark:text-gray-200">
                {item.name}
              </h3>
              <div className="flex gap-4 text-2xl text-[#ffaf51]">
                <a
                  href={item.instaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.name} on Instagram`}
                  className="hover:text-[#0080ff] hover:scale-110 transition-transform"
                >
                  <FaInstagram />
                </a>
                <a
                  href={item.twitterLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.name} on X`}
                  className="hover:text-[#0080ff] hover:scale-110 transition-transform"
                >
                  <FaXTwitter />
                </a>
                <a
                  href={item.linkedInLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.name} on LinkedIn`}
                  className="hover:text-[#0080ff] hover:scale-110 transition-transform"
                >
                  <FaLinkedin />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp floating button */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=Hello%2C%20I%20need%20help%20with%20your%20Filling%20Station%20Management%20System`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 group"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        <div className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full shadow-xl transition-all group-hover:scale-110">
          <FaWhatsapp size={28} />
        </div>
        <span className="absolute right-[calc(100%+10px)] bottom-3 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
}
