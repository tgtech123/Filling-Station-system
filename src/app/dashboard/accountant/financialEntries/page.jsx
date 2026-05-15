'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { ArrowLeft, Plus, Pencil, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useFinancialEntryStore from '@/store/useFinancialEntryStore';

// ─── Category config ────────────────────────────────────────────────────────
const CATEGORIES = {
  'Current Liabilities': {
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    items: ['Accrued Expenses', 'Tax Payable'],
    help: {
      'Accrued Expenses': 'Bills that have happened but the invoice hasn\'t arrived yet — e.g. unpaid wages at month-end, electricity used but not yet billed.',
      'Tax Payable':      'VAT, company tax, or any tax owed to the government that has been assessed but not yet paid.',
    },
  },
  'Long-term Liabilities': {
    color: 'bg-red-50 text-red-700 border-red-200',
    badge: 'bg-red-100 text-red-700',
    items: ['Long-term Loan', 'Equipment Financing'],
    help: {
      'Long-term Loan':       'A bank loan or any borrowed money that lasts more than one year — enter the current outstanding balance.',
      'Equipment Financing':  'Hire-purchase or lease agreements on dispensers, generators, tanks — enter the remaining amount owed.',
    },
  },
  'Equity': {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    items: ["Owner's Capital", 'Retained Earnings'],
    help: {
      "Owner's Capital":  'The money the owner originally invested in the business. Enter the full original investment amount.',
      'Retained Earnings': 'Profits from ALL previous years that were kept in the business (not taken out). Your accountant / auditor will confirm this figure.',
    },
  },
};

const ALL_CATEGORIES = Object.values(CATEGORIES).flatMap((g) => g.items);

const EMPTY_FORM = { category: ALL_CATEGORIES[0], amount: '', description: '', entryDate: '' };

function fmt(n) {
  return Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getCategoryGroup(cat) {
  return Object.entries(CATEGORIES).find(([, g]) => g.items.includes(cat))?.[0] || 'Other';
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function FinancialEntriesPage() {
  const router = useRouter();
  const {
    entries, unpaidDeliveries, totalOwed,
    loading, saving, error,
    fetchEntries, fetchUnpaidDeliveries,
    createEntry, updateEntry, deleteEntry, markDeliveryPaid,
  } = useFinancialEntryStore();

  const [activeTab, setActiveTab] = useState('entries'); // 'entries' | 'payables'
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [payTarget, setPayTarget] = useState(null);

  useEffect(() => {
    fetchEntries();
    fetchUnpaidDeliveries();
  }, []);

  // ── Totals per category ────────────────────────────────────────────────────
  const totals = {};
  entries.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
  });

  const sectionTotal = (groupName) =>
    CATEGORIES[groupName].items.reduce((s, cat) => s + (totals[cat] || 0), 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function openAdd(defaultCategory) {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category: defaultCategory || ALL_CATEGORIES[0] });
    setFormError('');
    setShowModal(true);
  }

  function openEdit(entry) {
    setEditing(entry);
    setForm({
      category: entry.category,
      amount: String(entry.amount),
      description: entry.description,
      entryDate: entry.entryDate?.split('T')[0] ?? '',
    });
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.amount || !form.description.trim() || !form.entryDate) {
      setFormError('All fields are required.');
      return;
    }
    try {
      editing ? await updateEntry(editing._id, form) : await createEntry(form);
      setShowModal(false);
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDelete(id) {
    try { await deleteEntry(id); setDeleteTarget(null); } catch { /* error shown */ }
  }

  async function handleMarkPaid(deliveryId) {
    try { await markDeliveryPaid(deliveryId); setPayTarget(null); } catch { /* error shown */ }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-1">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/accountant')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-neutral-700 dark:text-neutral-200">Financial Entries Register</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Record liabilities and equity figures that feed into the Balance Sheet
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[{ id: 'entries', label: 'Liabilities & Equity' }, { id: 'payables', label: `Accounts Payable (${unpaidDeliveries.length})` }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── TAB: Liabilities & Equity ── */}
        {activeTab === 'entries' && (
          <div className="space-y-4">
            {Object.entries(CATEGORIES).map(([groupName, group]) => (
              <div key={groupName} className={`rounded-xl border p-4 ${group.color}`}>
                {/* Group header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-semibold text-base">{groupName}</h2>
                    <p className="text-xs opacity-70 mt-0.5">Total: ₦{fmt(sectionTotal(groupName))}</p>
                  </div>
                  <button onClick={() => openAdd(group.items[0])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 hover:bg-white rounded-lg text-xs font-medium transition-colors shadow-sm">
                    <Plus size={13} /> Add Entry
                  </button>
                </div>

                {/* Category rows */}
                {group.items.map((cat) => {
                  const catEntries = entries.filter((e) => e.category === cat);
                  return (
                    <div key={cat} className="bg-white/60 dark:bg-white/10 rounded-lg p-3 mb-2 last:mb-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{cat}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-sm">{group.help[cat]}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-xs text-gray-400 mb-0.5">Total</p>
                          <p className="font-bold text-sm text-gray-800 dark:text-gray-100">₦{fmt(totals[cat] || 0)}</p>
                        </div>
                      </div>

                      {/* Individual entries for this category */}
                      {catEntries.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {catEntries.map((entry) => (
                            <div key={entry._id}
                              className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-xs shadow-sm">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-700 dark:text-gray-200 truncate">{entry.description}</p>
                                <p className="text-gray-400 dark:text-gray-500">
                                  {new Date(entry.entryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-800 dark:text-gray-100 mx-4 whitespace-nowrap">₦{fmt(entry.amount)}</p>
                              <div className="flex gap-1.5 shrink-0">
                                <button onClick={() => openEdit(entry)}
                                  className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                                  <Pencil size={12} />
                                </button>
                                <button onClick={() => setDeleteTarget(entry)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {catEntries.length === 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">
                          No entries yet — click "Add Entry" above to record one.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: Accounts Payable (unpaid deliveries) ── */}
        {activeTab === 'payables' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Summary banner */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-800 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Total owed to fuel suppliers</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                  These are completed deliveries where the supplier has not yet been paid.
                  When you pay a supplier, click "Mark Paid" to remove it from Accounts Payable.
                </p>
              </div>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-300 whitespace-nowrap ml-4">₦{fmt(totalOwed)}</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
              </div>
            ) : unpaidDeliveries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
                <CheckCircle size={28} className="mb-2 opacity-40" />
                <p className="text-sm">All supplier deliveries have been paid.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      {['Supplier', 'Delivery Date', 'Quantity (L)', 'Price/Ltr', 'Amount Owed', 'Action'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {unpaidDeliveries.map((d) => (
                      <tr key={d._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{d.suplier}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(d.deliveryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{Number(d.quantity).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">₦{fmt(d.pricePerLtr)}</td>
                        <td className="px-4 py-3 font-semibold text-orange-700 dark:text-orange-400 whitespace-nowrap">
                          ₦{fmt(Number(d.quantity) * Number(d.pricePerLtr))}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setPayTarget(d)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                            <CheckCircle size={12} /> Mark Paid
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {editing ? 'Edit Entry' : 'Add Financial Entry'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{formError}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(CATEGORIES).map(([group, g]) => (
                    <optgroup key={group} label={group}>
                      {g.items.map((cat) => <option key={cat}>{cat}</option>)}
                    </optgroup>
                  ))}
                </select>
                {form.category && CATEGORIES[getCategoryGroup(form.category)]?.help[form.category] && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 leading-relaxed">
                    ℹ️ {CATEGORIES[getCategoryGroup(form.category)].help[form.category]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. GTBank business loan, 2022 tax assessment"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount (₦) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min="0" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    As of Date <span className="text-red-500">*</span>
                  </label>
                  <input type="date" value={form.entryDate}
                    onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
                  {saving ? 'Saving…' : editing ? 'Update' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Delete Entry</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This will also update the balance sheet.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
              Delete <span className="font-semibold">{deleteTarget.description}</span> (₦{fmt(deleteTarget.amount)})?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteTarget._id)} disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-60">
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mark Paid confirmation ── */}
      {payTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <CheckCircle size={18} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Mark Supplier Paid</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This removes it from Accounts Payable.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Supplier: <span className="font-semibold">{payTarget.suplier}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
              Amount: <span className="font-semibold text-orange-700">₦{fmt(Number(payTarget.quantity) * Number(payTarget.pricePerLtr))}</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPayTarget(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={() => handleMarkPaid(payTarget._id)} disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Confirm Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
