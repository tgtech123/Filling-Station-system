'use client'
import React, { useState } from 'react'
import { FiEyeOff } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import LoginTwo from '../LoginTwo';
import Link from 'next/link';
import Image from 'next/image';

const Login = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
   const [email, setEmail] = useState("")
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState(null)
   const [message, setMessage] =useState("")



   const API = process.env.NEXT_PUBLIC_API

   const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("")
    setLoading(true)
    setError(null)

  
    try {
      const res = await fetch(`${API}/api/auth/login`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({email, password}),
      })
      
      // console.log("res", res.json())
        
      if(!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed")
      }

      const data = await res.json()
      console.log("res:", data?.token)
      if(res.status === 200 ) {
        setMessage(data.message)
      }

      // Redirect to dashboard
      // window.location.href = "/dashboard"
    } catch (err) {
      setError(err.message)
      
    }finally{
      setLoading(false)
    }
  
  
  }
  const handleShowPassword = () =>{
    setShowPassword(!showPassword);
  } 

  return (
   <div className="grid grid-cols-1 lg:grid-cols-2 h-screen overflow-hidden">
      {/* Left - Form Section */}
      <div className="w-full h-full flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md flex flex-col justify-center items-center">
            <Image
              src="/station-logo.png"
              alt='Logo'
              width={200}
              height={140}
            />

          <h1 className="text-4xl font-bold text-[#323130] text-center">Login to Flourish Station</h1>
          <p className="text-md text-gray-500 text-center">Login to access your customized dashboard</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6 w-full">
            {/* Email */}
            <div className="relative flex flex-col">
              <label className="text-sm font-bold text-[#323130]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username123@gmail.com"
                className="pl-4 border-[1.6px] rounded-md h-[43px] w-full focus:border-blue-600 outline-none"
                required
              />
            </div>

            
            {/* Password */}
            <div className="relative flex flex-col">
              <label className="text-sm font-bold text-[#323130]">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
                className="pl-4 border-[1.6px] rounded-md w-full h-[43px] outline-none focus:border-blue-600"
                required
              />
              <div onClick={handleShowPassword} className='absolute top-[1.875rem] right-3 text-neutral-400 cursor-pointer  '>
              {showPassword ? <FiEyeOff  size={22}/>: <FiEye size={22} /> }
              </div>

            </div>
            {/* login error message */}
            {error && (
              <p className='text-red-500 text-sm text-start'>{error}</p>
            )}
            {message && (
              <p className='text-green-500 text-sm text-start'>{message}</p>
            )}

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input type="checkbox" className="text-blue-600 accent-blue-600 focus:ring-0" />
              <label className="font-semibold text-sm">Remember me?</label>
            </div>


            {/* Sign In Button */}
            <button type='submit' disabled={loading}  className="bg-blue-600 rounded-md font-semibold text-white h-[45px] hover:bg-blue-500 transition">
              {loading ? "Signing in..." : "Sign In"}
              {/* <Link href="/dashboard">Sign In</Link> */}
            </button>

            {/* Forgot Password */}
            <p className="flex justify-center text-sm font-semibold text-gray-500">
              Forgotten Password?{" "}
              <Link href="/reset-password" className="text-blue-600 ml-2 cursor-pointer hover:text-blue-950">
                Reset Here
              </Link>
            </p>
          </form>
        </div>
      </div>

        {/* Right - Full Image Section (No Scroll) */}
        <div className="hidden md:flex w-full h-full">
          <LoginTwo />
        </div>
</div>

  );
};

export default Login;



// 'use client'
// import React, { useState } from 'react'
// import { FiEyeOff, FiEye } from "react-icons/fi";
// import LoginTwo from '../LoginTwo';
// import Link from 'next/link';

// const Login = () => {
//   const [email, setEmail] = useState("");           // ✅ new
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);    // ✅ new
//   const [error, setError] = useState(null);         // ✅ new

//   const handleShowPassword = () => setShowPassword(!showPassword);

//   // ✅ fetch login function
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch("http://localhost:5000/api/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include", // include cookies if needed
//         body: JSON.stringify({ email, password }),
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Login failed");
//       }

//       const data = await res.json();
//       console.log("Login success:", data);

//       // e.g. redirect to dashboard if success
//       window.location.href = "/dashboard";

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 h-screen overflow-hidden">
//       {/* Left - Form Section */}
//       <div className="w-full h-full flex items-center justify-center bg-white px-4">
//         <div className="w-full max-w-md flex flex-col justify-center items-center">
//           <img src="/station-logo.png" alt="logo" className="h-10 mb-8" />

//           <h1 className="text-4xl font-bold text-[#323130] text-center">Login to Flourish Station</h1>
//           <p className="text-sm text-gray-500 text-center">Login to access your customized dashboard</p>

//           <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6 w-full">
//             {/* Email */}
//             <div className="relative flex flex-col">
//               <label className="text-sm font-bold text-[#323130]">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="username123@gmail.com"
//                 className="pl-4 border-[1.6px] rounded-md h-[43px] w-full focus:border-blue-600 outline-none"
//                 required
//               />
//             </div>

//             {/* Password */}
//             <div className="relative flex flex-col">
//               <label className="text-sm font-bold text-[#323130]">Password</label>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter password"
//                 className="pl-4 border-[1.6px] rounded-md w-full h-[43px] outline-none focus:border-blue-600"
//                 required
//               />
//               {showPassword ? (
//                 <FiEye
//                   onClick={handleShowPassword}
//                   size={22}
//                   className="absolute top-[30px] right-3 text-gray-400 cursor-pointer"
//                 />
//               ) : (
//                 <FiEyeOff
//                   onClick={handleShowPassword}
//                   size={22}
//                   className="absolute top-[30px] right-3 text-gray-500 cursor-pointer"
//                 />
//               )}
//             </div>

//             {/* Remember Me */}
//             <div className="flex items-center gap-3">
//               <input type="checkbox" className="text-blue-600 accent-blue-600 focus:ring-0" />
//               <label className="font-semibold text-sm">Remember me?</label>
//             </div>

//             {/* Error message */}
//             {error && (
//               <p className="text-red-500 text-sm text-center">{error}</p>
//             )}

//             {/* Sign In Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-blue-600 rounded-md font-semibold text-white h-[45px] hover:bg-blue-500 transition disabled:opacity-50"
//             >
//               {loading ? "Signing in..." : "Sign In"}
//             </button>

//             {/* Forgot Password */}
//             <p className="flex justify-center text-sm font-semibold text-gray-500">
//               Forgotten Password?{" "}
//               <span className="text-blue-600 ml-2 cursor-pointer hover:text-blue-950">
//                 Reset Here
//               </span>
//             </p>
//           </form>
//         </div>
//       </div>

//       {/* Right - Full Image Section */}
//       <div className="hidden md:flex w-full h-full">
//         <LoginTwo />
//       </div>
//     </div>
//   );
// };

// export default Login;
