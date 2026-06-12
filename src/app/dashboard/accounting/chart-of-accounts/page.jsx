'use client';
import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import { Plus, Download, Upload, Sparkles, Pencil, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { api, Card, Modal, Field, inputCls, Btn, StatusBadge, fmt, downloadBlob } from '../shared';

const TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Gain', 'Loss'];
const STATUSES = ['Active', 'Inactive', 'Archived', 'OnHold'];

const EMPTY = { code: '', name: '', type: 'Asset', parent: '', isReconcilable: false, cashFlowCategory: '', description: '' };

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/accounting/accounts?withBalances=true');
      setAccounts(res.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const seed = async () => {
    try {
      const res = await api.post('/api/accounting/accounts/seed');
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Seed failed');
    }
  };

  // Build tree: roots + children grouped under parents
  const tree = useMemo(() => {
    const filtered = typeFilter === 'All' ? accounts : accounts.filter((a) => a.type === typeFilter);
    const byParent = {};
    const roots = [];
    for (const a of filtered) {
      if (a.parent && filtered.some((x) => x._id === a.parent)) {
        (byParent[a.parent] = byParent[a.parent] || []).push(a);
      } else {
        roots.push(a);
      }
    }
    return { roots, byParent };
  }, [accounts, typeFilter]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  }
  function openEdit(a) {
    setEditing(a);
    setForm({
      code: a.code, name: a.name, type: a.type, parent: a.parent || '',
      isReconcilable: a.isReconcilable, cashFlowCategory: a.cashFlowCategory || '',
      description: a.description || '', status: a.status,
    });
    setShowModal(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/api/accounting/accounts/${editing._id}`, {
          name: form.name, parent: form.parent || null, status: form.status,
          isReconcilable: form.isReconcilable, cashFlowCategory: form.cashFlowCategory || null,
          description: form.description,
        });
        toast.success('Account updated');
      } else {
        await api.post('/api/accounting/accounts', { ...form, parent: form.parent || null, cashFlowCategory: form.cashFlowCategory || null });
        toast.success('Account created');
      }
      setShowModal(false);
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove(a) {
    if (!confirm(`Delete account ${a.code} — ${a.name}?`)) return;
    try {
      await api.delete(`/api/accounting/accounts/${a._id}`);
      toast.success('Account deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  }

  async function exportCsv() {
    try {
      const res = await api.get('/api/accounting/accounts/export', { responseType: 'text' });
      downloadBlob(res.data, 'chart-of-accounts.csv');
    } catch {
      toast.error('Export failed');
    }
  }

  async function runImport() {
    // Parse CSV: code,name,type,parentCode,...
    const lines = importText.split(/\r?\n/).filter((l) => l.trim());
    const rows = [];
    for (const [i, raw] of lines.entries()) {
      const cells = raw.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      if (i === 0 && /code/i.test(cells[0])) continue;
      if (cells.length < 3) continue;
      rows.push({ code: cells[0], name: cells[1], type: cells[2], parentCode: cells[3] || undefined, description: cells[8] });
    }
    if (!rows.length) return toast.error('No valid rows found');
    try {
      const res = await api.post('/api/accounting/accounts/import', { accounts: rows });
      toast.success(res.data.message);
      if (res.data.data.errors?.length) console.warn('Import skips:', res.data.data.errors);
      setImportOpen(false);
      setImportText('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Import failed');
    }
  }

  const renderRow = (a, depth = 0) => {
    const children = tree.byParent[a._id] || [];
    const isOpen = expanded[a._id] !== false; // default expanded
    return (
      <div key={a._id}>
        <div className="flex items-center gap-2 py-2 px-2 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm" style={{ paddingLeft: depth * 24 + 8 }}>
          {children.length > 0 ? (
            <button onClick={() => setExpanded({ ...expanded, [a._id]: !isOpen })} className="text-gray-400">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : <span className="w-[14px]" />}
          <span className="font-mono text-xs text-gray-500 w-14">{a.code}</span>
          <span className="flex-1 font-medium text-gray-800 dark:text-gray-200">
            {a.name}
            {a.isControlAccount && (
              <span className="ml-2 text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-semibold">
                {a.controlType} CONTROL
              </span>
            )}
          </span>
          <span className="hidden sm:block text-xs text-gray-400 w-20">{a.type}</span>
          <StatusBadge status={a.status} />
          <span className="w-28 text-right font-mono text-xs text-gray-700 dark:text-gray-300">₦{fmt(a.balance)}</span>
          <button onClick={() => openEdit(a)} className="p-1 text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
          {!a.isSystem && (
            <button onClick={() => remove(a)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
          )}
        </div>
        {isOpen && children.map((c) => renderRow(c, depth + 1))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Chart of Accounts</h1>
            <p className="text-sm text-gray-500">{accounts.length} accounts</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {accounts.length === 0 && !loading && (
              <Btn onClick={seed} variant="success"><Sparkles size={15} /> Seed Default Chart</Btn>
            )}
            <Btn onClick={() => setImportOpen(true)} variant="outline"><Upload size={15} /> Import</Btn>
            <Btn onClick={exportCsv} variant="outline"><Download size={15} /> Export</Btn>
            <Btn onClick={openAdd}><Plus size={15} /> New Account</Btn>
          </div>
        </div>

        <div className="flex gap-1.5 mb-4 flex-wrap">
          {['All', ...TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${typeFilter === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <Card>
          {loading ? (
            <p className="text-center text-gray-400 py-12">Loading…</p>
          ) : tree.roots.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No accounts yet. Click "Seed Default Chart" to create the standard filling-station chart.
            </p>
          ) : (
            tree.roots.map((a) => renderRow(a))
          )}
        </Card>

        {showModal && (
          <Modal title={editing ? `Edit ${editing.code}` : 'New Account'} onClose={() => setShowModal(false)}>
            <form onSubmit={save}>
              {!editing && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Account Code *">
                    <input className={inputCls} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. 6150" required />
                  </Field>
                  <Field label="Type *">
                    <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, parent: '' })}>
                      {TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                </div>
              )}
              <Field label="Name *">
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Parent Account" hint="Children roll up into the parent on the balance sheet">
                <select className={inputCls} value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
                  <option value="">None (top level)</option>
                  {accounts
                    .filter((a) => a.type === form.type && (!editing || a._id !== editing._id))
                    .map((a) => <option key={a._id} value={a._id}>{a.code} — {a.name}</option>)}
                </select>
              </Field>
              {editing && (
                <Field label="Status">
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cash-flow Category" hint="for the cash-flow statement">
                  <select className={inputCls} value={form.cashFlowCategory} onChange={(e) => setForm({ ...form, cashFlowCategory: e.target.value })}>
                    <option value="">—</option>
                    <option value="operating">Operating</option>
                    <option value="investing">Investing</option>
                    <option value="financing">Financing</option>
                  </select>
                </Field>
                <label className="flex items-center gap-2 mt-7 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.isReconcilable} onChange={(e) => setForm({ ...form, isReconcilable: e.target.checked })} />
                  Reconcilable (bank/loan)
                </label>
              </div>
              <Field label="Description">
                <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <div className="flex justify-end gap-2 mt-4">
                <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
              </div>
            </form>
          </Modal>
        )}

        {importOpen && (
          <Modal title="Import Chart of Accounts (CSV)" onClose={() => setImportOpen(false)} wide>
            <p className="text-xs text-gray-500 mb-2">
              Paste CSV with columns: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">code,name,type,parentCode</code>.
              Types: {TYPES.join(', ')}.
            </p>
            <textarea
              className={`${inputCls} h-48 font-mono text-xs`}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={'code,name,type,parentCode\n6150,Security Expenses,Expense,\n6151,Guard Salaries,Expense,6150'}
            />
            <div className="flex justify-end gap-2 mt-3">
              <Btn variant="secondary" onClick={() => setImportOpen(false)}>Cancel</Btn>
              <Btn onClick={runImport}><Upload size={15} /> Import</Btn>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
