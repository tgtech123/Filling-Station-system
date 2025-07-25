// app/profile/page.jsx or pages/profile.jsx
'use client';
import React from 'react';
import ProfilePage from './ProfilePage';

const dummyProfile = {
  fullName: "Oboh ThankGod",
  position: "Attendant - Flourish Station",
  currentSales: "234,560",
  targetSales: "60,000,000",
  firstName: "Oboh",
  lastName: "ThankGod",
  email: "oboh@example.com",
  phone: "08012345678",
  employeeId: "2345335",
  startDate: "12/12/2025",
  shiftType: "One-Day",
  responsibilities: "Fuel sales, fuel tickets and fuel tallies",
  payFrequency: "Monthly",
  avgAmount: "₦250,000",
  monthlyTarget: "₦60,000,000",
};

export default function ProfilePageTwo() {
  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <ProfilePage profileData={dummyProfile} />
    </div>
  );
}
