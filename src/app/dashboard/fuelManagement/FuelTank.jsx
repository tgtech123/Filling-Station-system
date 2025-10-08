"use client";
import { useEffect, useState } from "react";
import DisplayCard from "@/components/Dashboard/DisplayCard";

export default function FuelTank() {
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API;

  useEffect(() => {
    const fetchTanks = async () => {
      try {

        const token = localStorage.getItem("token");
        console.log("Login token:", token);
        if (!token) {
          setError("No token found");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/tank`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Error fetching tanks: ${text}`);
        }

        const data = await response.json();
        setTanks(data.data || []); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTanks();
  }, []);

  // optionally format level display
  const getTankLevel = (percent) => {
    if (percent >= 70) return "High";
    if (percent >= 40) return "Good";
    return "Low";
  };

  return (
    <DisplayCard>
      {loading ? (
        <p>Loading tanks...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : tanks.length === 0 ? (
        <p>No tanks available</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {tanks.map((tank) => {
            const percentFull = `${Math.round(
              (tank.currentLevel / tank.limit) * 100
            )}%`;

            const tankLevel = getTankLevel(
              (tank.currentLevel / tank.limit) * 100
            );

            return (
              <div
                key={tank._id}
                className="bg-white p-4 rounded-[12px] border-2 border-gray-300"
              >
                <header className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className="bg-gray-300 h-14 w-14 rounded-full flex items-center justify-center">
                      <img src="/tank.png" alt="tank" />
                    </div>
                    <div>
                      <h5 className="mb-1 text-xl font-semibold">
                        {tank.title}
                      </h5>
                      <p>{tank.fuelType}</p>
                    </div>
                  </div>

                  {tankLevel === "Good" ? (
                    <button className="bg-[#dcd2ff] py-1 px-2 font-medium rounded-[8px] text-sm text-[#7f27ff]">
                      Good
                    </button>
                  ) : tankLevel === "High" ? (
                    <button className="bg-[#b2ffb4] py-1 px-2 font-medium rounded-[8px] text-sm text-[#04910c]">
                      High
                    </button>
                  ) : (
                    <button className="rounded-[8px] bg-[#ffdcdc] text-[#f00] text-sm py-1 px-2 font-medium">
                      Low
                    </button>
                  )}
                </header>

                <div className="w-[70%] bg-gray-200 h-[1px] my-8"></div>

                <section>
                  <div className="mb-2 flex justify-between items-center">
                    <p className="text-sm font-semibold">Level</p>
                    <p className="text-sm font-medium">
                      {tank.currentLevel || 0} Ltrs
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="h-6 w-full bg-gray-200 rounded-[30px]">
                    <div
                      style={{ width: percentFull }}
                      className={`relative h-6 rounded-[30px] ${
                        tankLevel === "High"
                          ? "bg-[#0080ff]"
                          : tankLevel === "Low"
                          ? "bg-[#f00]"
                          : "bg-[#e27d00]"
                      }`}
                    >
                      <div className="absolute bg-[#dad6d6] h-8 w-8 rounded-full top-[-5px] right-[-2px]"></div>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-between text-gray-500 items-center">
                    <p className="text-sm font-medium">{percentFull} Full</p>
                    <p className="text-sm font-medium">
                      Capped: {tank.limit} Litres
                    </p>
                  </div>
                </section>
              </div>
            );
          })}
        </div>
      )}
    </DisplayCard>
  );
}
