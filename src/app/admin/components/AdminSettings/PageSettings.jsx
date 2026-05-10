"use client"
import React, { useState, useEffect } from "react";
import { BiSolidToggleLeft, BiSolidToggleRight } from "react-icons/bi";
import { SquarePen } from "lucide-react";
import toast from "react-hot-toast";
import usePlatformStore from "@/store/usePlatformStore";

const emptyForm = {
  platformName: "",
  contactEmail: "",
  contactPhone: "",
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
  "w-full h-[3.25rem] pl-3 rounded-lg border-[2px] border-neutral-300 focus:border-[2px] focus:border-blue-600 outline-none";
const readonlyClass =
  "w-full h-[3.25rem] pl-3 flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg border-[2px] border-neutral-200 dark:border-gray-600";

const PageSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(emptyForm);

  const { settings, loading, saving, fetchAdminSettings, updateSettings } =
    usePlatformStore();

  useEffect(() => {
    fetchAdminSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      const filled = {
        platformName: settings.platformName ?? "",
        contactEmail: settings.contactEmail ?? "",
        contactPhone: settings.contactPhone ?? "",
        currency: settings.currency ?? "",
        termsAndConditions: settings.termsAndConditions ?? "",
        planStatus: settings.planStatus ?? true,
        emailNotifications: settings.emailNotifications ?? true,
        inAppNotifications: settings.inAppNotifications ?? false,
        newStationRegistration: settings.newStationRegistration ?? true,
        subscriptionPaymentReceived:
          settings.subscriptionPaymentReceived ?? true,
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

  const handleSave = async () => {
    const result = await updateSettings(form);
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
      <div className="flex flex-col gap-3">
        <span className="text-base sm:text-lg font-semibold leading-[100%] dark:text-gray-100">
          {title}
        </span>
        <span className="text-sm sm:text-base text-neutral-400 leading-[150%]">
          {subtitle}
        </span>
      </div>
      <hr className="w-full mt-[1.375rem] dark:border-gray-600" />
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
        <h1 className="text-[1rem] font-semibold leading-[100%] dark:text-gray-100">
          {label}
        </h1>
        <p className="text-[0.875rem] text-neutral-400 font-medium leading-[150%]">
          {hint}
        </p>
      </div>
      <Toggle valueKey={valueKey} />
    </div>
  );

  // Loading skeleton
  if (!settings && loading) {
    return (
      <div className="flex flex-col w-full pb-10 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-1/2" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl lg:text-[1.75rem] font-semibold leading-[100%] dark:text-gray-100">
            Platform Settings
          </h1>
          <p className="text-base lg:text-[1.125rem] leading-[100%] text-neutral-500">
            Configure platform settings and preferences
          </p>
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

      {/* Platform Information */}
      <div className="mt-[1.375rem] bg-white dark:bg-gray-800 w-full rounded-xl p-4 lg:p-5">
        <SectionHeader
          title="Platform Information"
          subtitle="Manage your platform identity and contact details"
        />

        <div className="flex flex-col gap-2 mt-[1.375rem]">
          <label className="text-[0.875rem] font-bold dark:text-gray-200">
            Platform Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={form.platformName}
              onChange={setField("platformName")}
              className={inputClass}
            />
          ) : (
            <div className={readonlyClass}>{saved.platformName}</div>
          )}
          <p className="text-sm text-neutral-400">Used in emails &amp; branding</p>
        </div>

        <div className="flex flex-col gap-2 mt-[1.375rem]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-[0.875rem] font-bold dark:text-gray-200">
                Contact Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={setField("contactEmail")}
                  className={inputClass}
                />
              ) : (
                <div className={readonlyClass}>{saved.contactEmail}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.875rem] font-bold dark:text-gray-200">
                Contact Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={setField("contactPhone")}
                  className={inputClass}
                />
              ) : (
                <div className={readonlyClass}>{saved.contactPhone}</div>
              )}
            </div>
          </div>
          <p className="text-sm text-neutral-400">
            Public contact for station owners
          </p>
        </div>
      </div>

      {/* Billing Settings */}
      <div className="mt-[1.375rem] p-4 lg:p-5 bg-white dark:bg-gray-800 rounded-xl w-full">
        <SectionHeader
          title="Billing Settings"
          subtitle="Configure billing and payment preferences"
        />
        <div className="flex flex-col gap-2 mt-[1.375rem]">
          <label className="text-[1rem] font-bold dark:text-gray-200">
            Default Currency
          </label>
          {isEditing ? (
            <input
              type="text"
              value={form.currency}
              onChange={setField("currency")}
              className={inputClass}
            />
          ) : (
            <div className={readonlyClass}>{saved.currency}</div>
          )}
          <p className="text-[0.875rem] text-neutral-400">
            Used for all pricing and invoices
          </p>
        </div>
      </div>

      {/* Legal */}
      <div className="mt-[1.375rem] p-4 lg:p-5 bg-white dark:bg-gray-800 rounded-xl w-full">
        <SectionHeader
          title="Legal"
          subtitle="Manage legal documents and policies"
        />
        <div className="flex flex-col gap-2 mt-[1.375rem]">
          <label className="text-[1rem] font-bold dark:text-gray-200">
            Terms &amp; Conditions
          </label>
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
          <p className="text-[0.875rem] text-neutral-400">
            Displayed to users during registration
          </p>
        </div>
      </div>

      {/* Access Control */}
      <div className="mt-[1.375rem] p-4 lg:p-5 bg-white dark:bg-gray-800 rounded-xl w-full">
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

      {/* Notification Channels */}
      <div className="mt-[1.375rem] p-4 lg:p-5 bg-white dark:bg-gray-800 rounded-xl w-full">
        <SectionHeader
          title="Notification Channels"
          subtitle="Choose how you receive notifications"
        />
        <ToggleRow
          label="Email Notifications"
          hint="Receive important updates via email"
          valueKey="emailNotifications"
        />
        <ToggleRow
          label="In-App Notifications"
          hint="See alerts while logged into the dashboard"
          valueKey="inAppNotifications"
        />
      </div>

      {/* Notification Types */}
      <div className="mt-[1.375rem] p-4 lg:p-5 bg-white dark:bg-gray-800 rounded-xl w-full">
        <SectionHeader
          title="Notification Types"
          subtitle="Choose which events you want to be notified about"
        />
        <ToggleRow
          label="New Station Registration"
          hint="When a filling station registers on the platform"
          valueKey="newStationRegistration"
        />
        <ToggleRow
          label="Subscription Payment Received"
          hint="When a subscription payment is successfully received"
          valueKey="subscriptionPaymentReceived"
        />
        <ToggleRow
          label="Subscription Expired or Overdue"
          hint="When a subscription expires or payment is overdue"
          valueKey="subscriptionExpired"
        />
        <ToggleRow
          label="Station Suspended or Reactivated"
          hint="When a station is suspended or reactivated"
          valueKey="stationSuspended"
        />
        <ToggleRow
          label="System Alerts (Critical Events)"
          hint="Receive alerts for critical system events and issues"
          valueKey="systemAlerts"
        />
      </div>

      {/* Save / Cancel */}
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
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <SquarePen size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PageSettings;
