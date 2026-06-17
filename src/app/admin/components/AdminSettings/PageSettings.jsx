"use client"
import React, { useState, useEffect, useRef } from "react";
import { BiSolidToggleLeft, BiSolidToggleRight } from "react-icons/bi";
import { SquarePen, Upload, ImageIcon, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import usePlatformStore from "@/store/usePlatformStore";

const emptyForm = {
  logoUrl: "",
  taxRates: {},
  platformName: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  supportWhatsApp: "",
  currency: "",
  termsAndConditions: "",
  planStatus: true,
  emailNotifications: true,
  inAppNotifications: false,
  newStationRegistration: true,
  subscriptionPaymentReceived: true,
  subscriptionExpired: true,
  stationSuspended: true,
  systemAlerts: true,
};

const inputClass =
  "w-full h-[3.25rem] pl-3 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100";
const readonlyClass =
  "w-full h-[3.25rem] pl-3 flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg border-[2px] border-neutral-200 dark:border-gray-600";

// Friendly names for the known country codes; unknown codes fall back to the code.
const COUNTRY_NAMES = {
  NG: "Nigeria", GH: "Ghana", KE: "Kenya", ZA: "South Africa", EG: "Egypt",
  GB: "United Kingdom", US: "United States", CA: "Canada", AU: "Australia",
  IN: "India", DE: "Germany", FR: "France",
};

// The API stores rates as decimal fractions (0.075 = 7.5%); admins edit percentages.
// Convert on load (→ percent for the form) and on save (→ decimal for the API),
// rounding away float noise so 0.075 ↔ 7.5 stays exact.
const ratesToPercent = (rates) => {
  const out = {};
  Object.entries(rates || {}).forEach(([code, val]) => {
    out[code] = Math.round(Number(val) * 100 * 1e4) / 1e4;
  });
  return out;
};
const percentToRates = (percents) => {
  const out = {};
  Object.entries(percents || {}).forEach(([code, val]) => {
    const num = Number(val);
    if (Number.isFinite(num)) out[code] = Math.round((num / 100) * 1e6) / 1e6;
  });
  return out;
};

const PageSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(emptyForm);
  const [logoUploading, setLogoUploading] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newRate, setNewRate] = useState("");
  const fileInputRef = useRef(null);

  const { settings, loading, saving, fetchAdminSettings, updateSettings } =
    usePlatformStore();

  useEffect(() => {
    fetchAdminSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      const filled = {
        logoUrl: settings.logoUrl ?? "",
        taxRates: ratesToPercent(settings.taxRates),
        platformName: settings.platformName ?? "",
        contactEmail: settings.contactEmail ?? "",
        contactPhone: settings.contactPhone ?? "",
        contactAddress: settings.contactAddress ?? "",
        supportWhatsApp: settings.supportWhatsApp ?? "",
        currency: settings.currency ?? "",
        termsAndConditions: settings.termsAndConditions ?? "",
        planStatus: settings.planStatus ?? true,
        emailNotifications: settings.emailNotifications ?? true,
        inAppNotifications: settings.inAppNotifications ?? false,
        newStationRegistration: settings.newStationRegistration ?? true,
        subscriptionPaymentReceived: settings.subscriptionPaymentReceived ?? true,
        subscriptionExpired: settings.subscriptionExpired ?? true,
        stationSuspended: settings.stationSuspended ?? true,
        systemAlerts: settings.systemAlerts ?? true,
      };
      setSaved(filled);
      setForm(filled);
    }
  }, [settings]);

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target ? e.target.value : e }));

  // ── Tax / VAT rate helpers (form holds percentages, keyed by country code) ──
  const setRate = (code, value) =>
    setForm((f) => ({ ...f, taxRates: { ...f.taxRates, [code]: value } }));

  const addRate = () => {
    const code = newCode.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) {
      toast.error("Country code must be 2 letters (e.g. NG)");
      return;
    }
    if (form.taxRates && form.taxRates[code] !== undefined) {
      toast.error(`${code} already exists — edit it in the list above`);
      return;
    }
    const pct = Number(newRate);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      toast.error("Rate must be a number between 0 and 100");
      return;
    }
    setForm((f) => ({ ...f, taxRates: { ...f.taxRates, [code]: pct } }));
    setNewCode("");
    setNewRate("");
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setForm((f) => ({ ...f, logoUrl: data.secure_url }));
        toast.success("Logo uploaded — click Save to apply");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed — try again");
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    // Convert the percentage form back to the decimal fractions the API expects.
    const payload = { ...form, taxRates: percentToRates(form.taxRates) };
    const result = await updateSettings(payload);
    if (result.success) {
      setSaved(form);
      setIsEditing(false);
      toast.success("Settings saved successfully!");
    } else {
      toast.error(result.error || "Failed to save settings");
    }
  };

  const handleCancel = () => {
    setForm(saved);
    setIsEditing(false);
  };

  const SectionHeader = ({ title, subtitle }) => (
    <>
      <div className="flex flex-col gap-1.5">
        <span className="text-base sm:text-lg font-semibold leading-tight dark:text-gray-100">
          {title}
        </span>
        <span className="text-sm text-neutral-400 leading-snug">{subtitle}</span>
      </div>
      <hr className="w-full mt-4 dark:border-gray-600" />
    </>
  );

  const Toggle = ({ valueKey }) => {
    const value = form[valueKey];
    const toggle = () =>
      isEditing && setForm((f) => ({ ...f, [valueKey]: !f[valueKey] }));
    return (
      <div
        onClick={toggle}
        className={isEditing ? "cursor-pointer shrink-0" : "cursor-default shrink-0"}
      >
        {value ? (
          <BiSolidToggleRight size={42} className="text-blue-600" />
        ) : (
          <BiSolidToggleLeft size={42} className="text-gray-400" />
        )}
      </div>
    );
  };

  const ToggleRow = ({ label, hint, valueKey }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-[1.375rem] border-[2px] border-neutral-300 dark:border-gray-600 w-full min-h-[5.4375rem] rounded-lg p-4 gap-3 sm:gap-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-[1rem] font-semibold leading-none dark:text-gray-100">{label}</h1>
        <p className="text-[0.875rem] text-neutral-400 font-medium leading-snug">{hint}</p>
      </div>
      <Toggle valueKey={valueKey} />
    </div>
  );

  const displayLogoUrl = form.logoUrl || saved.logoUrl;

  if (!settings && loading) {
    return (
      <div className="flex flex-col w-full pb-10 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
        <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-[1.75rem] font-semibold leading-none dark:text-gray-100">
            Platform Settings
          </h1>
          <p className="text-base text-neutral-500">Configure platform settings and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2 bg-blue-600 cursor-pointer text-white font-semibold flex gap-2 items-center rounded-2xl hover:bg-blue-700 transition"
          >
            <SquarePen size={18} />
            Edit
          </button>
        )}
      </div>

      {/* ── Branding & Appearance ──────────────────────────────────── */}
      <div className="mt-5 bg-white dark:bg-gray-800 w-full rounded-xl p-4 lg:p-5">
        <SectionHeader
          title="Branding & Appearance"
          subtitle="Upload your logo and configure how your platform appears to users"
        />

        {/* Logo upload */}
        <div className="mt-5">
          <label className="text-sm font-bold dark:text-gray-200 block mb-3">
            App Logo
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Preview box */}
            <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700 overflow-hidden shrink-0 relative group">
              {displayLogoUrl ? (
                <>
                  <img
                    src={displayLogoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-contain p-2"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, logoUrl: "" }))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-center px-2">
                  <ImageIcon size={28} className="text-gray-300" />
                  <span className="text-[10px] text-gray-400">No logo</span>
                </div>
              )}
            </div>

            {/* Upload controls */}
            <div className="flex flex-col gap-2">
              {isEditing ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoFileChange}
                  />
                  <button
                    type="button"
                    disabled={logoUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {logoUploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {logoUploading ? "Uploading…" : "Upload Logo"}
                  </button>
                  <p className="text-xs text-neutral-400">
                    PNG, JPG, SVG or WebP · Shown on login page, footer &amp; invoices
                  </p>
                </>
              ) : (
                <p className="text-sm text-neutral-400">
                  {displayLogoUrl
                    ? "Logo is configured. Click Edit to change it."
                    : "No logo uploaded yet. Click Edit to add one."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Platform Information ───────────────────────────────────── */}
      <div className="mt-5 bg-white dark:bg-gray-800 w-full rounded-xl p-4 lg:p-5">
        <SectionHeader
          title="Platform Information"
          subtitle="Manage your platform identity and contact details"
        />

        {/* Platform Name */}
        <div className="flex flex-col gap-2 mt-5">
          <label className="text-sm font-bold dark:text-gray-200">Platform Name</label>
          {isEditing ? (
            <input type="text" value={form.platformName} onChange={setField("platformName")} className={inputClass} />
          ) : (
            <div className={readonlyClass}>{saved.platformName}</div>
          )}
          <p className="text-sm text-neutral-400">Used in emails &amp; branding</p>
        </div>

        {/* Email + Phone */}
        <div className="flex flex-col gap-2 mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold dark:text-gray-200">Contact Email</label>
              {isEditing ? (
                <input type="email" value={form.contactEmail} onChange={setField("contactEmail")} className={inputClass} />
              ) : (
                <div className={readonlyClass}>{saved.contactEmail}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold dark:text-gray-200">Contact Phone</label>
              {isEditing ? (
                <input type="tel" value={form.contactPhone} onChange={setField("contactPhone")} className={inputClass} />
              ) : (
                <div className={readonlyClass}>{saved.contactPhone}</div>
              )}
            </div>
          </div>
          <p className="text-sm text-neutral-400">Public contact details shown in footer and contact page</p>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-2 mt-5">
          <label className="text-sm font-bold dark:text-gray-200">Physical Address</label>
          {isEditing ? (
            <input
              type="text"
              value={form.contactAddress}
              onChange={setField("contactAddress")}
              placeholder="e.g. 12 Main Street, Lagos, Nigeria"
              className={inputClass}
            />
          ) : (
            <div className={readonlyClass}>
              {saved.contactAddress || <span className="text-gray-400">Not set</span>}
            </div>
          )}
          <p className="text-sm text-neutral-400">Displayed in the footer and contact section</p>
        </div>
      </div>

      {/* ── Support Channels ──────────────────────────────────────── */}
      <div className="mt-5 bg-white dark:bg-gray-800 w-full rounded-xl p-4 lg:p-5">
        <SectionHeader
          title="Support Channels"
          subtitle="Configure how customers reach your support team"
        />

        <div className="flex flex-col gap-2 mt-5">
          <label className="text-sm font-bold dark:text-gray-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#25D366] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.117 1.528 5.845L.057 23.5l5.797-1.522A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.213-3.44.902.919-3.354-.233-.375A9.818 9.818 0 1112 21.818z"/>
              </svg>
            </span>
            WhatsApp Support Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={form.supportWhatsApp}
              onChange={setField("supportWhatsApp")}
              placeholder="e.g. 2349030203547 (include country code, no + or spaces)"
              className={inputClass}
            />
          ) : (
            <div className={readonlyClass}>
              {saved.supportWhatsApp || <span className="text-gray-400">Not configured</span>}
            </div>
          )}
          <p className="text-sm text-neutral-400">
            Enter the full international number without spaces or symbols — e.g.{" "}
            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">2349030203547</span>.
            A chat button will appear on all public pages.
          </p>
        </div>
      </div>

      {/* ── Billing Settings ──────────────────────────────────────── */}
      <div className="mt-5 p-4 lg:p-5 bg-white dark:bg-gray-800 rounded-xl w-full">
        <SectionHeader
          title="Billing Settings"
          subtitle="Configure billing and payment preferences"
        />
        <div className="flex flex-col gap-2 mt-5">
          <label className="text-sm font-bold dark:text-gray-200">Default Currency</label>
          {isEditing ? (
            <input type="text" value={form.currency} onChange={setField("currency")} className={inputClass} />
          ) : (
            <div className={readonlyClass}>{saved.currency}</div>
          )}
          <p className="text-sm text-neutral-400">Used for all pricing and invoices</p>
        </div>
      </div>

      {/* ── Tax / VAT Rates ───────────────────────────────────────── */}
      <div className="mt-5 p-4 lg:p-5 bg-white dark:bg-gray-800 rounded-xl w-full">
        <SectionHeader
          title="Tax / VAT Rates"
          subtitle="VAT added on top of subscription prices at checkout, per country. Enter a percentage — e.g. 7.5 for 7.5%."
        />

        <div className="mt-5 flex flex-col gap-3">
          {Object.keys(form.taxRates || {}).length === 0 ? (
            <p className="text-sm text-neutral-400">No tax rates configured yet.</p>
          ) : (
            Object.entries(form.taxRates)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([code, pct]) => (
                <div
                  key={code}
                  className="flex items-center justify-between gap-3 border-[2px] border-neutral-300 dark:border-gray-600 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex flex-col">
                    <span className="text-[1rem] font-semibold leading-none dark:text-gray-100">
                      {COUNTRY_NAMES[code] || code}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono mt-1">{code}</span>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={pct}
                        onChange={(e) => setRate(code, e.target.value)}
                        className="w-24 h-[3rem] px-3 text-right rounded-lg border-[2px] border-neutral-300 focus:border-blue-600 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                      <span className="text-sm font-semibold text-neutral-500">%</span>
                    </div>
                  ) : (
                    <span className="text-[1rem] font-semibold dark:text-gray-100 shrink-0">
                      {pct}%
                    </span>
                  )}
                </div>
              ))
          )}
        </div>

        {isEditing && (
          <div className="mt-4 flex flex-col gap-2">
            <label className="text-sm font-bold dark:text-gray-200">Add a country</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="text"
                maxLength={2}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="Code (e.g. NG)"
                className="sm:w-40 h-[3rem] px-3 uppercase rounded-lg border-[2px] border-neutral-300 focus:border-blue-600 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="Rate"
                  className="w-28 h-[3rem] px-3 text-right rounded-lg border-[2px] border-neutral-300 focus:border-blue-600 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                <span className="text-sm font-semibold text-neutral-500">%</span>
              </div>
              <button
                type="button"
                onClick={addRate}
                className="h-[3rem] px-5 rounded-lg border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <p className="text-sm text-neutral-400 mt-4">
          The new rate applies to the next payment a customer starts after you save. To stop charging VAT for a country, set its rate to 0.
        </p>
      </div>

      {/* ── Legal ─────────────────────────────────────────────────── */}
      <div className="mt-5 p-4 lg:p-5 bg-white dark:bg-gray-800 rounded-xl w-full">
        <SectionHeader
          title="Legal"
          subtitle="Manage legal documents and policies"
        />
        <div className="flex flex-col gap-2 mt-5">
          <label className="text-sm font-bold dark:text-gray-200">Terms &amp; Conditions</label>
          {isEditing ? (
            <textarea
              value={form.termsAndConditions}
              onChange={setField("termsAndConditions")}
              className="w-full lg:h-[12.25rem] h-[7.125rem] pl-3 pt-2 rounded-lg border-[2px] border-neutral-300 focus:border-blue-600 outline-none resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          ) : (
            <div className="w-full lg:min-h-[12.25rem] min-h-[7.125rem] pl-3 pt-2 rounded-lg border-[2px] border-neutral-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
              {saved.termsAndConditions}
            </div>
          )}
          <p className="text-sm text-neutral-400">Displayed to users during registration</p>
        </div>
      </div>

      {/* ── Access Control ────────────────────────────────────────── */}
      <div className="mt-5 p-4 lg:p-5 bg-white dark:bg-gray-800 rounded-xl w-full">
        <SectionHeader
          title="Access Control"
          subtitle="Control who can register on your platform"
        />
        <ToggleRow
          label="Plan Status"
          hint="This plan is active and visible to customers"
          valueKey="planStatus"
        />
      </div>

      {/* ── Notification Channels ─────────────────────────────────── */}
      <div className="mt-5 p-4 lg:p-5 bg-white dark:bg-gray-800 rounded-xl w-full">
        <SectionHeader
          title="Notification Channels"
          subtitle="Choose how you receive notifications"
        />
        <ToggleRow label="Email Notifications" hint="Receive important updates via email" valueKey="emailNotifications" />
        <ToggleRow label="In-App Notifications" hint="See alerts while logged into the dashboard" valueKey="inAppNotifications" />
      </div>

      {/* ── Notification Types ────────────────────────────────────── */}
      <div className="mt-5 p-4 lg:p-5 bg-white dark:bg-gray-800 rounded-xl w-full">
        <SectionHeader
          title="Notification Types"
          subtitle="Choose which events you want to be notified about"
        />
        <ToggleRow label="New Station Registration" hint="When a filling station registers on the platform" valueKey="newStationRegistration" />
        <ToggleRow label="Subscription Payment Received" hint="When a subscription payment is successfully received" valueKey="subscriptionPaymentReceived" />
        <ToggleRow label="Subscription Expired or Overdue" hint="When a subscription expires or payment is overdue" valueKey="subscriptionExpired" />
        <ToggleRow label="Station Suspended or Reactivated" hint="When a station is suspended or reactivated" valueKey="stationSuspended" />
        <ToggleRow label="System Alerts (Critical Events)" hint="Receive alerts for critical system events and issues" valueKey="systemAlerts" />
      </div>

      {/* ── Save / Cancel ─────────────────────────────────────────── */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-[2px] border-neutral-300 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || logoUploading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <SquarePen size={18} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PageSettings;
