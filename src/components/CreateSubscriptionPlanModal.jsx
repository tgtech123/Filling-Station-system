"use client"
import { useState } from "react"
import { X } from "lucide-react"
import Multiselect from "multiselect-react-dropdown"
import axios from "axios"
import toast from "react-hot-toast"

const PLAN_TEMPLATES = {
  free: {
    name: "Free",
    slug: "free",
    description: "Perfect for getting started. Learn and explore Flourish Station in a cloud environment.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    duration: 1,
    durationUnit: "months",
    billingCycles: ["free"],
    staffLimits: {
      attendants: 3,
      cashiers: 1,
      accountants: 1,
      supervisors: 1,
      managers: 1
    },
    features: [
      "3 Attendants",
      "1 Cashier",
      "Basic Dashboard",
      "Shift Management",
      "Tank Tracking"
    ],
    maxBranches: 1,
    order: 1
  },
  pro: {
    name: "Pro",
    slug: "pro",
    description: "For growing stations that need advanced features and higher staff limits.",
    monthlyPrice: 15000,
    yearlyPrice: 162000,
    duration: 1,
    durationUnit: "months",
    billingCycles: ["monthly", "yearly"],
    staffLimits: {
      attendants: 10,
      cashiers: 3,
      accountants: 2,
      supervisors: 2,
      managers: 2
    },
    features: [
      "10 Attendants",
      "3 Cashiers",
      "Advanced Analytics",
      "Real-time Reporting",
      "Staff Performance Tracking",
      "Priority Support",
      "Bulk CSV Import"
    ],
    maxBranches: 1,
    order: 2
  },
  "pro-max": {
    name: "Pro Max",
    slug: "pro-max",
    description: "Unlimited attendants and cashiers with premium features.",
    monthlyPrice: 40000,
    yearlyPrice: 432000,
    duration: 1,
    durationUnit: "months",
    billingCycles: ["monthly", "yearly"],
    staffLimits: {
      attendants: 999999,
      cashiers: 999999,
      accountants: 6,
      supervisors: 6,
      managers: 3
    },
    features: [
      "Unlimited Attendants",
      "Unlimited Cashiers",
      "Advanced Analytics",
      "Commission Tracking",
      "Automated Alerts",
      "API Access",
      "Dedicated Support"
    ],
    maxBranches: 1,
    order: 3
  },
  enterprise: {
    name: "Enterprise",
    slug: "enterprise",
    description: "For multi-location stations. Manage 3 branches with unified reporting.",
    monthlyPrice: 100000,
    yearlyPrice: 1080000,
    duration: 1,
    durationUnit: "months",
    billingCycles: ["monthly", "yearly"],
    staffLimits: {
      attendants: 999999,
      cashiers: 999999,
      accountants: 999999,
      supervisors: 999999,
      managers: 999999
    },
    features: [
      "Unlimited Staff",
      "Up to 3 Branches",
      "Cross-branch Reporting",
      "Consolidated Analytics",
      "Multi-branch Staff Transfer",
      "Enterprise Support",
      "Custom Integrations"
    ],
    maxBranches: 3,
    order: 4
  },
  "enterprise-pro": {
    name: "Enterprise Pro",
    slug: "enterprise-pro",
    description: "For large networks. Support up to 5 stations with advanced control.",
    monthlyPrice: 200000,
    yearlyPrice: 2160000,
    duration: 1,
    durationUnit: "months",
    billingCycles: ["monthly", "yearly"],
    staffLimits: {
      attendants: 999999,
      cashiers: 999999,
      accountants: 999999,
      supervisors: 999999,
      managers: 999999
    },
    features: [
      "Unlimited Everything",
      "Up to 5 Branches",
      "Advanced Consolidation",
      "White-label Option",
      "Dedicated Account Manager",
      "Priority Support",
      "Custom SLA"
    ],
    maxBranches: 5,
    order: 5,
    isPopular: true
  },
  "enterprise-max": {
    name: "Enterprise Max",
    slug: "enterprise-max",
    description: "Ultimate solution for large-scale operations. Unlimited branches and full customization.",
    monthlyPrice: 500000,
    yearlyPrice: 5400000,
    duration: 1,
    durationUnit: "months",
    billingCycles: ["monthly", "yearly"],
    staffLimits: {
      attendants: 999999,
      cashiers: 999999,
      accountants: 999999,
      supervisors: 999999,
      managers: 999999
    },
    features: [
      "Unlimited Everything",
      "Unlimited Branches",
      "Custom Integration",
      "Dedicated Infrastructure",
      "White-label Support",
      "24/7 Priority Support",
      "SLA Guarantee"
    ],
    maxBranches: 999999,
    order: 6
  }
}

const ALL_POSSIBLE_FEATURES = [
  "Unlimited Attendants",
  "Unlimited Cashiers",
  "Unlimited Staff",
  "Unlimited Everything",
  "Advanced Analytics",
  "Real-time Reporting",
  "Staff Performance Tracking",
  "Commission Tracking",
  "Automated Alerts",
  "Bulk CSV Import",
  "Priority Support",
  "Dedicated Support",
  "API Access",
  "Custom Integrations",
  "Cross-branch Reporting",
  "Consolidated Analytics",
  "Multi-branch Staff Transfer",
  "Enterprise Support",
  "White-label Option",
  "White-label Support",
  "Dedicated Account Manager",
  "Custom SLA",
  "SLA Guarantee",
  "24/7 Priority Support",
  "Dedicated Infrastructure",
  "Advanced Consolidation",
  "Up to 3 Branches",
  "Up to 5 Branches",
  "Unlimited Branches",
  "Basic Dashboard",
  "Shift Management",
  "Tank Tracking",
  "Expense Management",
  "Customer Loyalty Program",
  "Shift Bonus System",
  "3 Attendants",
  "1 Cashier",
  "10 Attendants",
  "3 Cashiers"
]

const featureOptions = ALL_POSSIBLE_FEATURES.map(f => ({
  name: f,
  id: f.toLowerCase().replace(/\s+/g, "-")
}))

const DEFAULT_FORM = {
  name: "",
  slug: "",
  description: "",
  monthlyPrice: 0,
  yearlyPrice: 0,
  currency: "NGN",
  billingCycles: [],
  duration: 1,
  durationUnit: "months",
  staffLimits: {
    attendants: 0,
    cashiers: 0,
    accountants: 0,
    supervisors: 0,
    managers: 0
  },
  features: [],
  isActive: true,
  isPopular: false,
  order: 0,
  allowMultipleBranches: false,
  maxBranches: 1
}

export default function CreateSubscriptionPlanModal({
  onClose,
  onSuccess,
  initialData = null
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(initialData?.slug || "")
  const [formData, setFormData] = useState(initialData || DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleTemplateChange = (e) => {
    const slug = e.target.value
    setSelectedTemplate(slug)
    if (slug && PLAN_TEMPLATES[slug]) {
      const template = PLAN_TEMPLATES[slug]
      setFormData({
        ...DEFAULT_FORM,
        ...template,
        currency: "NGN",
        isActive: true,
        isPopular: template.isPopular || false,
        allowMultipleBranches: (template.maxBranches || 1) > 1
      })
      setErrors({})
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Plan name required"
    if (!formData.slug.trim()) newErrors.slug = "Slug required"
    if (!formData.description.trim()) newErrors.description = "Description required"
    if (!formData.duration) newErrors.duration = "Duration required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === "checkbox") {
      if (name === "billingCycles") {
        setFormData(prev => ({
          ...prev,
          billingCycles: checked
            ? [...prev.billingCycles, value]
            : prev.billingCycles.filter(c => c !== value)
        }))
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }))
      }
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: Number(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    if (errors[name]) {
      setErrors(prev => { const copy = { ...prev }; delete copy[name]; return copy })
    }
  }

  const handleStaffLimitChange = (role, value) => {
    setFormData(prev => ({
      ...prev,
      staffLimits: { ...prev.staffLimits, [role]: Number(value) }
    }))
  }

  const handleFeaturesChange = (selected) => {
    setFormData(prev => ({ ...prev, features: selected.map(item => item.name) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const payload = { ...formData, slug: formData.slug.toLowerCase().trim() }
      const url = initialData?._id
        ? `${process.env.NEXT_PUBLIC_API}/api/admin/plans/${initialData._id}`
        : `${process.env.NEXT_PUBLIC_API}/api/admin/plans`
      const method = initialData?._id ? "PATCH" : "POST"

      await axios({ method, url, data: payload, headers: { Authorization: `Bearer ${token}` } })
      toast.success(initialData?._id ? "Plan updated!" : "Plan created!")
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save plan")
    } finally {
      setLoading(false)
    }
  }

  const selectedFeatures = featureOptions.filter(f => formData.features.includes(f.name))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
            {initialData?._id ? "Edit Plan" : "Create Plan"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Template Selector — create mode only */}
          {!initialData?._id && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Select Plan Template
              </label>
              <select
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Choose a template...</option>
                {Object.entries(PLAN_TEMPLATES).map(([key, template]) => (
                  <option key={key} value={key}>{template.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Selecting a template will auto-fill recommended values
              </p>
            </div>
          )}

          {/* Name, Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Plan Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Pro"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="e.g., pro"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Perfect for growing stations"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Monthly Price (₦)</label>
                <input
                  type="number"
                  name="monthlyPrice"
                  value={formData.monthlyPrice}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Yearly Price (₦)</label>
                <input
                  type="number"
                  name="yearlyPrice"
                  value={formData.yearlyPrice}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Currency</label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Billing Cycles</label>
              <div className="flex gap-6">
                {["monthly", "yearly", "free"].map(cycle => (
                  <label key={cycle} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="billingCycles"
                      value={cycle}
                      checked={formData.billingCycles.includes(cycle)}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{cycle}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Duration *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Duration Unit</label>
              <select
                name="durationUnit"
                value={formData.durationUnit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="days">Days</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>

          {/* Staff Limits */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Staff Limits</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.keys(formData.staffLimits).map(role => (
                <div key={role}>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block capitalize">{role}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.staffLimits[role]}
                    onChange={(e) => handleStaffLimitChange(role, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Features Multiselect */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
            <Multiselect
              options={featureOptions}
              selectedValues={selectedFeatures}
              onSelect={handleFeaturesChange}
              onRemove={handleFeaturesChange}
              displayValue="name"
              placeholder="Select features..."
              showCheckbox
              style={{
                multiselectContainer: { width: "100%" },
                searchBox: {
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  padding: "0.5rem"
                },
                chips: {
                  background: "#2563eb",
                  borderRadius: "9999px",
                  fontSize: "0.75rem"
                }
              }}
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={handleInputChange} className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Popular (badge)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="allowMultipleBranches" checked={formData.allowMultipleBranches} onChange={handleInputChange} className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Multiple Branches</span>
            </label>
          </div>

          {/* Order & Max Branches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Max Branches</label>
              <input
                type="number"
                name="maxBranches"
                value={formData.maxBranches}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {initialData?._id ? "Updating..." : "Creating..."}
                </>
              ) : (
                initialData?._id ? "Update Plan" : "Create Plan"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
