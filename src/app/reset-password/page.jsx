"use client"

import LoginTwo from "@/sections/LoginTwo";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function ResetPassword() {
  const router = useRouter();
       const [email, setEmail] = useState("");
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const [message, setMessage] = useState("");
      
      const handleResetPassword = async (e) => {
            e.preventDefault();
            setMessage("");
            setLoading(true);
            setError(null);

            try {
              const API = process.env.NEXT_PUBLIC_API;

              const res = await fetch(`${API}/api/auth/forgot-password`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
              });

              const data = await res.json();

              if (!res.ok) {
                throw new Error(data.message || "Forgot password failed");
              }

              setMessage(data.message || "Reset link sent! Check your email.");
            } catch (err) {
              setError(err.message);
            } finally {
              setLoading(false);
              setTimeout(()=>{
                setMessage("")
              }, 3000)
            }
          };

      
   
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
                <p className="text-md text-gray-500 text-center">Enter email to get a reset code sent to your mail</p>
      
                <form  className="flex flex-col gap-4 mt-6 w-full">
                  {/* Email */}
                
                  <div className="relative flex flex-col">
                    <label className="text-sm font-bold text-[#323130]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username123@gmail.com"
                      className="pl-2 border-[1.6px] rounded-md h-[43px] w-full focus:border-blue-600 outline-none"
                      required
                    />
                  </div>
                {error && <p className="text-sm text-red-600">
                    {error}
                  </p>}
                {message && <p className="text-green-600 text-sm">
                    {message}
                  </p>}
                  {/* Sign In Button */}
                   <button onClick={handleResetPassword} type='submit' className="bg-blue-600 flex justify-center items-center rounded-md font-semibold text-white h-[45px] hover:bg-blue-500 transition">
                    Reset
                  </button> 
      
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
    </div>
  );
}
