"use client";
import { useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Fuel, Users, RotateCcw, Star, ChevronRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import useFuelLoyaltyStore from "@/store/useFuelLoyaltyStore";

function TierBadge({ tier }) {
  const map = {
    Bronze:   { bg: "bg-orange-100",  text: "text-orange-700"  },
    Silver:   { bg: "bg-gray-100",    text: "text-gray-600"    },
    Gold:     { bg: "bg-yellow-100",  text: "text-yellow-700"  },
    Platinum: { bg: "bg-purple-100",  text: "text-purple-700"  },
  };
  const s = map[tier] || map.Bronze;
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{tier}</span>
  );
}

const TILES = [
  { label: "Customers",   desc: "Register & manage loyalty customers", href: "/dashboard/loyalty/customers",   icon: Users,      color: "from-blue-500 to-blue-600" },
  { label: "Redemptions", desc: "Approve or reject redemption requests", href: "/dashboard/loyalty/redemptions", icon: RotateCcw,  color: "from-green-500 to-emerald-600" },
  { label: "Audit",       desc: "Verify loyalty vs pump meter data",    href: "/dashboard/loyalty/audit",       icon: ShieldAlert,color: "from-amber-500 to-orange-500"  },
  { label: "Settings",    desc: "Configure points rates and prices",    href: "/dashboard/loyalty/settings",    icon: Star,       color: "from-purple-500 to-violet-600" },
];

export default function LoyaltyOverviewPage() {
  const { customers, total, redemptions, fetchCustomers, fetchRedemptions, settings, fetchSettings } = useFuelLoyaltyStore();

  useEffect(() => {
    fetchCustomers({ limit: 5 });
    fetchRedemptions({ status: "pending", limit: 5 });
    fetchSettings();
  }, []);

  const pending = redemptions.filter(r => r.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Fuel className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Fuel Loyalty Program</h1>
            <p className="text-sm text-gray-500">
              {settings?.isActive ? (
                <span className="text-green-600 font-medium">Active — {settings.pointsPerLitre} pt/litre</span>
              ) : (
                <span className="text-red-500 font-medium">Inactive — enable in Settings</span>
              )}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Customers</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{total}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pending Redemptions</p>
            <p className={`text-3xl font-bold mt-1 ${pending > 0 ? "text-amber-600" : "text-gray-800"}`}>{pending}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Min to Redeem</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{settings?.minPointsToRedeem ?? "—"} <span className="text-base font-normal text-gray-400">pts</span></p>
          </div>
        </div>

        {/* Navigation tiles */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {TILES.map(({ label, desc, href, icon: Icon, color }) => (
            <Link key={href} href={href}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
              <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              {label === "Redemptions" && pending > 0 && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {pending} pending
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Recent customers */}
        {customers.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <p className="font-bold text-gray-700 text-sm">Recent Customers</p>
              <Link href="/dashboard/loyalty/customers" className="flex items-center gap-1 text-blue-500 text-xs font-semibold hover:text-blue-700">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {customers.slice(0, 5).map(c => (
                <Link key={c._id} href={`/dashboard/loyalty/customers/${c._id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {(c.name || c.plateNumber || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.name || c.plateNumber || c.customerId}</p>
                    <p className="text-xs text-gray-400">{c.phone || c.plateNumber || ""}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <TierBadge tier={c.tier} />
                    <p className="text-xs text-blue-600 font-bold mt-1">{c.totalPoints?.toLocaleString()} pts</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
