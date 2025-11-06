// // app/profile/page.jsx or pages/profile.jsx
// 'use client';
// import React from 'react';
// import EditProfilePage from './EditProfilePage';

// const dummyProfile = {
//   fullName: "Oboh ThankGod",
//   position: "Attendant - Flourish Station",
//   currentSales: "234,560",
//   targetSales: "60,000,000",
//   firstName: "Oboh",
//   lastName: "ThankGod",
//   email: "oboh@example.com",
//   phone: "08012345678",
//   employeeId: "2345335",
//   startDate: "12/12/2025",
//   shiftType: "One-Day",
//   responsibilities: "Fuel sales, fuel tickets and fuel tallies",
//   payFrequency: "Monthly",
//   avgAmount: "₦250,000",
//   monthlyTarget: "₦60,000,000",
// };

// export default function EditProfilePageTwo() {
//   return (
//     <div className="min-h-screen p-4 bg-gray-100">
//       <EditProfilePage profileData={dummyProfile} />
//     </div>
//   );
// }


// app/dashboard/editPage/page.jsx (or wherever this file is)
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditProfilePage from './EditProfilePage';

export default function EditProfilePageTwo() {
  const [profileData, setProfileData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get logged-in user data from localStorage
    try {
      const userString = localStorage.getItem("user");
      
      if (userString) {
        const user = JSON.parse(userString);
        console.log("📦 Loaded user data for edit:", user);
        
        // Map user data to profile format
        const mappedProfile = {
          id: user.id || user._id || user.employeeId,
          fullName: `${user.firstName} ${user.lastName}`,
          position: user.role || "Attendant",
          currentSales: user.currentSales || "0",
          targetSales: user.targetSales || "60,000,000",
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          employeeId: user.employeeId || user.id,
          startDate: user.startDate || "N/A",
          shiftType: user.shiftType || "N/A",
          responsibilities: user.responsibilities || "N/A",
          payFrequency: user.payFrequency || "Monthly",
          avgAmount: user.avgAmount || "N/A",
          monthlyTarget: user.monthlyTarget || "N/A",
          profileImage: user.profileImage || null,
        };
        
        setProfileData(mappedProfile);
      } else {
        console.log("❌ No user found in localStorage");
        router.push("/login");
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      router.push("/login");
    }
  }, [router]);

  // Show loading state while fetching user data
  if (!profileData) {
    return (
      <div className="min-h-screen p-4 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <EditProfilePage profileData={profileData} />
    </div>
  );
}