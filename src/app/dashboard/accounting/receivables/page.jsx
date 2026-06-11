'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { api } from '@/lib/config';
import toast from 'react-hot-toast';
import { Plus, Trash2, RotateCw, Banknote, FileMinus, UserPlus } from 'lucide-react';
import { Card, Modal, Field, inputCls, Btn, StatusBadge, Table, fmt, fmtDate } from '../shared';

const EMPTY_INV = {
  customerId: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '',
  taxCode: '', recurringEnabled: false, recurringFrequency: 'monthly', recurringEndDate: '',
  lines: [{ description: '', quantity: 1, unitPrice: '' }],
};

export default function ReceivablesPage() {
  const [tab, setTab] = useState('invoices');
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showCustomer, setShowCustomer] = useState(false);
  const [custForm, setCustForm] = useState({ name: '', email: '', phone: '', creditLimit: '' });
  const [showInvoice, setShowInvoice] = useState(false);
  const [invForm, setInvForm] = useState(EMPTY_INV);
  const [showCreditNote, setShowCreditNote] = useState(false);
  const [cnForm, setCnForm] = useState({ customerId: '', invoiceId: '', amount: '', reason: '' });
  const [cnInvoices, setCnInvoices] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [rcptForm, setRcptForm] = useState({ customerId: '', amount: '', bankAccountId: '', reference: '', applications: [] });
  const [openInvoices, setOpenInvoices] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [cust, inv, cn, rcpt] = await Promise.all([
        api.get('/api/accounting/ar/customers'),
        api.get('/api/accounting/ar/invoices'),
        api.get('/api/accounting/ar/credit-notes'),
        api.get('/api/accounting/ar/receipts'),
      ]);
      setCustomers(cust.data.data);
      setInvoices(inv.data.data);
      setCreditNotes(cn.data.data);
      setReceipts(rcpt.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load receivables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get('/api/accounting/tax/config').then((r) => setTaxes(r.data.data?.taxes || [])).catch(() => {});
    api.get('/api/accounting/accounts').then((r) =>
      setBankAccounts(r.data.data.filter((a) => a.isReconcilable && a.status === 'Active'))
    ).catch(() => {});
  }, []);

  async function fetchOpenInvoices(customerId, target) {
    if (!customerId) return target === 'cn' ? setCnInvoices([]) : setOpenInvoices([]);
    try {
      const res = await api.get(`/api/accounting/ar/customers/${customerId}/open-invoices`);
      if (target === 'cn') setCnInvoices(res.data.data);
      else setOpenInvoices(res.data.data);
    } catch { /* noop */ }
  }

  async function saveCustomer(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/accounting/ar/customers', { ...custForm, creditLimit: Number(custForm.creditLimit) || 0 });
      toast.success('Customer created');
      setShowCustomer(false);
      setCustForm({ name: '', email: '', phone: '', creditLimit: '' });
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  }

  async function saveInvoice(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/api/accounting/ar/invoices', {
        customerId: invForm.customerId,
        invoiceDate: invForm.invoiceDate,
        dueDate: invForm.dueDate,
        taxCode: invForm.taxCode || undefined,
        lines: invForm.lines.filter((l) => l.description && Number(l.unitPrice) > 0),
        recurring: invForm.recurringEnabled
          ? { enabled: true, frequency: invForm.recurringFrequency, endDate: invForm.recurringEndDate || undefined }
          : undefined,
      });
      toast.success(res.data.message);
      setShowInvoice(false);
      setInvForm(EMPTY_INV);
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  }

  async function runRecurring() {
    try {
      const res = await api.post('/api/accounting/ar/recurring/run');
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Recurring run failed');
    }
  }

  async function saveCreditNote(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/api/accounting/ar/credit-notes', {
        customerId: cnForm.customerId,
        invoiceId: cnForm.invoiceId || undefined,
        amount: Number(cnForm.amount),
        reason: cnForm.reason,
      });
      toast.success(res.data.message);
      setShowCreditNote(false);
      setCnForm({ customerId: '', invoiceId: '', amount: '', reason: '' });
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed to issue credit note');
    } finally {
      setSaving(false);
    }
  }

  async function saveReceipt(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const apps = rcptForm.applications.filter((a) => Number(a.amount) > 0);
      const res = await api.post('/api/accounting/ar/receipts', {
        customerId: rcptForm.customerId,
        amount: Number(rcptForm.amount),
        bankAccountId: rcptForm.bankAccountId,
        reference: rcptForm.reference || undefined,
        applications: apps.length ? apps.map((a) => ({ invoiceId: a.invoiceId, amount: Number(a.amount) })) : undefined,
      });
      toast.success(res.data.message);
      setShowReceipt(false);
      setRcptForm({ customerId: '', amount: '', bankAccountId: '', reference: '', applications: [] });
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed to record receipt');
    } finally {
      setSaving(false);
    }
  }

  const TABS = [
    ['invoices', `Invoices (${invoices.length})`],
    ['customers', `Customers (${customers.length})`],
    ['credit-notes', `Credit Notes (${creditNotes.length})`],
    ['receipts', `Receipts (${receipts.length})`],
  ];

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Accounts Receivable</h1>
            <p className="text-sm text-gray-500">Invoicing · recurring billing · cash application</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn variant="outline" onClick={runRecurring}><RotateCw size={15} /> Run Recurring</Btn>
            <Btn variant="outline" onClick={() => setShowCreditNote(true)}><FileMinus size={15} /> Credit Note</Btn>
            <Btn variant="success" onClick={() => setShowReceipt(true)}><Banknote size={15} /> Record Receipt</Btn>
            <Btn onClick={() => setShowInvoice(true)}><Plus size={15} /> New Invoice</Btn>
          </div>
        </div>

        <div className="flex gap-1.5 mb-4 flex-wrap">
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium ${tab === key ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'invoices' && (
          <Card>
            <Table
              headers={['Invoice #', 'Customer', 'Date', 'Due', { label: 'Total', right: true }, { label: 'Open', right: true }, 'Recurring', 'Status']}
              empty={!loading && invoices.length === 0 ? 'No invoices yet' : null}
            >
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2 pr-3 font-mono text-xs">{inv.invoiceNumber}</td>
                  <td className="py-2 pr-3">{inv.customerName}</td>
                  <td className="py-2 pr-3 text-xs">{fmtDate(inv.invoiceDate)}</td>
                  <td className="py-2 pr-3 text-xs">{fmtDate(inv.dueDate)}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(inv.totalBase)}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(inv.totalBase - inv.amountPaid - (inv.creditApplied || 0))}</td>
                  <td className="py-2 pr-3 text-xs">
                    {inv.recurring?.enabled ? <span className="text-blue-600 capitalize">{inv.recurring.frequency}</span> : '—'}
                  </td>
                  <td className="py-2"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </Table>
          </Card>
        )}

        {tab === 'customers' && (
          <Card actions={<Btn small variant="outline" onClick={() => setShowCustomer(true)}><UserPlus size={13} /> Add</Btn>} title="Credit Customers">
            <Table
              headers={['Name', 'Contact', { label: 'Credit Limit', right: true }, { label: 'Open Balance', right: true }, 'Status']}
              empty={!loading && customers.length === 0 ? 'No customers — add corporate/credit customers here' : null}
            >
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2 pr-3 font-medium">{c.name}</td>
                  <td className="py-2 pr-3 text-xs text-gray-500">{c.email || c.phone || '—'}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">{c.creditLimit ? `₦${fmt(c.creditLimit)}` : '—'}</td>
                  <td className={`py-2 pr-3 text-right font-mono text-xs ${c.creditLimit > 0 && c.balance > c.creditLimit ? 'text-red-600 font-bold' : ''}`}>₦{fmt(c.balance)}</td>
                  <td className="py-2"><StatusBadge status={c.isActive ? 'active' : 'cancelled'} /></td>
                </tr>
              ))}
            </Table>
          </Card>
        )}

        {tab === 'credit-notes' && (
          <Card>
            <Table
              headers={['CN #', 'Customer', 'Date', { label: 'Amount', right: true }, 'Reason', 'Status']}
              empty={!loading && creditNotes.length === 0 ? 'No credit notes issued' : null}
            >
              {creditNotes.map((cn) => (
                <tr key={cn._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2 pr-3 font-mono text-xs">{cn.creditNoteNumber}</td>
                  <td className="py-2 pr-3">{cn.customerName}</td>
                  <td className="py-2 pr-3 text-xs">{fmtDate(cn.date)}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(cn.amount)}</td>
                  <td className="py-2 pr-3 text-xs max-w-[200px] truncate">{cn.reason}</td>
                  <td className="py-2"><StatusBadge status={cn.status} /></td>
                </tr>
              ))}
            </Table>
          </Card>
        )}

        {tab === 'receipts' && (
          <Card>
            <Table
              headers={['Receipt #', 'Customer', 'Date', { label: 'Amount', right: true }, { label: 'Applied', right: true }, { label: 'Unapplied', right: true }, 'Bank']}
              empty={!loading && receipts.length === 0 ? 'No receipts recorded' : null}
            >
              {receipts.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2 pr-3 font-mono text-xs">{r.receiptNumber}</td>
                  <td className="py-2 pr-3">{r.customerName}</td>
                  <td className="py-2 pr-3 text-xs">{fmtDate(r.date)}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(r.amount)}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(r.applied)}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">{r.unapplied > 0 ? <span className="text-amber-600">₦{fmt(r.unapplied)}</span> : '—'}</td>
                  <td className="py-2 text-xs text-gray-500">{r.bankAccount?.name || '—'}</td>
                </tr>
              ))}
            </Table>
          </Card>
        )}

        {showCustomer && (
          <Modal title="New Customer" onClose={() => setShowCustomer(false)}>
            <form onSubmit={saveCustomer}>
              <Field label="Name *">
                <input className={inputCls} value={custForm.name} onChange={(e) => setCustForm({ ...custForm, name: e.target.value })} required />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email">
                  <input type="email" className={inputCls} value={custForm.email} onChange={(e) => setCustForm({ ...custForm, email: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <input className={inputCls} value={custForm.phone} onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })} />
                </Field>
              </div>
              <Field label="Credit Limit (₦)" hint="0 = no limit enforced">
                <input type="number" min="0" className={inputCls} value={custForm.creditLimit} onChange={(e) => setCustForm({ ...custForm, creditLimit: e.target.value })} />
              </Field>
              <div className="flex justify-end gap-2 mt-3">
                <Btn variant="secondary" onClick={() => setShowCustomer(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}>Save</Btn>
              </div>
            </form>
          </Modal>
        )}

        {showInvoice && (
          <Modal title="New Customer Invoice" onClose={() => setShowInvoice(false)} wide>
            <form onSubmit={saveInvoice}>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Customer *">
                  <select className={inputCls} value={invForm.customerId} onChange={(e) => setInvForm({ ...invForm, customerId: e.target.value })} required>
                    <option value="">Select…</option>
                    {customers.filter((c) => c.isActive).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Invoice Date *">
                  <input type="date" className={inputCls} value={invForm.invoiceDate} onChange={(e) => setInvForm({ ...invForm, invoiceDate: e.target.value })} required />
                </Field>
                <Field label="Due Date *">
                  <input type="date" className={inputCls} value={invForm.dueDate} onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })} required />
                </Field>
              </div>

              <Field label="Tax Code">
                <select className={inputCls} value={invForm.taxCode} onChange={(e) => setInvForm({ ...invForm, taxCode: e.target.value })}>
                  <option value="">None</option>
                  {taxes.filter((t) => t.isActive && t.kind !== 'WHT').map((t) => (
                    <option key={t.code} value={t.code}>{t.name} ({t.rate}%)</option>
                  ))}
                </select>
              </Field>

              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lines</p>
              {invForm.lines.map((l, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className={`${inputCls} flex-1`} placeholder="Description" value={l.description}
                    onChange={(e) => { const lines = [...invForm.lines]; lines[i].description = e.target.value; setInvForm({ ...invForm, lines }); }} />
                  <input type="number" step="0.01" min="0" className={`${inputCls} w-20`} placeholder="Qty" value={l.quantity}
                    onChange={(e) => { const lines = [...invForm.lines]; lines[i].quantity = e.target.value; setInvForm({ ...invForm, lines }); }} />
                  <input type="number" step="0.01" min="0" className={`${inputCls} w-28`} placeholder="Unit price" value={l.unitPrice}
                    onChange={(e) => { const lines = [...invForm.lines]; lines[i].unitPrice = e.target.value; setInvForm({ ...invForm, lines }); }} />
                  {invForm.lines.length > 1 && (
                    <button type="button" onClick={() => setInvForm({ ...invForm, lines: invForm.lines.filter((_, x) => x !== i) })} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              <Btn variant="outline" small onClick={() => setInvForm({ ...invForm, lines: [...invForm.lines, { description: '', quantity: 1, unitPrice: '' }] })}>
                <Plus size={13} /> Add line
              </Btn>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-gray-800 rounded-lg">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={invForm.recurringEnabled} onChange={(e) => setInvForm({ ...invForm, recurringEnabled: e.target.checked })} />
                  Recurring invoice (subscription billing)
                </label>
                {invForm.recurringEnabled && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Field label="Frequency">
                      <select className={inputCls} value={invForm.recurringFrequency} onChange={(e) => setInvForm({ ...invForm, recurringFrequency: e.target.value })}>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </Field>
                    <Field label="End Date (optional)">
                      <input type="date" className={inputCls} value={invForm.recurringEndDate} onChange={(e) => setInvForm({ ...invForm, recurringEndDate: e.target.value })} />
                    </Field>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Btn variant="secondary" onClick={() => setShowInvoice(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}>{saving ? 'Posting…' : 'Create & Post'}</Btn>
              </div>
            </form>
          </Modal>
        )}

        {showCreditNote && (
          <Modal title="Issue Credit Note" onClose={() => setShowCreditNote(false)}>
            <form onSubmit={saveCreditNote}>
              <Field label="Customer *">
                <select className={inputCls} value={cnForm.customerId}
                  onChange={(e) => { setCnForm({ ...cnForm, customerId: e.target.value, invoiceId: '' }); fetchOpenInvoices(e.target.value, 'cn'); }} required>
                  <option value="">Select…</option>
                  {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Apply to Invoice" hint="Leave empty for an on-account credit">
                <select className={inputCls} value={cnForm.invoiceId} onChange={(e) => setCnForm({ ...cnForm, invoiceId: e.target.value })}>
                  <option value="">On account</option>
                  {cnInvoices.map((i) => (
                    <option key={i._id} value={i._id}>{i.invoiceNumber} — open ₦{fmt(i.openBalance)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Amount (₦) *">
                <input type="number" step="0.01" min="0.01" className={inputCls} value={cnForm.amount} onChange={(e) => setCnForm({ ...cnForm, amount: e.target.value })} required />
              </Field>
              <Field label="Reason *">
                <input className={inputCls} value={cnForm.reason} onChange={(e) => setCnForm({ ...cnForm, reason: e.target.value })} required />
              </Field>
              <div className="flex justify-end gap-2 mt-3">
                <Btn variant="secondary" onClick={() => setShowCreditNote(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}>Issue</Btn>
              </div>
            </form>
          </Modal>
        )}

        {showReceipt && (
          <Modal title="Record Incoming Payment (Cash Application)" onClose={() => setShowReceipt(false)} wide>
            <form onSubmit={saveReceipt}>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Customer *">
                  <select className={inputCls} value={rcptForm.customerId}
                    onChange={(e) => { setRcptForm({ ...rcptForm, customerId: e.target.value, applications: [] }); fetchOpenInvoices(e.target.value, 'rcpt'); }} required>
                    <option value="">Select…</option>
                    {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Amount Received (₦) *">
                  <input type="number" step="0.01" min="0.01" className={inputCls} value={rcptForm.amount} onChange={(e) => setRcptForm({ ...rcptForm, amount: e.target.value })} required />
                </Field>
                <Field label="Into Bank *">
                  <select className={inputCls} value={rcptForm.bankAccountId} onChange={(e) => setRcptForm({ ...rcptForm, bankAccountId: e.target.value })} required>
                    <option value="">Select…</option>
                    {bankAccounts.map((a) => <option key={a._id} value={a._id}>{a.code} — {a.name}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Bank Reference" hint="transfer narration for reconciliation matching">
                <input className={inputCls} value={rcptForm.reference} onChange={(e) => setRcptForm({ ...rcptForm, reference: e.target.value })} />
              </Field>

              {openInvoices.length > 0 && (
                <>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Apply against invoices <span className="text-gray-400 font-normal">(leave blank to auto-apply oldest first)</span>
                  </p>
                  <div className="border border-gray-100 dark:border-gray-800 rounded-lg divide-y divide-gray-50 dark:divide-gray-800 max-h-52 overflow-y-auto mb-2">
                    {openInvoices.map((inv) => {
                      const app = rcptForm.applications.find((a) => a.invoiceId === inv._id);
                      return (
                        <div key={inv._id} className="flex items-center gap-3 px-3 py-2 text-sm">
                          <span className="font-mono text-xs">{inv.invoiceNumber}</span>
                          <span className="flex-1 text-xs text-gray-400">due {fmtDate(inv.dueDate)}</span>
                          <span className="font-mono text-xs">open ₦{fmt(inv.openBalance)}</span>
                          <input
                            type="number" step="0.01" min="0" max={inv.openBalance}
                            className={`${inputCls} !w-28 !py-1 text-right`}
                            placeholder="0.00"
                            value={app?.amount ?? ''}
                            onChange={(e) => {
                              const others = rcptForm.applications.filter((a) => a.invoiceId !== inv._id);
                              setRcptForm({
                                ...rcptForm,
                                applications: e.target.value ? [...others, { invoiceId: inv._id, amount: e.target.value }] : others,
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 mt-3">
                <Btn variant="secondary" onClick={() => setShowReceipt(false)}>Cancel</Btn>
                <Btn type="submit" variant="success" disabled={saving}>{saving ? 'Recording…' : 'Record Receipt'}</Btn>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
