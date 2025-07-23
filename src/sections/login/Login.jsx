'use client'
import React, { useState } from 'react'
import { FiEyeOff } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import LoginTwo from '../LoginTwo';

const Login = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className='flex flex-col md:flex-row h-screen overflow-hidden'>
      {/* Left - Form Section - Fixed */}
      <div className='w-full md:w-[510px] flex items-center justify-center bg-white'>
        <div className='w-full max-w-md'>
          <img src="/station-logo.png" alt="logo" className='h-10 mb-8' />

          <h1 className='text-2xl font-bold text-[#323130]'>Login to Flourish Station</h1>
          <p className='text-sm text-gray-500'>Login to access your customized dashboard</p>

          <form className='flex flex-col gap-4 mt-6'>
            
            {/* Email */}
            <div className='relative flex flex-col'>
              <label className='text-sm font-bold text-[#323130]'>Email</label>
              <input
                type="text"
                placeholder='username123@gmail.com'
                className='pl-4 border-[1.6px] rounded-md w-full h-[43px] focus:border-blue-600 outline-none'
              />
            </div>

            {/* Password */}
            <div className='relative flex flex-col'>
              <label className='text-sm font-bold text-[#323130]'>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder='Enter password'
                onChange={(e) => setPassword(e.target.value)}
                className='pl-4 border-[1.6px] rounded-md w-full h-[43px] outline-none focus:border-blue-600'
              />
              {showPassword ? (
                <FiEye
                  onClick={handleShowPassword}
                  size={22}
                  className='absolute top-[30px] right-3 text-gray-400 cursor-pointer'
                />
              ) : (
                <FiEyeOff
                  onClick={handleShowPassword}
                  size={22}
                  className='absolute top-[30px] right-3 text-gray-500 cursor-pointer'
                />
              )}
            </div>

            {/* Remember Me */}
            <div className='flex items-center gap-3'>
              <input
                type="checkbox"
                className='text-blue-600 accent-blue-600 focus:ring-0'
              />
              <label className='font-semibold text-sm'>Remember me?</label>
            </div>

            {/* Sign In Button */}
            <button className='bg-blue-600 rounded-md font-semibold text-white h-[45px] hover:bg-blue-500 transition'>
              Sign In
            </button>

            {/* Forgot Password */}
            <p className='flex place-content-center text-sm font-semibold text-gray-500'>
              Forgotten Password?{' '}
              <span className='text-blue-600 ml-2 cursor-pointer hover:text-blue-950'>
                Reset Here
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* Right Section - Scrollable LoginTwo */}
      <div className='flex-1 overflow-y-auto'>
        <LoginTwo/>
      </div>
    </div>
  );
};

export default Login;





// 'use client'
// import React, { useState } from 'react'
// import { FiEyeOff } from "react-icons/fi";
// import { FiEye } from "react-icons/fi";
// import LoginTwo from '../LoginTwo';




// const Login = () => {
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const handleShowPassword = () => setShowPassword(!showPassword);

//   return (
//     <div className='flex p-20 gap-8 justify-center items-center  '>
//       {/* Left - Form Section */}
//       <div className='w-full md:w-[450px]'>
//         <div className='leading-7'>
//           <img src="/station-logo.png" alt="logo" className='h-10 mb-8' />

//           <h1 className='text-2xl font-bold text-[#323130]'>Login to Flourish Station</h1>
//           <p className='text-sm text-gray-500'>Login to access your customized dashboard</p>

//           <form className='flex flex-col gap-4 mt-6'>
            
//             {/* Email */}
//             <div className='relative flex flex-col'>
//               <label className='text-sm font-bold text-[#323130]'>Email</label>
//               <input
//                 type="text"
//                 placeholder='username123@gmail.com'
//                 className='pl-4 border-[1.6px] rounded-md w-full h-[43px] focus:border-blue-600 outline-none'
//               />
//             </div>

//             {/* Password */}
//             <div className='relative flex flex-col'>
//               <label className='text-sm font-bold text-[#323130]'>Password</label>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 placeholder='Enter password'
//                 onChange={(e) => setPassword(e.target.value)}
//                 className='pl-4 border-[1.6px] rounded-md w-full h-[43px] outline-none focus:border-blue-600'
//               />
//               {showPassword ? (
//                 <FiEye
//                   onClick={handleShowPassword}
//                   size={22}
//                   className='absolute top-[30px] right-3 text-gray-400 cursor-pointer'
//                 />
//               ) : (
//                 <FiEyeOff
//                   onClick={handleShowPassword}
//                   size={22}
//                   className='absolute top-[30px] right-3 text-gray-500 cursor-pointer'
//                 />
//               )}
//             </div>

//             {/* Remember Me */}
//             <div className='flex items-center gap-3'>
//               <input
//                 type="checkbox"
//                 className='text-blue-600 accent-blue-600 focus:ring-0'
//               />
//               <label className='font-semibold text-sm'>Remember me?</label>
//             </div>

//             {/* Sign In Button */}
//             <button className='bg-blue-600 rounded-md font-semibold text-white h-[45px] hover:bg-blue-500 transition'>
//               Sign In
//             </button>

//             {/* Forgot Password */}
//             <p className=' flex place-content-center text-sm font-semibold text-gray-500'>
//               Forgotten Password?{' '}
//               <span className='text-blue-600 ml-2 cursor-pointer hover:text-blue-950'>
//                 Reset Here
//               </span>
//             </p>
//           </form>
//         </div>
//       </div>

//       {/* Right Section - Optional */}
//       <div className='flex-1 overflow-y-auto'>
//               <LoginTwo/>
//       </div>
//     </div>
//   );
// };

// export default Login;