"use client";
import { useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Fuel, Users, RotateCcw, Star, ChevronRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import useFuelLoyaltyStore from "@/store/useFuelLoyaltyStore";
import useCurrentRole from "@/hooks/useCurrentRole";
import { MGR, MGR_ACCT_SUP, STAFF, can } from "./roles";

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

/**
 * `roles` mirrors what the SERVER actually permits, not what looks tidy.
 *
 * An attendant may register customers, award points and raise a redemption
 * request; approving one, changing the rates and running the audit are the
 * manager's. Showing them the full set and letting the API refuse was the
 * behaviour before this — the tile was inviting, the answer was "access
 * denied", and the attendant had no way to know which half of the screen was
 * really theirs.
 *
 * The role groups live in ./roles.js, which mirrors fuelLoyalty.route.ts.
 */
const TILES = [
  { label: "Customers",   desc: "Register & manage loyalty customers",   href: "/dashboard/loyalty/customers",   icon: Users,      color: "from-blue-500 to-blue-600",     roles: STAFF },
  // The accountant may read this queue but not clear it, so the wording it gets
  // must not promise an Approve button that will not be there.
  { label: "Redemptions", desc: "Approve or reject redemption requests", href: "/dashboard/loyalty/redemptions", icon: RotateCcw,  color: "from-green-500 to-emerald-600", roles: MGR_ACCT_SUP, descByRole: { accountant: "Review redemption requests" } },
  { label: "Audit",       desc: "Verify loyalty vs pump meter data",     href: "/dashboard/loyalty/audit",       icon: ShieldAlert,color: "from-amber-500 to-orange-500",  roles: MGR },
  { label: "Settings",    desc: "Configure points rates and prices",     href: "/dashboard/loyalty/settings",    icon: Star,       color: "from-purple-500 to-violet-600", roles: MGR },
];

export default function LoyaltyOverviewPage() {
  const { customers, total, redemptions, fetchCustomers, fetchRedemptions, settings, fetchSettings } = useFuelLoyaltyStore();

  const { role, ready } = useCurrentRole();

  // Attendants and cashiers cannot list redemptions (mgrAcct on the server), so
  // asking would only produce a 403 in the console and an empty result. The
  // accountant is the mirror case: they may list customers' redemptions but not
  // the customers themselves (staff), so neither fetch is safe for everyone.
  const canSeeRedemptions = can(role, MGR_ACCT_SUP);
  const canSeeCustomers   = can(role, STAFF);

  useEffect(() => {
    if (!ready) return;
    // Settings is readable by every staff role — it carries the points rate.
    fetchSettings();
    if (canSeeCustomers)   fetchCustomers({ limit: 5 });
    if (canSeeRedemptions) fetchRedemptions({ status: "pending", limit: 5 });
  }, [ready, role]);

  const pending = redemptions.filter(r => r.status === "pending").length;
  // Nothing is shown until the role is known — see useCurrentRole for why.
  const visibleTiles = ready ? TILES.filter(t => t.roles.includes(role)) : [];

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
                // Only a manager can enable it, so telling an attendant to go
                // to Settings sends them to a screen they cannot open.
                <span className="text-red-500 font-medium">
                  {can(role, MGR)
                    ? "Inactive — enable in Settings"
                    : "Inactive — ask your manager to enable it"}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {/* The customer list is staff-only on the server; the accountant would
              see a permanent 0 here because their fetch is never made. */}
          {canSeeCustomers && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Customers</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{total}</p>
            </div>
          )}
          {/* Pending redemptions is a manager's queue — an attendant cannot act
              on it, and showing a number they can neither open nor clear reads
              as something being wrong. */}
          {canSeeRedemptions && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pending Redemptions</p>
              <p className={`text-3xl font-bold mt-1 ${pending > 0 ? "text-amber-600" : "text-gray-800"}`}>{pending}</p>
            </div>
          )}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Min to Redeem</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{settings?.minPointsToRedeem ?? "—"} <span className="text-base font-normal text-gray-400">pts</span></p>
          </div>
        </div>

        {/* Navigation tiles */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {visibleTiles.map(({ label, desc, descByRole, href, icon: Icon, color }) => (
            <Link key={href} href={href}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
              <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{descByRole?.[role] || desc}</p>
              {label === "Redemptions" && pending > 0 && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {pending} pending
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* A role with no loyalty duties at all still lands here from the back
            arrow on another loyalty screen — say so rather than show a bare page. */}
        {ready && visibleTiles.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 mb-6">
            <p className="text-gray-400 font-medium">No loyalty tasks are assigned to your role</p>
            <p className="text-gray-300 text-sm mt-1">Ask your manager if you need access.</p>
          </div>
        )}

        {/* Recent customers */}
        {canSeeCustomers && customers.length > 0 && (
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
