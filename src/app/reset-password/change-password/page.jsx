// "use client"
// import LoginTwo from "@/sections/LoginTwo";
// import Image from "next/image";
// import { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// export default function ChangePassword() {
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [message, setMessage] = useState("");

//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token"); // ✅ extract token from URL

//   const API = process.env.NEXT_PUBLIC_API;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setMessage("");
    
//     if (newPassword !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await fetch(`${API}/api/auth/reset-password?token=${token}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ password: newPassword }),
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Password reset failed");
//       }

//       const data = await res.json();
//       setMessage(data.message || "Password changed successfully!");

//       // ✅ Redirect after success
//       setTimeout(() => {
//         router.push("/login");
//       }, 2000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 h-screen overflow-hidden">
//       {/* Left Section */}
//       <div className="w-full h-full flex items-center justify-center bg-white px-4">
//         <div className="w-full max-w-md flex flex-col justify-center items-start">
//           <Image
//             src="/station-logo.png"
//             alt="Logo"
//             width={200}
//             height={140}
//           />

//           <h1 className="mt-10 text-4xl font-bold text-[#323130] text-center">
//             Create Password
//           </h1>
//           <p className="text-md text-gray-500 text-center">
//             Enter a strong password for your account
//           </p>

//           <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 w-full">
//             {/* New Password */}
//             <div className="relative flex flex-col">
//               <label className="text-sm font-bold text-[#323130]">New password</label>
//               <input
//                 type="password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 placeholder="********"
//                 className="pl-2 border-[1.6px] rounded-md h-[43px] w-full focus:border-blue-600 outline-none"
//                 style={{ letterSpacing: "0.5em" }}
//                 required
//               />
//             </div>

//             {/* Confirm Password */}
//             <div className="relative flex flex-col">
//               <label className="text-sm font-bold text-[#323130]">Confirm new password</label>
//               <input
//                 type="password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 placeholder="********"
//                 className="pl-2 border-[1.6px] rounded-md h-[43px] w-full focus:border-blue-600 outline-none"
//                 style={{ letterSpacing: "0.5em" }}
//                 required
//               />
//             </div>

//             {/* Error & Success Messages */}
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//             {message && <p className="text-green-500 text-sm">{message}</p>}

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-blue-600 flex justify-center items-center rounded-md font-semibold text-white h-[45px] hover:bg-blue-500 transition"
//             >
//               {loading ? "Saving..." : "Save and Login"}
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* Right Section */}
//       <div className="hidden md:flex w-full h-full">
//         <LoginTwo />
//       </div>
//     </div>
//   );
// }

"use client"
import LoginTwo from "@/sections/LoginTwo";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Separate component that uses useSearchParams
function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const API = process.env.NEXT_PUBLIC_API;

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");
    
    if (!token) {
      setError("Reset token is missing");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/auth/reset-password?token=${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Password reset failed");
      }

      const data = await res.json();
      setMessage(data.message || "Password changed successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col justify-center items-start">
      <Image
        src="/station-logo.png"
        alt="Logo"
        width={200}
        height={140}
      />

      <h1 className="mt-10 text-4xl font-bold text-[#323130] text-center">
        Create Password
      </h1>
      <p className="text-md text-gray-500 text-center">
        Enter a strong password for your account
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 w-full">
        {/* New Password */}
        <div className="relative flex flex-col">
          <label className="text-sm font-bold text-[#323130]">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="********"
            className="pl-2 border-[1.6px] rounded-md h-[43px] w-full focus:border-blue-600 outline-none"
            style={{ letterSpacing: "0.5em" }}
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="relative flex flex-col">
          <label className="text-sm font-bold text-[#323130]">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="********"
            className="pl-2 border-[1.6px] rounded-md h-[43px] w-full focus:border-blue-600 outline-none"
            style={{ letterSpacing: "0.5em" }}
            required
          />
        </div>

        {/* Error & Success Messages */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 flex justify-center items-center rounded-md font-semibold text-white h-[45px] hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save and Login"}
        </button>
      </form>
    </div>
  );
}

// Main component with Suspense boundary
export default function ChangePassword() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen overflow-hidden">
      {/* Left Section */}
      <div className="w-full h-full flex items-center justify-center bg-white px-4">
        <Suspense fallback={
          <div className="w-full max-w-md flex items-center justify-center">
            <p>Loading...</p>
          </div>
        }>
          <ChangePasswordForm />
        </Suspense>
      </div>

      {/* Right Section */}
      <div className="hidden md:flex w-full h-full">
        <LoginTwo />
      </div>
    </div>
  );
}
