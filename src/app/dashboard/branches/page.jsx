"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/config";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import useBranchStore from "@/store/useBranchStore";
import usePaymentStore from "@/store/usePaymentStore";
import AddBranchModal from "@/components/AddBranchModal";
import CrossBranchStaff from "@/components/CrossBranchStaff";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Plus, Crown, Mail, X, Loader2, User, UserMinus, Trash2, AlertTriangle, Banknote } from "lucide-react";
import toast from "react-hot-toast";
import ManagerSalaryCard from "@/app/dashboard/profile/ManagerSalaryCard";

// ── Invite Manager Modal ──────────────────────────────────────────────────────
function InviteManagerModal({ branch, onClose, onSent }) {
  const { inviteManager } = useBranchStore();
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [sending,   setSending]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSend = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("All fields are required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }
    try {
      setSending(true);
      await inviteManager(branch.id, { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
      toast.success(`Invite sent to ${email.trim()}`);
      onSent();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to send invite — try again"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[110]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Invite Branch Manager</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{branch.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-2.5 text-xs text-red-600">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">First Name</label>
              <div className="relative">
                <input
                  type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 pl-7 text-sm focus:outline-none focus:border-blue-500"
                />
                <User size={12} className="absolute left-2 top-2.5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Last Name</label>
              <input
                type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@example.com"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 pl-8 text-sm focus:outline-none focus:border-blue-500"
              />
              <Mail size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSend} disabled={sending}
              className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              {sending ? <><Loader2 size={13} className="animate-spin" /> Sending…</> : <><Mail size={13} /> Send Invite</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete Branch Modal ───────────────────────────────────────────────────────
function DeleteBranchModal({ branch, onClose, onDeleted }) {
  const { deleteBranch } = useBranchStore();
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting]       = useState(false);
  const [error, setError]             = useState("");

  const nameMatches = confirmName === branch.name;

  const handleDelete = async () => {
    if (!nameMatches) return;
    setError("");
    try {
      setDeleting(true);
      await deleteBranch(branch.id);
      toast.success(`${branch.name} has been deleted`);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete branch — please try again");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Danger header */}
        <div className="bg-red-600 px-6 py-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Trash2 size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Delete Branch</h3>
            <p className="text-red-200 text-xs mt-0.5">This action is permanent and cannot be undone</p>
          </div>
          <button onClick={onClose} className="ml-auto text-red-200 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Warning box */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Everything in <span className="underline">{branch.name}</span> will be permanently erased:
              </p>
            </div>
            <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 ml-5 list-disc">
              <li>All staff accounts at this branch</li>
              <li>All shifts, sales records and revenue history</li>
              <li>All fuel, lubricant and gas data</li>
              <li>All financial entries, expenses and reports</li>
              <li>All activities and notifications</li>
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Staff", value: branch.staffCount ?? "—" },
              { label: "Shifts Today", value: branch.todayShifts ?? "—" },
              { label: "Status", value: branch.isActive ? "Active" : "Inactive" },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Confirm input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Type <span className="text-red-600 font-bold">{branch.name}</span> to confirm deletion
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={branch.name}
              className="w-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 dark:focus:border-red-500 transition-colors"
            />
            {confirmName.length > 0 && !nameMatches && (
              <p className="text-xs text-red-500 mt-1">Name does not match</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-2.5 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={!nameMatches || deleting}
              className="flex-1 py-2.5 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-800/50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              {deleting ? (
                <><Loader2 size={13} className="animate-spin" /> Deleting…</>
              ) : (
                <><Trash2 size={13} /> Delete Branch</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BranchesPage() {
  const router = useRouter();
  const { overview, loading, fetchOverview, switchStation, switching, removeManager, deleteBranch } = useBranchStore();
  const { fetchCurrentPlan } = usePaymentStore();
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [pendingInvites, setPendingInvites] = useState({});
  const [upgradeDismissed, setUpgradeDismissed] = useState(false);
  const [upgradeData, setUpgradeData] = useState(null);
  const [inviteTarget, setInviteTarget] = useState(null);
  const [planChecking, setPlanChecking] = useState(true);
  const [removingManager, setRemovingManager] = useState(null); // stationId being removed
  const [confirmRemove, setConfirmRemove] = useState(null);    // station object to confirm
  const [confirmDelete, setConfirmDelete] = useState(null);    // station object to delete
  const [salaryTarget, setSalaryTarget] = useState(null);      // { stationName, managerId, managerName }

  // Tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Consolidated report state
  const [reportPeriod, setReportPeriod] = useState("month");
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Run plan check and overview fetch in parallel for speed
      const [plan] = await Promise.all([fetchCurrentPlan(), fetchOverview()]);
      if (!plan?.plan?.startsWith("enterprise")) {
        router.push("/dashboard/manager");
        return;
      }
      setPlanChecking(false);
    };
    init();
  }, []);

  const refreshInvites = async (stations) => {
    (stations || overview?.stations || []).forEach(async (s) => {
      try {
        const res = await api.get(`/api/branches/${s.id}/invites`);
        setPendingInvites((prev) => ({ ...prev, [s.id]: res.data.invites || [] }));
      } catch {}
    });
  };

  useEffect(() => {
    if (overview?.stations) refreshInvites(overview.stations);
  }, [overview]);

  const fetchReport = async (period) => {
    try {
      setReportLoading(true);
      const res = await api.get(
        `/api/branches/consolidated-report?period=${period}`
      );
      setReport(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReport(reportPeriod);
    }
  }, [activeTab, reportPeriod]);

  if (planChecking) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20 text-blue-600 font-semibold">
          Loading branch data...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Branch Overview
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage and monitor all your filling station branches
            </p>
          </div>
          <button
            onClick={() => setShowAddBranch(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Branch
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "overview", label: "Overview" },
            { id: "staff", label: "Staff" },
            { id: "reports", label: "Reports" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Branches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overview?.totalBranches || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overview?.totalStaff || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Today's Revenue (All)</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₦{(overview?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Branch Cards Grid */}
            {overview?.stations?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {overview.stations.map((station) => (
                  <div
                    key={station.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Station header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Building2 size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {station.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            {station.city}
                            {station.isParent && (
                              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded text-[10px] font-semibold">
                                Main
                              </span>
                            )}
                            {!station.isParent && <span>· Branch</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            station.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {station.isActive ? "Active" : "Inactive"}
                        </span>
                        {/* Delete button — only on branch stations, not on main or currently active */}
                        {!station.isParent && !station.isCurrent && (
                          <button
                            onClick={() => setConfirmDelete(station)}
                            title="Delete this branch"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {station.staffCount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Staff</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {station.todayShifts}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Shifts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">
                          ₦{(station.todayRevenue || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                      </div>
                    </div>

                    {/* Switch Button */}
                    <button
                      onClick={async () => {
                        if (station.isCurrent) return;
                        try {
                          await switchStation(station.id);
                        } catch (err) {
                          toast.error(err?.response?.data?.error || "Failed to switch station");
                        }
                      }}
                      disabled={switching || station.isCurrent}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        station.isCurrent
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 active:bg-blue-800 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {station.isCurrent ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                          Currently Viewing
                        </span>
                      ) : switching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Switching...
                        </>
                      ) : (
                        <>
                          <ArrowRight size={16} />
                          Switch to this Station
                        </>
                      )}
                    </button>

                    {/* Manager / Invite section */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      {station.manager ? (
                        /* Branch already has a manager — show their info + configure salary + remove */
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                {station.manager.name}
                              </p>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                                {station.manager.email}
                              </p>
                            </div>
                            <button
                              onClick={() => setConfirmRemove(station)}
                              className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors"
                            >
                              <UserMinus size={11} /> Remove
                            </button>
                          </div>
                          <button
                            onClick={() => setSalaryTarget({
                              stationName: station.name,
                              managerId: station.manager.id,
                              managerName: station.manager.name,
                            })}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Banknote size={12} /> Configure Manager Salary
                          </button>
                        </div>
                      ) : pendingInvites[station.id]?.length > 0 ? (
                        /* Pending invite sent, not yet accepted */
                        <div className="space-y-1.5">
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            ⏳ Invite pending
                          </p>
                          {pendingInvites[station.id].map((inv) => (
                            <p key={inv.id} className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {inv.name} — {inv.email}
                            </p>
                          ))}
                          <button
                            onClick={() => setInviteTarget(station)}
                            className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            <Mail size={11} /> Resend / different email
                          </button>
                        </div>
                      ) : (
                        /* No manager, no pending invite — prompt to invite */
                        <button
                          onClick={() => setInviteTarget(station)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Mail size={14} /> Invite Manager
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {(!overview?.stations || overview.stations.length <= 1) && (
              <div className="text-center py-12">
                <Building2 size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Branches Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Create your first branch station to start managing multiple locations
                </p>
                <button
                  onClick={() => setShowAddBranch(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium mx-auto transition-colors"
                >
                  <Plus size={18} />
                  Create First Branch
                </button>
              </div>
            )}

            {/* Branch limit reached upgrade prompt */}
            {upgradeData && !upgradeDismissed && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6 text-center mt-6">
                <Crown size={32} className="text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  Branch Limit Reached
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Your current plan allows {upgradeData.maxBranches || "a limited number of"} branches.
                  Upgrade to add more locations.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => router.push("/pricing")}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    <Crown size={18} />
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => setUpgradeDismissed(true)}
                    className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Staff Tab */}
        {activeTab === "staff" && <CrossBranchStaff />}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Consolidated Report
              </h2>
              <div className="flex gap-2">
                {["week", "month", "year"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setReportPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      reportPeriod === p
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {p === "week" ? "This Week" : p === "month" ? "This Month" : "This Year"}
                  </button>
                ))}
              </div>
            </div>

            {reportLoading ? (
              <div className="animate-pulse grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                ))}
              </div>
            ) : report && (
              <>
                {/* Totals */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: "Total Revenue",
                      value: `₦${report.totals.totalRevenue.toLocaleString()}`,
                      color: "text-blue-600",
                    },
                    {
                      label: "Total Litres",
                      value: `${report.totals.totalLitres.toLocaleString()}L`,
                      color: "text-green-600",
                    },
                    {
                      label: "Total Shifts",
                      value: report.totals.totalShifts,
                      color: "text-purple-600",
                    },
                    {
                      label: "Total Staff",
                      value: report.totals.totalStaff,
                      color: "text-amber-600",
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {card.label}
                      </p>
                      <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Per station breakdown table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {["Station", "Revenue", "Litres", "Shifts", "Staff"].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {report.stations.map((s, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {s.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {s.city}
                                  {s.isParent ? " · Main" : " · Branch"}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-blue-600">
                              ₦{s.revenue.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {s.litresSold.toLocaleString()}L
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {s.totalShifts}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {s.totalStaff}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {showAddBranch && (
        <AddBranchModal
          onClose={() => setShowAddBranch(false)}
          onUpgradeRequired={(data) => {
            setUpgradeData(data);
            setUpgradeDismissed(false);
          }}
        />
      )}

      {inviteTarget && (
        <InviteManagerModal
          branch={inviteTarget}
          onClose={() => setInviteTarget(null)}
          onSent={() => refreshInvites()}
        />
      )}

      {/* Delete Branch modal */}
      {confirmDelete && (
        <DeleteBranchModal
          branch={confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onDeleted={() => fetchOverview()}
        />
      )}

      {/* Configure Manager Salary modal */}
      {salaryTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Manager Salary Config</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {salaryTarget.stationName} — {salaryTarget.managerName}
                </p>
              </div>
              <button onClick={() => setSalaryTarget(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <ManagerSalaryCard
                staffId={salaryTarget.managerId}
                readOnly={false}
                label={`Salary for ${salaryTarget.managerName}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Remove Manager confirmation dialog */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[110]">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <UserMinus size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Remove Manager</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{confirmRemove.name}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
              <span className="font-semibold">{confirmRemove.manager?.name}</span> will lose access immediately.
              You can invite a new manager afterwards.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={removingManager === confirmRemove.id}
                onClick={async () => {
                  setRemovingManager(confirmRemove.id);
                  try {
                    await removeManager(confirmRemove.id);
                    toast.success(`${confirmRemove.manager?.name} removed`);
                    setConfirmRemove(null);
                  } catch (err) {
                    toast.error(err.response?.data?.error || "Failed to remove manager");
                  } finally {
                    setRemovingManager(null);
                  }
                }}
                className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                {removingManager === confirmRemove.id ? (
                  <><Loader2 size={13} className="animate-spin" /> Removing…</>
                ) : (
                  <><UserMinus size={13} /> Yes, Remove</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}