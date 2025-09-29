"use client"

import LoginTwo from "@/sections/LoginTwo";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function CodePage() {
       const [email, setEmail] = useState("");
       const userEmail = "uzonnamdi31@gmail.com";
   
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen overflow-hidden">
      <div className="w-full h-full flex items-center justify-center bg-white px-4">
              <div className="w-full max-w-md flex flex-col justify-center items-start">
                  <Image
                    src="/station-logo.png"
                    alt='Logo'
                    width={200}
                    height={140}
                  />
      
                <h1 className="mt-10 text-4xl font-bold text-[#323130] text-center">Reset Password</h1>
                 <p className="text-md text-gray-500 text-center">
                  Enter code sent to <span className="text-[#0080ff]">{userEmail}</span>
                </p>
      
      
                <form  className="flex flex-col gap-4 mt-6 w-full">
                  
                  <div className="relative flex flex-col">
                    <label className="text-sm font-bold text-[#323130]">Code</label>
                    <input
                      type="number"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="06475"
                      className="pl-2 border-[1.6px] rounded-md h-[43px] w-full focus:border-blue-600 outline-none"
                      style={{ "letter-spacing": "0.8em"}}
                      required
                    />
                  </div>
      
      
                  {/* Sign In Button */}
                   <Link href="/reset-password/change-password" type='submit' className="bg-blue-600 flex justify-center items-center rounded-md font-semibold text-white h-[45px] hover:bg-blue-500 transition">
                    Submit
                  </Link> 
      
                  {/* Forgot Password */}
                  <p className="flex justify-center text-sm font-semibold text-gray-500">
                    Have account?{" "}
                    <Link href="/login" className="text-blue-600 ml-2 cursor-pointer hover:text-blue-950">
                      Login Here
                    </Link>
                  </p>
                </form>
              </div>
            </div>
      <div className="hidden md:flex w-full h-full">
        <LoginTwo />
      </div> 
      {/* hi */}
    </div>
  );
}
