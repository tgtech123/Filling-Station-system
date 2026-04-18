import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowRight, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function CrossBranchStaff() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [targetStation, setTargetStation] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/branches/staff`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedStaff || !targetStation) return;

    try {
      setTransferring(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/branches/staff/transfer`,
        {
          staffId: selectedStaff.id,
          fromStationId: selectedStaff.stationId,
          toStationId: targetStation,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Staff transferred!");
      setShowTransferModal(false);
      setSelectedStaff(null);
      setTargetStation("");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.error || "Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  if (loading)
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    );

  const allStations = data.map((s) => ({ id: s.stationId, name: s.stationName }));

  return (
    <div className="space-y-6">
      {data.map((station, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Station header */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
            <Users size={16} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {station.stationName}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({station.staff.length} staff)
            </span>
          </div>

          {/* Staff list */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {station.staff.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">No staff at this station</p>
            ) : (
              station.staff.map((staff, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {staff.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {staff.email} ·{" "}
                      <span className="capitalize">{staff.role}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStaff({ ...staff, stationId: station.stationId });
                      setShowTransferModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ArrowRight size={12} />
                    Transfer
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      {/* Transfer Modal */}
      {showTransferModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
              Transfer Staff
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Moving {selectedStaff.name} to another branch
            </p>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Select Target Station
              </label>
              <select
                value={targetStation}
                onChange={(e) => setTargetStation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select station...</option>
                {allStations
                  .filter((s) => s.id !== selectedStaff.stationId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedStaff(null);
                }}
                className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={!targetStation || transferring}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {transferring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Transferring...
                  </>
                ) : (
                  "Transfer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}