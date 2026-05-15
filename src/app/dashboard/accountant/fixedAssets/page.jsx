'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { ArrowLeft, Plus, Pencil, Trash2, X, Building2, Fuel, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useFixedAssetStore from '@/store/useFixedAssetStore';

const CATEGORIES = ['Land & Building', 'Fuel Dispenser', 'Other Equipment'];
const METHODS = ['Straight-line', 'Declining Balance'];

const CATEGORY_ICONS = {
  'Land & Building': Building2,
  'Fuel Dispenser': Fuel,
  'Other Equipment': Wrench,
};

const CATEGORY_COLORS = {
  'Land & Building': 'bg-blue-50 text-blue-700',
  'Fuel Dispenser': 'bg-orange-50 text-orange-700',
  'Other Equipment': 'bg-purple-50 text-purple-700',
};

const EMPTY_FORM = {
  name: '',
  category: 'Land & Building',
  purchaseDate: '',
  purchasePrice: '',
  usefulLifeYears: '',
  depreciationMethod: 'Straight-line',
  notes: '',
};

function fmt(n) {
  return Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function FixedAssetsPage() {
  const router = useRouter();
  const { assets, loading, saving, error, fetchAssets, createAsset, updateAsset, deleteAsset } =
    useFixedAssetStore();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // asset object when editing
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchAssets();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(asset) {
    setEditing(asset);
    setForm({
      name: asset.name,
      category: asset.category,
      purchaseDate: asset.purchaseDate?.split('T')[0] ?? '',
      purchasePrice: String(asset.purchasePrice),
      usefulLifeYears: String(asset.usefulLifeYears),
      depreciationMethod: asset.depreciationMethod,
      notes: asset.notes || '',
    });
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.purchaseDate || !form.purchasePrice || !form.usefulLifeYears) {
      setFormError('All required fields must be filled.');
      return;
    }
    try {
      if (editing) {
        await updateAsset(editing._id, form);
      } else {
        await createAsset(form);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteAsset(id);
      setDeleteTarget(null);
    } catch {
      // error shown from store
    }
  }

  const displayed = filterCategory === 'All'
    ? assets
    : assets.filter((a) => a.category === filterCategory);

  // Summary totals by category
  const totals = assets.reduce(
    (acc, a) => {
      acc.cost += Number(a.purchasePrice || 0);
      acc.nbv += Number(a.netBookValue || 0);
      acc.depreciation += Number(a.accumulatedDepreciation || 0);
      return acc;
    },
    { cost: 0, nbv: 0, depreciation: 0 }
  );

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-1">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/accountant')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-neutral-700 dark:text-neutral-200">
              Fixed Asset Register
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track capital assets and their depreciation
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Cost', value: totals.cost, color: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Accumulated Depreciation', value: totals.depreciation, color: 'border-orange-200 bg-orange-50 dark:bg-orange-900/20' },
            { label: 'Net Book Value', value: totals.nbv, color: 'border-green-200 bg-green-50 dark:bg-green-900/20' },
          ].map((card) => (
            <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {card.label}
              </p>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">₦{fmt(card.value)}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {['All', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Asset
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500">
              <Building2 size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No assets found. Add your first asset.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    {['Asset Name', 'Category', 'Purchase Date', 'Cost (₦)', 'Useful Life', 'Acc. Dep. (₦)', 'Net Book Value (₦)', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {displayed.map((asset) => {
                    const Icon = CATEGORY_ICONS[asset.category] || Wrench;
                    const badge = CATEGORY_COLORS[asset.category] || 'bg-gray-100 text-gray-600';
                    return (
                      <tr key={asset._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Icon size={16} className="text-gray-400 shrink-0" />
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{asset.name}</p>
                              {asset.notes && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 max-w-[200px] truncate">{asset.notes}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${badge}`}>
                            {asset.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {new Date(asset.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {fmt(asset.purchasePrice)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {asset.usefulLifeYears} yrs · {asset.depreciationMethod === 'Straight-line' ? 'SL' : 'DB'}
                        </td>
                        <td className="px-4 py-3 text-orange-600 dark:text-orange-400 whitespace-nowrap">
                          {fmt(asset.accumulatedDepreciation)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400 whitespace-nowrap">
                          {fmt(asset.netBookValue)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(asset)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(asset)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {editing ? 'Edit Asset' : 'Add Fixed Asset'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{formError}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Main Office Building, Pump #1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Price (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.purchasePrice}
                    onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Useful Life (years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.usefulLifeYears}
                    onChange={(e) => setForm({ ...form, usefulLifeYears: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Depreciation Method
                  </label>
                  <div className="flex gap-3">
                    {METHODS.map((m) => (
                      <label key={m} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="depMethod"
                          value={m}
                          checked={form.depreciationMethod === m}
                          onChange={() => setForm({ ...form, depreciationMethod: m })}
                          className="accent-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    placeholder="Additional details about this asset..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : editing ? 'Update Asset' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Delete Asset</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
              Are you sure you want to delete <span className="font-semibold">{deleteTarget.name}</span>? It will also be removed from the balance sheet.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget._id)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
