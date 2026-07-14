'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import { Plus, Trash2, Link2, BookCheck, RefreshCw, Download, Printer, CheckCircle2, PlayCircle } from 'lucide-react';
import { api, Card, Modal, Field, inputCls, Btn, StatusBadge, Table, Hint, fmt, fmtDate, downloadBlob } from '../shared';

const EMPTY_INV = {
  invoiceNumber: '', supplierName: '', invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '', taxCode: '', poType: 'none', poId: '', expenseAccountCode: '',
  lines: [{ description: '', quantity: 1, unitCost: '' }],
};

export default function PayablesPage() {
  const [tab, setTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [batches, setBatches] = useState([]);
  const [openPOs, setOpenPOs] = useState({ lubricant: [], gas: [], gas_cylinder: [], fuel: [] });
  const [taxes, setTaxes] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvModal, setShowInvModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [invForm, setInvForm] = useState(EMPTY_INV);
  const [batchForm, setBatchForm] = useState({ payDate: new Date().toISOString().split('T')[0], method: 'EFT', bankAccountId: '', invoiceIds: [] });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [inv, bat] = await Promise.all([
        api.get('/api/accounting/ap/invoices'),
        api.get('/api/accounting/ap/batches'),
      ]);
      setInvoices(inv.data.data);
      setBatches(bat.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load payables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get('/api/accounting/ap/open-pos').then((r) => setOpenPOs(r.data.data)).catch(() => {});
    api.get('/api/accounting/tax/config').then((r) => setTaxes(r.data.data?.taxes || [])).catch(() => {});
    api.get('/api/accounting/accounts').then((r) => {
      setBankAccounts(r.data.data.filter((a) => a.isReconcilable && a.status === 'Active'));
      setExpenseAccounts(r.data.data.filter((a) => a.type === 'Expense' && a.status === 'Active'));
    }).catch(() => {});
  }, []);

  const subtotal = invForm.lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitCost) || 0), 0);

  async function createInvoice(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/api/accounting/ap/invoices', {
        ...invForm,
        poId: invForm.poType === 'none' ? undefined : invForm.poId,
        taxCode: invForm.taxCode || undefined,
        expenseAccountCode: invForm.poType === 'none' ? (invForm.expenseAccountCode || undefined) : undefined,
        lines: invForm.lines.filter((l) => l.description && Number(l.unitCost) > 0),
      });
      toast.success(res.data.message);
      setShowInvModal(false);
      setInvForm(EMPTY_INV);
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed to register invoice');
    } finally {
      setSaving(false);
    }
  }

  async function book(inv, override = false) {
    try {
      const res = await api.post(`/api/accounting/ap/invoices/${inv._id}/book`, { overrideVariance: override });
      toast.success(res.data.message);
      load();
    } catch (e) {
      const data = e.response?.data;
      if (data?.matchStatus === 'variance' && confirm(`${data.message}\n\nBook anyway with an override? This is recorded in the audit trail.`)) {
        return book(inv, true);
      }
      if (data?.matchStatus !== 'variance') toast.error(data?.message || 'Booking failed');
    }
  }

  async function rematch(inv) {
    try {
      const res = await api.post(`/api/accounting/ap/invoices/${inv._id}/rematch`);
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Re-match failed');
    }
  }

  async function createBatch(e) {
    e.preventDefault();
    if (!batchForm.invoiceIds.length) return toast.error('Select at least one invoice');
    setSaving(true);
    try {
      const res = await api.post('/api/accounting/ap/batches', batchForm);
      toast.success(res.data.message);
      setShowBatchModal(false);
      setBatchForm({ payDate: new Date().toISOString().split('T')[0], method: 'EFT', bankAccountId: '', invoiceIds: [] });
      load();
      setTab('batches');
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed to create batch');
    } finally {
      setSaving(false);
    }
  }

  async function batchAction(b, verb) {
    try {
      const method = verb === 'approve' ? 'patch' : 'post';
      const res = await api[method](`/api/accounting/ap/batches/${b._id}/${verb}`);
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || `${verb} failed`);
    }
  }

  async function downloadEFT(b) {
    try {
      const res = await api.get(`/api/accounting/ap/batches/${b._id}/eft-file`, { responseType: 'text' });
      downloadBlob(res.data, `${b.batchNumber}-${b.method}.csv`);
    } catch (e) {
      toast.error('File generation failed');
    }
  }

  async function printChecks(b) {
    try {
      const res = await api.get(`/api/accounting/ap/batches/${b._id}/checks`);
      const checks = res.data.data.checks;
      const win = window.open('', '_blank');
      win.document.write(`
        <html><head><title>Checks — ${b.batchNumber}</title>
        <style>body{font-family:Georgia,serif} .check{border:1px solid #999;border-radius:8px;padding:24px;margin:16px;max-width:700px}
        .row{display:flex;justify-content:space-between;margin-bottom:12px}.amount{font-size:20px;font-weight:bold}
        .words{border-bottom:1px solid #ccc;padding-bottom:4px;font-style:italic}</style></head><body>
        ${checks.map((c) => `
          <div class="check">
            <div class="row"><span>Check #: <b>${c.checkNumber}</b></span><span>Date: ${new Date(c.date).toLocaleDateString()}</span></div>
            <div class="row"><span>Pay to the order of: <b>${c.payee}</b></span><span class="amount">₦${Number(c.amount).toLocaleString()}</span></div>
            <p class="words">${c.amountInWords}</p>
            <p style="font-size:12px;color:#666">Memo: ${c.memo}</p>
          </div>`).join('')}
        <script>window.print()</script></body></html>`);
      win.document.close();
    } catch {
      toast.error('Check data failed');
    }
  }

  const payable = invoices.filter((i) => ['booked', 'partially_paid'].includes(i.status));
  const poOptions =
    invForm.poType === 'lubricant' ? openPOs.lubricant
    : invForm.poType === 'gas' ? openPOs.gas
    : invForm.poType === 'gas_cylinder' ? (openPOs.gas_cylinder || [])
    : invForm.poType === 'fuel' ? (openPOs.fuel || [])
    : [];

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Accounts Payable</h1>
            <p className="text-sm text-gray-500">3-way matching · payment execution</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => setShowBatchModal(true)} disabled={!payable.length}>Payment Batch</Btn>
            <Btn onClick={() => setShowInvModal(true)}><Plus size={15} /> Register Invoice</Btn>
          </div>
        </div>

        <Hint>
          Payables tracks money the station owes suppliers. When a supplier's invoice arrives, register it here —
          the system runs a 3-way match: it compares the invoice against your purchase order (what you ordered)
          and the goods receipt (what actually arrived). Only matching invoices book into the ledger, so you never
          pay for goods you didn't receive. Pay booked invoices in batches: by bank transfer (download the EFT
          file for your bank) or by printed check. Withholding tax is deducted automatically at payment.
        </Hint>

        <div className="flex gap-1.5 mb-4">
          {['invoices', 'batches'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
              {t === 'invoices' ? `Invoices (${invoices.length})` : `Payment Batches (${batches.length})`}
            </button>
          ))}
        </div>

        {tab === 'invoices' && (
          <Card>
            <Table
              headers={['Ref', 'Supplier', 'Invoice #', 'Due', { label: 'Total', right: true }, { label: 'Paid', right: true }, '3-Way Match', 'Status', '']}
              empty={!loading && invoices.length === 0 ? 'No supplier invoices registered yet' : null}
            >
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2 pr-3 font-mono text-xs">{inv.internalRef}</td>
                  <td className="py-2 pr-3">{inv.supplierName}</td>
                  <td className="py-2 pr-3 text-xs">{inv.invoiceNumber}</td>
                  <td className="py-2 pr-3 text-xs">{fmtDate(inv.dueDate)}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(inv.totalBase)}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(inv.amountPaid)}</td>
                  <td className="py-2 pr-3">
                    {inv.match?.poType !== 'none' ? (
                      <span title={inv.match?.matchNotes}><StatusBadge status={inv.matchStatus} /></span>
                    ) : <span className="text-xs text-gray-300">no PO</span>}
                  </td>
                  <td className="py-2 pr-3"><StatusBadge status={inv.status} /></td>
                  <td className="py-2 whitespace-nowrap">
                    {inv.status === 'draft' && (
                      <>
                        {inv.match?.poType !== 'none' && inv.matchStatus !== 'matched' && (
                          <button onClick={() => rematch(inv)} className="p-1 text-gray-400 hover:text-amber-600" title="Re-run 3-way match">
                            <RefreshCw size={15} />
                          </button>
                        )}
                        <button onClick={() => book(inv)} className="p-1 text-gray-400 hover:text-emerald-600" title="Book into Payables">
                          <BookCheck size={15} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        )}

        {tab === 'batches' && (
          <Card>
            <Table
              headers={['Batch', 'Pay Date', 'Method', { label: 'Gross', right: true }, { label: 'WHT', right: true }, { label: 'Net', right: true }, 'Status', '']}
              empty={!loading && batches.length === 0 ? 'No payment batches yet' : null}
            >
              {batches.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2 pr-3 font-mono text-xs">{b.batchNumber}</td>
                  <td className="py-2 pr-3 text-xs">{fmtDate(b.payDate)}</td>
                  <td className="py-2 pr-3 text-xs">{b.method}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(b.totalAmount)}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(b.totalWht)}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(b.totalNet)}</td>
                  <td className="py-2 pr-3"><StatusBadge status={b.status} /></td>
                  <td className="py-2 whitespace-nowrap">
                    {b.status === 'draft' && (
                      <button onClick={() => batchAction(b, 'approve')} className="p-1 text-gray-400 hover:text-blue-600" title="Approve (maker-checker)">
                        <CheckCircle2 size={15} />
                      </button>
                    )}
                    {b.status === 'approved' && (
                      <button onClick={() => { if (confirm('Execute this batch? The payment journal will post.')) batchAction(b, 'execute'); }}
                        className="p-1 text-gray-400 hover:text-emerald-600" title="Execute payment">
                        <PlayCircle size={15} />
                      </button>
                    )}
                    {['approved', 'executed'].includes(b.status) && b.method !== 'check' && (
                      <button onClick={() => downloadEFT(b)} className="p-1 text-gray-400 hover:text-blue-600" title={`Download ${b.method} file`}>
                        <Download size={15} />
                      </button>
                    )}
                    {b.status === 'executed' && b.method === 'check' && (
                      <button onClick={() => printChecks(b)} className="p-1 text-gray-400 hover:text-blue-600" title="Print checks">
                        <Printer size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        )}

        {showInvModal && (
          <Modal title="Register Supplier Invoice" onClose={() => setShowInvModal(false)} wide>
            <form onSubmit={createInvoice}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Supplier Name *">
                  <input className={inputCls} value={invForm.supplierName} onChange={(e) => setInvForm({ ...invForm, supplierName: e.target.value })} required />
                </Field>
                <Field label="Supplier Invoice # *">
                  <input className={inputCls} value={invForm.invoiceNumber} onChange={(e) => setInvForm({ ...invForm, invoiceNumber: e.target.value })} required />
                </Field>
                <Field label="Invoice Date *">
                  <input type="date" className={inputCls} value={invForm.invoiceDate} onChange={(e) => setInvForm({ ...invForm, invoiceDate: e.target.value })} required />
                </Field>
                <Field label="Due Date *">
                  <input type="date" className={inputCls} value={invForm.dueDate} onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })} required />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Purchase Order (3-way match)" hint="Matching against PO + goods receipt before booking">
                  <select className={inputCls} value={invForm.poType} onChange={(e) => setInvForm({ ...invForm, poType: e.target.value, poId: '' })}>
                    <option value="none">No PO (expense invoice)</option>
                    <option value="lubricant">Lubricant procurement</option>
                    <option value="gas">Gas procurement (bulk LPG)</option>
                    <option value="gas_cylinder">Gas cylinder PO</option>
                    <option value="fuel">Fuel purchase / delivery</option>
                  </select>
                </Field>
                {invForm.poType !== 'none' && (
                  <Field label="Select PO *">
                    <select className={inputCls} value={invForm.poId} onChange={(e) => setInvForm({ ...invForm, poId: e.target.value })} required>
                      <option value="">Choose…</option>
                      {poOptions.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.poNumber} — {p.vendor} (₦{fmt(p.amount)}){p.grnRecorded ? ' ✓GRN' : ' — awaiting GRN'}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                {invForm.poType === 'none' && (
                  <Field label="Book Expense To" hint="e.g. a product's cost account — 5010 PMS Cost of Sales">
                    <select className={inputCls} value={invForm.expenseAccountCode} onChange={(e) => setInvForm({ ...invForm, expenseAccountCode: e.target.value })}>
                      <option value="">Other Expenses (default)</option>
                      {expenseAccounts.map((a) => (
                        <option key={a._id} value={a.code}>{a.code} — {a.name}</option>
                      ))}
                    </select>
                  </Field>
                )}
              </div>

              <Field label="Tax Code">
                <select className={inputCls} value={invForm.taxCode} onChange={(e) => setInvForm({ ...invForm, taxCode: e.target.value })}>
                  <option value="">None</option>
                  {taxes.filter((t) => t.isActive).map((t) => (
                    <option key={t.code} value={t.code}>{t.name} ({t.rate}%)</option>
                  ))}
                </select>
              </Field>

              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Lines</p>
              {invForm.lines.map((l, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className={`${inputCls} flex-1`} placeholder="Description" value={l.description}
                    onChange={(e) => { const lines = [...invForm.lines]; lines[i].description = e.target.value; setInvForm({ ...invForm, lines }); }} />
                  <input type="number" step="0.01" min="0" className={`${inputCls} w-20`} placeholder="Qty" value={l.quantity}
                    onChange={(e) => { const lines = [...invForm.lines]; lines[i].quantity = e.target.value; setInvForm({ ...invForm, lines }); }} />
                  <input type="number" step="0.01" min="0" className={`${inputCls} w-28`} placeholder="Unit cost" value={l.unitCost}
                    onChange={(e) => { const lines = [...invForm.lines]; lines[i].unitCost = e.target.value; setInvForm({ ...invForm, lines }); }} />
                  {invForm.lines.length > 1 && (
                    <button type="button" onClick={() => setInvForm({ ...invForm, lines: invForm.lines.filter((_, x) => x !== i) })} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              <div className="flex justify-between items-center mb-3">
                <Btn variant="outline" small onClick={() => setInvForm({ ...invForm, lines: [...invForm.lines, { description: '', quantity: 1, unitCost: '' }] })}>
                  <Plus size={13} /> Add line
                </Btn>
                <span className="text-sm font-mono">Subtotal: ₦{fmt(subtotal)}</span>
              </div>

              <div className="flex justify-end gap-2">
                <Btn variant="secondary" onClick={() => setShowInvModal(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Register & Match'}</Btn>
              </div>
            </form>
          </Modal>
        )}

        {showBatchModal && (
          <Modal title="New Payment Batch" onClose={() => setShowBatchModal(false)} wide>
            <form onSubmit={createBatch}>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Pay Date *">
                  <input type="date" className={inputCls} value={batchForm.payDate} onChange={(e) => setBatchForm({ ...batchForm, payDate: e.target.value })} required />
                </Field>
                <Field label="Method *">
                  <select className={inputCls} value={batchForm.method} onChange={(e) => setBatchForm({ ...batchForm, method: e.target.value })}>
                    <option value="EFT">EFT (bank transfer)</option>
                    <option value="ACH">ACH</option>
                    <option value="check">Check</option>
                  </select>
                </Field>
                <Field label="Pay From (Bank) *">
                  <select className={inputCls} value={batchForm.bankAccountId} onChange={(e) => setBatchForm({ ...batchForm, bankAccountId: e.target.value })} required>
                    <option value="">Select…</option>
                    {bankAccounts.map((a) => <option key={a._id} value={a._id}>{a.code} — {a.name}</option>)}
                  </select>
                </Field>
              </div>

              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select invoices to pay</p>
              <div className="border border-gray-100 dark:border-gray-800 rounded-lg divide-y divide-gray-50 dark:divide-gray-800 max-h-64 overflow-y-auto mb-3">
                {payable.map((inv) => (
                  <label key={inv._id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <input
                      type="checkbox"
                      checked={batchForm.invoiceIds.includes(inv._id)}
                      onChange={(e) => setBatchForm({
                        ...batchForm,
                        invoiceIds: e.target.checked
                          ? [...batchForm.invoiceIds, inv._id]
                          : batchForm.invoiceIds.filter((id) => id !== inv._id),
                      })}
                    />
                    <span className="font-mono text-xs">{inv.internalRef}</span>
                    <span className="flex-1">{inv.supplierName}</span>
                    <span className="font-mono text-xs">₦{fmt(inv.totalBase - inv.amountPaid)}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Btn variant="secondary" onClick={() => setShowBatchModal(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}>{saving ? 'Creating…' : `Create Batch (${batchForm.invoiceIds.length})`}</Btn>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
