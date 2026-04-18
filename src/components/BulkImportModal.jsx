import { useState, useRef } from "react";
import { Upload, Download, X, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function BulkImportModal({ onClose, onSuccess }) {
  const [csvData, setCsvData] = useState([]);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [step, setStep] = useState(1);
  // 1=upload, 2=preview, 3=results
  const fileRef = useRef(null);

  const downloadTemplate = () => {
    const headers = ["firstName", "lastName", "email", "phone", "role", "shiftType"];
    const sampleRows = [
      ["John", "Doe", "john@example.com", "08012345678", "attendant", "One-Day-Morning"],
      ["Jane", "Smith", "jane@example.com", "08087654321", "cashier", "Full-Time"],
    ];
    const csv = [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "staff_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const rows = lines
        .slice(1)
        .map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const obj = {};
          headers.forEach((h, i) => {
            obj[h] = values[i] || "";
          });
          return obj;
        })
        .filter((r) => r.firstName || r.email);

      setCsvData(rows);
      setPreview(rows.slice(0, 5));
      setStep(2);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/staff/bulk-import`,
        { staffList: csvData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(response.data);
      setStep(3);
      if (response.data.summary.success > 0) {
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
            Bulk Import Staff
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">

          {/* Step 1 — Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a CSV file with your staff details. Download the template to get started.
              </p>

              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full justify-center"
              >
                <Download size={16} />
                Download CSV Template
              </button>

              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
              >
                <Upload size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Click to upload CSV
                </p>
                <p className="text-xs text-gray-400 mt-1">Max 50 staff per import</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Required columns:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["firstName", "lastName", "email", "role"].map((col) => (
                    <span
                      key={col}
                      className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-md font-mono"
                    >
                      {col}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Valid roles: attendant, cashier, accountant, supervisor, manager
                </p>
              </div>
            </div>
          )}

          {/* Step 2 — Preview */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {csvData.length} staff found in file
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Change file
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {["Name", "Email", "Role"].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                          {row.firstName} {row.lastName}
                        </td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                          {row.email}
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md capitalize">
                            {row.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {csvData.length > 5 && (
                <p className="text-xs text-gray-400 text-center">
                  Showing 5 of {csvData.length} rows
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Import {csvData.length} Staff
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Results */}
          {step === 3 && results && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {results.summary.success}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">Imported</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {results.summary.failed}
                  </p>
                  <p className="text-xs text-red-600 mt-1">Failed</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {results.summary.skipped}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Skipped</p>
                </div>
              </div>

              {(results.results.failed.length > 0 || results.results.skipped.length > 0) && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">
                    Issues:
                  </p>
                  {[...results.results.failed, ...results.results.skipped].map((item, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400">
                      {item.email}: {item.reason}
                    </p>
                  ))}
                </div>
              )}

              {results.results.success.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
                    ⚠️ Temporary passwords (share with staff):
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {results.results.success.map((s, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-blue-700 dark:text-blue-300">{s.name}</span>
                        <span className="font-mono text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40 px-2 rounded">
                          {s.tempPassword}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}