// // app/profile/page.jsx or pages/profile.jsx
// 'use client';
// import React from 'react';
// import ProfilePage from './ProfilePage';

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

// export default function ProfilePageTwo() {
//   return (
//     <div className="min-h-screen p-4 bg-gray-100">
//       <ProfilePage profileData={dummyProfile} />
//     </div>
//   );
// }

// app/profile/page.jsx or pages/profile.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfilePage from './ProfilePage';
import ManagerSalaryCard from './ManagerSalaryCard';

export default function ProfilePageTwo() {
  const [profileData, setProfileData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        const id = user.id || user._id;
        setUserId(id);
        setIsManager(user.role === "manager");
        const mappedProfile = {
          id,
          fullName: `${user.firstName} ${user.lastName}`,
          position: user.role || "Attendant",
          currentSales: user.currentSales || "0",
          targetSales: user.targetSales || "60,000,000",
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          employeeId: user.employeeId || id,
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
        router.push("/login");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      router.push("/login");
    }
  }, [router]);

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
    <div className="min-h-screen p-4 bg-gray-100 space-y-4">
      <ProfilePage profileData={profileData} />
      {isManager && userId && <ManagerSalaryCard staffId={userId} readOnly={false} />}
    </div>
  );
}