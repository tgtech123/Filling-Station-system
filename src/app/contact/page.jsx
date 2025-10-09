import { Mail, MapPin, Phone, Send } from "lucide-react";
import Image from "next/image";
import fuelPumpImg from "../../../public/twemoji_fuel-pump.png";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Contact() {
  const teamData = [
    {
      id: 1,
      img: "#",
      name: "Oboh ThankGod",
      instaLink: "https://instagram.com/d-sentiment-guy",
      linkedInLink: "https://linkedin.com/d-sentiment-guy",
      twitterLink: "https://twitter.com/Utdgsentiment",
    },
    {
      id: 2,
      img: "#",
      name: "Nnamdi Uzoigwe",
      instaLink: "https://instagram.com/d-sentiment-guy",
      linkedInLink: "https://linkedin.com/d-sentiment-guy",
      twitterLink: "https://twitter.com/d-sentiment-guy",
    },
    {
      id: 3,
      img: "#",
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
          <span className="text-[1.5rem] font-semibold text-orange-400">We’re Here to Help!</span>
        <p className="text-[0.5rem] text-center lg:text-[1.125rem] text-[#454545]">
          Have questions, feedback, or need assistance with our <span className="text-[1.45rem] font-semibold text-[#0080ff] pr-2">Filling Station <br /> Management System?</span>  
          Reach out to us anytime, our support team is ready <br />
          to respond promptly and ensure you get the help you need.
        </p>
      </header>

      {/* form */}
      <form className="bg-white p-6 mb-20 rounded-[24px] flex flex-col lg:flex-row items-center w-full gap-4">
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

        <div className="grid grid-cols-1 w-full lg:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold">First name</p>
            <input
              type="text"
              className="border-2 border-[#d1d1d1] rounded-[8px] p-2 w-full"
            />
          </div>
          <div>
            <p className="font-semibold">Last name</p>
            <input
              type="text"
              className="border-2 border-[#d1d1d1] rounded-[8px] p-2 w-full"
            />
          </div>
          <div>
            <p className="font-semibold">Email address</p>
            <input
              type="text"
              className="border-2 border-[#d1d1d1] rounded-[8px] p-2 w-full"
            />
          </div>
          <div>
            <p className="font-semibold">Phone number</p>
            <input
              type="text"
              className="border-2 border-[#d1d1d1] rounded-[8px] p-2 w-full"
            />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <p className="font-semibold">Your message</p>
            <textarea className="border-2 border-[#d1d1d1] h-auto min-h-[200px] rounded-[8px] p-2 w-full"></textarea>
          </div>
          <div className="col-span-1 lg:col-span-2 flex justify-end w-full">
            <button className="bg-[#0080ff] hover:bg-[#1273d4] cursor-pointer text-white py-3 px-10 rounded-[10px] flex items-center gap-2">
              Send Message
              <Send />
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
