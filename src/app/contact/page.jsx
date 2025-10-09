"use client"
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Image from "next/image";
import fuelPumpImg from "../../../public/twemoji_fuel-pump.png";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa"; // ✅ Spinner icon from react-icons

export default function Contact() {
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
      const response = await fetch("http://localhost:5000/api/contactus", {
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
      instaLink: "https://instagram.com/d-sentiment-guy",
      linkedInLink: "https://linkedin.com/d-sentiment-guy",
      twitterLink: "https://twitter.com/Utdgsentiment",
    },
    {
      id: 2,
      name: "Nnamdi Uzoigwe",
      instaLink: "https://instagram.com/d-sentiment-guy",
      linkedInLink: "https://linkedin.com/d-sentiment-guy",
      twitterLink: "https://twitter.com/d-sentiment-guy",
    },
    {
      id: 3,
      name: "Emmanuel Kawekwune",
      instaLink: "https://instagram.com/d-sentiment-guy",
      linkedInLink: "https://linkedin.com/d-sentiment-guy",
      twitterLink: "https://twitter.com/d-sentiment-guy",
    },
  ];

  return (
    <div className="bg-[#f8f8f8] px-4 sm:px-6 lg:px-40">
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
        className="bg-white p-6 mb-20 rounded-[24px] flex flex-col lg:flex-row items-center w-full gap-4"
      >
        <div className="bg-[#0080ff] h-auto min-h-[500px] w-full lg:min-h-[600px] relative text-white rounded-[24px] p-6">
          <div>
            <h2 className="text-2xl mb-4 font-semibold">Contact Information</h2>
            <p className="text-gray-100">Say something to start a live chat</p>
          </div>

          <div className="mt-20 text-gray-100 flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <Phone />
              <p>+234 7068690589</p>
            </div>
            <div className="flex gap-4 items-center">
              <Mail />
              <p>oboh.thankgod1@gmail.com</p>
            </div>
            <div className="flex gap-4 items-center">
              <MapPin />
              <p>Km 2 Airport Road, Rukpokwu, Port Harcourt, Rivers State</p>
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
            <input
              type="text"
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

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {teamData.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center justify-center"
            >
              <div className="bg-[#d9d9d9] h-[150px] w-[150px] rounded-full"></div>
              <h3 className="my-4 font-semibold text-xl text-[#737373]">
                {item.name}
              </h3>
              <div className="flex gap-3 text-2xl text-[#ffaf51] font-semibold">
                <a href={item.instaLink}>
                  <FaInstagram />
                </a>
                <a href={item.twitterLink}>
                  <FaXTwitter />
                </a>
                <a href={item.linkedInLink}>
                  <FaLinkedin />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
