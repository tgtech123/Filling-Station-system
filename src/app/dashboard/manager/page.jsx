'use client'

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DisplayCard from "@/components/Dashboard/DisplayCard";
import FlashCard from "@/components/Dashboard/FlashCard";
import QuickActionsCard from "@/components/Dashboard/QuickActionsCard";
import LiveIndicator from "@/components/LiveIndicator";
import { GoHistory } from "react-icons/go";
import { CheckCheck, Plus, TriangleAlert, Wrench, History, AlertCircle, XCircle, X, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useDashboardStore from "@/store/useDashboardStore";
import useActivityFeedStore from "@/store/useActivityFeedStore";
import usePaymentStore from "@/store/usePaymentStore";
import { useSocket } from "@/hooks/useSocket";
import { reportType } from "./managerData";

function getActivityStyle(item) {
  const type   = (item.type   || "").toLowerCase();
  const action = (item.action || "").toLowerCase();
  const status = (item.status || "").toLowerCase();
  const title  = (item.title  || "").toLowerCase();

  const isLogin =
    type === "login" ||
    action.includes("login") ||
    title.includes("login");

  if (isLogin) {
    const isFailure =
      status === "failed" ||
      status === "failure" ||
      status === "error" ||
      title.includes("fail") ||
      title.includes("invalid") ||
      title.includes("incorrect") ||
      action.includes("fail");

    return isFailure
      ? { icon: <LogIn className="text-[#ff1f1f]" size={20} />, color: "text-[#ff1f1f]" }
      : { icon: <LogIn className="text-[#04910c]" size={20} />, color: "text-[#04910c]" };
  }

  if (type === "alert" || status === "failed" || status === "failure") {
    return { icon: <TriangleAlert className="text-[#ff1f1f]" size={20} />, color: "text-[#ff1f1f]" };
  }
  if (type === "sale") {
    return { icon: <CheckCheck className="text-[#7f27ff]" size={20} />, color: "text-[#7f27ff]" };
  }
  if (type === "maintenance") {
    return { icon: <Wrench className="text-[#e27d00]" size={20} />, color: "text-[#e27d00]" };
  }
  return { icon: <Plus className="text-[#04910c]" size={20} />, color: "text-[#04910c]" };
}

/**
 * The three subscription banners, which differ only in wording and colour.
 *
 * They were three near-identical copies of the same markup, so a layout fix had
 * to be made three times and the free-plan one had already drifted. One shell,
 * three sets of content.
 *
 * Layout: ONE row at every width. It used to stack on narrow screens, which
 * dropped the button onto its own line under the text and turned a thin notice
 * into a block.
 *
 * Keeping one row means the message cannot always fit, and truncating it alone
 * was worse than stacking: a warning you cannot finish reading is not a
 * warning. So a clipped message becomes tappable and opens in full. The banner
 * stays one thin line, and nothing is lost behind the ellipsis.
 */
function BannerShell({ tone, icon: Icon, children, actionHref, actionLabel, onDismiss }) {
  const hasAction = Boolean(actionHref && actionLabel);
  const [open, setOpen] = useState(false);
  const t = {
    blue:  { bg: "bg-blue-50",  bar: "border-l-blue-500",   icon: "text-blue-500",   text: "text-blue-800",  btn: "bg-blue-600 hover:bg-blue-700",     x: "text-blue-400 hover:bg-blue-100" },
    red:   { bg: "bg-red-50",   bar: "border-l-red-500",    icon: "text-red-500",    text: "text-red-700",   btn: "bg-red-500 hover:bg-red-600",       x: "text-red-400 hover:bg-red-100" },
    amber: { bg: "bg-amber-50", bar: "border-l-orange-400", icon: "text-orange-500", text: "text-amber-800", btn: "bg-orange-500 hover:bg-orange-600", x: "text-orange-400 hover:bg-orange-100" },
  }[tone];

  return (
    <div className={`flex flex-row items-center justify-between gap-2 sm:gap-3 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 mb-4 border-l-4 ${t.bg} ${t.bar}`}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 sm:gap-3 min-w-0 text-left flex-1"
      >
        <Icon size={18} className={`${t.icon} shrink-0`} />
        <p className={`text-xs sm:text-sm font-medium leading-snug truncate ${t.text}`}>{children}</p>
      </button>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {hasAction && (
          <Link
            href={actionHref}
            className={`text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-white transition-colors whitespace-nowrap ${t.btn}`}
          >
            {actionLabel}
          </Link>
        )}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className={`cursor-pointer p-1 rounded-md transition-colors ${t.x}`}
        >
          <X size={16} />
        </button>
      </div>

      {/* The full notice, for when one line was not enough to carry it. */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl"
          >
            <div className="flex items-start gap-3 mb-4">
              <Icon size={20} className={`${t.icon} shrink-0 mt-0.5`} />
              <p className={`text-sm leading-relaxed ${t.text}`}>{children}</p>
            </div>
            <div className="flex items-center gap-2">
              {hasAction && (
                <Link
                  href={actionHref}
                  className={`flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-lg text-white transition-colors ${t.btn}`}
                >
                  {actionLabel}
                </Link>
              )}
              <button
                onClick={() => setOpen(false)}
                className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubscriptionBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { currentPlan } = usePaymentStore();

  /**
   * A station can have several manager accounts. Exactly one is the owner; the
   * rest are hired managers running daily operations.
   *
   * Both see this banner, and deliberately so: a hired manager watching the
   * plan run down is the person best placed to tell the owner before the
   * station drops to view-only. What differs is the action. Paying is gated to
   * the owner on the server, so offering a hired manager a Renew button would
   * walk them into a refusal. They get the fact and who to take it to.
   */
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      setIsOwner(Boolean(u.isOwner));
    } catch {}
  }, []);

  if (dismissed || !currentPlan) return null;

  const isFree = !currentPlan.plan || currentPlan.plan === "free";
  const days = currentPlan.daysRemaining ?? null;
  const isExpired = !isFree && days !== null && days <= 0;
  const isExpiringSoon = !isFree && days !== null && days > 0 && days <= 60;

  // Active paid plan with plenty of time — nothing to show
  if (!isFree && !isExpired && !isExpiringSoon) return null;

  // Compute display date from daysRemaining
  const expiresOn = days !== null
    ? new Date(Date.now() + days * 86400000).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  const planLabel = currentPlan.planName || "your plan";

  const dismiss = () => setDismissed(true);

  if (isFree) {
    return (
      <BannerShell
        tone="blue"
        icon={AlertCircle}
        actionHref={isOwner ? "/pricing?from=/dashboard/manager" : null}
        actionLabel={isOwner ? "Upgrade Plan" : null}
        onDismiss={dismiss}
      >
        You are on the <span className="font-semibold">Free Plan</span>.{" "}
        {isOwner
          ? "Upgrade for more staff slots and advanced analytics."
          : "Ask the owner to upgrade for more staff slots and advanced analytics."}
      </BannerShell>
    );
  }

  if (isExpired) {
    return (
      <BannerShell
        tone="red"
        icon={XCircle}
        actionHref={isOwner ? "/pricing?from=/dashboard/manager" : null}
        actionLabel={isOwner ? "Renew Now" : null}
        onDismiss={dismiss}
      >
        Your <span className="font-semibold">{planLabel}</span> has expired, the station is in view-only mode.
        {!isOwner && " Tell the owner to renew."}
      </BannerShell>
    );
  }

  // isExpiringSoon. Shortened to the two facts that matter: which plan, and how
  // long is left. The old wording spelled out the full date AND the day count
  // AND "renew to continue enjoying benefits", which pushed the button off the
  // end of the line on any laptop.
  return (
    <BannerShell
      tone="amber"
      icon={AlertCircle}
      actionHref={isOwner ? "/dashboard/system-settings" : null}
      actionLabel={isOwner ? "Renew Subscription" : null}
      onDismiss={dismiss}
    >
      Your <span className="font-semibold">{planLabel}</span> expires in{" "}
      <span className="font-semibold">{days} day{days === 1 ? "" : "s"}</span>
      {expiresOn ? <span className="hidden sm:inline"> ({expiresOn})</span> : null}
      {isOwner ? "." : ". Remind the owner to renew."}
    </BannerShell>
  );
}

function relativeTime(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function ManagerDashboard() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  const { tankStatus, metrics, loading, fetchDashboardData, errors } = useDashboardStore();
  const { currentPlan, fetchCurrentPlan } = usePaymentStore();
  const {
    activities,
    loading: activityLoading,
    errors: activityErrors,
    fetchActivity,
    startPolling,
    stopPolling,
  } = useActivityFeedStore();

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        setUserData(JSON.parse(userString));
      }
    } catch (error) {
      console.error("❌ Error parsing user data:", error);
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetchCurrentPlan();
      fetchDashboardData(token);
      // Activity feed: initial load + 5-min safety poll (socket handles fast path)
      fetchActivity().then(() => startPolling());
      return () => stopPolling();
    }

    return () => stopPolling();
  }, [fetchDashboardData, fetchActivity, startPolling, stopPolling]);

  // Socket: live data events specific to this page
  useSocket({
    "dashboard:refresh": () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) fetchDashboardData(token);
    },
    "shift:ended":   () => useActivityFeedStore.getState().invalidate(),
    "shift:started": () => useActivityFeedStore.getState().invalidate(),
  });

  const fullName =
    userData?.firstName && userData?.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData?.firstName || userData?.lastName || "User";

  if (loading.metrics) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen text-blue-600 font-semibold">
          Loading dashboard metrics...
        </div>
      </DashboardLayout>
    );
  }

  if (errors.metrics) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen text-red-500 font-semibold">
          ⚠️ {errors.metrics}
        </div>
      </DashboardLayout>
    );
  }

  const data = metrics?.metrics || {};
 
  return (
    <DashboardLayout>
      <div className="mt-3">
        <SubscriptionBanner />
        {/* Header Section */}
        <DisplayCard>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold">Welcome back, {fullName}</h2>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  currentPlan?.plan === "free"
                    ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    : currentPlan?.plan === "pro"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : currentPlan?.plan === "pro-max"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {currentPlan?.planName || "Free Plan"}
              </span>
              {(!currentPlan || currentPlan?.plan === "free") && (
                <button
                  onClick={() => router.push("/pricing?from=/dashboard/manager")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Upgrade ↑
                </button>
              )}
              {currentPlan?.daysRemaining !== null &&
                currentPlan?.daysRemaining !== undefined &&
                currentPlan?.daysRemaining <= 7 && (
                  <span className="text-xs text-red-500 font-medium">
                    Expires in {currentPlan.daysRemaining} days
                  </span>
                )}
            </div>
          </div>
          <p>
            Monitor your filling station operations, manage inventory, and track
            performance all in one place.
          </p>

          <div className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <FlashCard
              name="Revenue Generated"
              variable="₦"
              period="Today"
              number={data.revenueGeneratedToday?.toLocaleString() || "0"}
            />
            <FlashCard
              name="Active Staff"
              period="Available for work"
              number={`${data.activeStaff?.active || 0}/${data.activeStaff?.total || 0}`}
            />
            <FlashCard
              name="Active Pump"
              period={`${data.activePumps?.underMaintenance || 0} Under maintenance`}
              number={`${data.activePumps?.active || 0}/${data.activePumps?.total || 0}`}
            />
            <FlashCard
              name="Fuel Dispensed Today"
              period="Across all products"
              number={`${data.fuelDispensedToday?.toFixed(0) || "0"} Litres`}
            />
          </div>
        </DisplayCard>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-10">
          <DisplayCard>
            <h2 className="text-2xl font-semibold">Quick Actions</h2>
            <p>Perform overall operations in one click</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportType.map((item) => (
                <QuickActionsCard key={item.id} {...item} />
              ))}
            </div>
          </DisplayCard>
        </div>

        {/* Recent Activity and Current Product Levels */}
        <div className="mt-6 sm:mt-10">
          <DisplayCard>
            <div className="w-full gap-4 flex flex-col lg:flex-row items-start">
              {/* Recent activity */}
              <div className="border-2 w-full border-gray-300 rounded-[14px] p-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <GoHistory size={23} className="mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Recent Activity</h3>
                      <p className="text-sm">
                        Recent activities ongoing in your station
                      </p>
                    </div>
                  </div>
                  <LiveIndicator />
                </div>

                <section className="mt-6">
                  {activityLoading.activities ? (
                    <p className="text-gray-500">Loading activity...</p>
                  ) : activityErrors.activities ? (
                    <p className="text-red-500">{activityErrors.activities}</p>
                  ) : activities.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recent activity yet.</p>
                  ) : (
                    activities.map((item) => {
                      const { icon, color } = getActivityStyle(item);
                      return (
                      <div
                        key={item.id}
                        className="flex flex-col lg:flex-row mb-4 items-start lg:justify-between lg:items-center"
                      >
                        <div className="flex gap-2">
                          <div className="mt-1">{icon}</div>
                          <div>
                            <h5 className={`text-sm font-semibold ${color}`}>
                              {item.title}
                            </h5>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm ml-8 lg:ml-0 text-gray-600">
                          {relativeTime(item.timestamp)}
                        </p>
                      </div>
                      );
                    })
                  )}
                </section>
              </div>

              {/* Product levels */}
              <div className="border-2 w-full border-gray-300 rounded-[14px] p-4">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold flex gap-2">
                    <History size={25} />
                    Current Product Levels
                  </h3>
                  <p className="text-sm">Current storage status</p>
                </div>

                <div className="flex flex-col">
                  {loading.tankStatus ? (
                    <p className="text-gray-500">Loading tank levels...</p>
                  ) : errors.tankStatus ? (
                    <p className="text-red-500">{errors.tankStatus}</p>
                  ) : tankStatus?.tanks?.length > 0 ? (
                    tankStatus.tanks.map((tank) => {
                      const fuelTypeColors = {
                        PMS: "#7f27ff",
                        AGO: "#1a71f6",
                        Diesel: "#e27d00",
                        Gas: "#eb2b0b",
                        Kerosene: "#04910c",
                      };
                      const color = fuelTypeColors[tank.fuelType] || "#7f27ff";

                      return (
                        <div key={tank.fuelType} className="mb-5">
                          <div className="flex justify-between mb-1">
                            <p className="text-sm text-gray-600 font-semibold">
                              {tank.fuelType}
                            </p>
                            <p className="text-sm text-gray-400">
                              {tank.currentQuantity?.toLocaleString() || 0}/{tank.limit?.toLocaleString() || 0} Litres
                            </p>
                          </div>
                          {(() => {
                            const pct = Math.max(0, Math.min(100, Number(tank.percentFilled) || 0));
                            return (
                              <div className="relative h-6 w-full bg-gray-200 rounded-[30px]">
                                <div
                                  style={{ width: `${pct}%`, background: color }}
                                  className="h-6 rounded-[30px] transition-all duration-300"
                                />
                                {/* Travel is reduced by the knob's own width so it
                                    never leaves the track at either end. */}
                                <div
                                  style={{ left: `calc(${pct}% - ${(pct / 100) * 32}px)` }}
                                  className="absolute top-1/2 -translate-y-1/2 bg-[#dad6d6] h-8 w-8 rounded-full border-2 border-white shadow-sm transition-all duration-300"
                                />
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No tanks created at this time, create to continue...</p>
                  )}
                </div>
              </div>
            </div>
          </DisplayCard>
        </div>
      </div>
    </DashboardLayout>
  );
}