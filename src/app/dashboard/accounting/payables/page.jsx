'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import { Plus, Trash2, Link2, BookCheck, RefreshCw, Download, Printer, CheckCircle2, PlayCircle, FileMinus2, RotateCcw, Ban } from 'lucide-react';
import { api, Card, Modal, Field, inputCls, Btn, StatusBadge, Table, Hint, fmt, fmtDate, downloadBlob } from '../shared';
import { extractApiError } from '@/lib/config';

const EMPTY_INV = {
  invoiceNumber: '', supplierName: '', invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '', taxCode: '', poType: 'none', poId: '', expenseAccountCode: '',
  lines: [{ description: '', quantity: 1, unitCost: '' }],
};

const EMPTY_CN = {
  supplierName: '', invoiceId: '', reason: 'overbilling', taxCode: '', notes: '',
  lines: [{ description: '', quantity: 1, unitCost: '' }],
};

// Plain-English labels for the credit-note reasons (so a non-accountant picks the right one)
const CN_REASONS = [
  { value: 'overbilling', label: 'Supplier over-billed us' },
  { value: 'return', label: 'Goods returned to supplier' },
  { value: 'damaged', label: 'Damaged / faulty goods' },
  { value: 'price_adjustment', label: 'Agreed price adjustment' },
  { value: 'other', label: 'Other reason' },
];

const openBalance = (inv) => Number(inv.totalBase || 0) - Number(inv.amountPaid || 0) - Number(inv.creditApplied || 0);

export default function PayablesPage() {
  const [tab, setTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [batches, setBatches] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [openPOs, setOpenPOs] = useState({ lubricant: [], gas: [], gas_cylinder: [], fuel: [] });
  const [taxes, setTaxes] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvModal, setShowInvModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showCNModal, setShowCNModal] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);   // credit note being applied
  const [applyInvoiceId, setApplyInvoiceId] = useState('');
  const [reverseTarget, setReverseTarget] = useState(null); // batch being reversed
  const [reverseReason, setReverseReason] = useState('');
  const [invForm, setInvForm] = useState(EMPTY_INV);
  const [batchForm, setBatchForm] = useState({ payDate: new Date().toISOString().split('T')[0], method: 'EFT', bankAccountId: '', invoiceIds: [] });
  const [cnForm, setCnForm] = useState(EMPTY_CN);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [inv, bat, cn] = await Promise.all([
        api.get('/api/accounting/ap/invoices'),
        api.get('/api/accounting/ap/batches'),
        api.get('/api/accounting/ap/credit-notes'),
      ]);
      setInvoices(inv.data.data);
      setBatches(bat.data.data);
      setCreditNotes(cn.data.data);
    } catch (e) {
      toast.error(extractApiError(e) || 'Failed to load payables');
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
  const cnSubtotal = cnForm.lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitCost) || 0), 0);

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
      toast.error(extractApiError(e2) || 'Failed to register invoice');
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
      toast.error(extractApiError(e) || 'Re-match failed');
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
      toast.error(extractApiError(e2) || 'Failed to create batch');
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
      toast.error(extractApiError(e) || `${verb} failed`);
    }
  }

  async function reverseBatch(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post(`/api/accounting/ap/batches/${reverseTarget._id}/reverse`, { reason: reverseReason || undefined });
      toast.success(res.data.message);
      setReverseTarget(null);
      setReverseReason('');
      load();
    } catch (e2) {
      toast.error(extractApiError(e2) || 'Reversal failed');
    } finally {
      setSaving(false);
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

  // ── Credit notes ──────────────────────────────────────────────────────────
  function openCreditNote(inv) {
    // inv is optional — pre-fill supplier + link when raised against a specific invoice
    setCnForm({
      ...EMPTY_CN,
      supplierName: inv?.supplierName || '',
      invoiceId: inv?._id || '',
      lines: [{ description: inv ? `Credit — ${inv.invoiceNumber}` : 'Credit adjustment', quantity: 1, unitCost: '' }],
    });
    setShowCNModal(true);
  }

  async function createCreditNote(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/api/accounting/ap/credit-notes', {
        supplierName: cnForm.supplierName,
        invoiceId: cnForm.invoiceId || undefined,
        reason: cnForm.reason,
        taxCode: cnForm.taxCode || undefined,
        notes: cnForm.notes || undefined,
        lines: cnForm.lines.filter((l) => l.description && Number(l.unitCost) > 0),
      });
      toast.success(res.data.message);
      setShowCNModal(false);
      setCnForm(EMPTY_CN);
      load();
      setTab('credit-notes');
    } catch (e2) {
      toast.error(extractApiError(e2) || 'Failed to issue credit note');
    } finally {
      setSaving(false);
    }
  }

  async function applyCreditNote(e) {
    e.preventDefault();
    if (!applyInvoiceId) return toast.error('Choose an invoice to apply the credit to');
    setSaving(true);
    try {
      const res = await api.post(`/api/accounting/ap/credit-notes/${applyTarget._id}/apply`, { invoiceId: applyInvoiceId });
      toast.success(res.data.message);
      setApplyTarget(null);
      setApplyInvoiceId('');
      load();
    } catch (e2) {
      toast.error(extractApiError(e2) || 'Apply failed');
    } finally {
      setSaving(false);
    }
  }

  async function voidCreditNote(cn) {
    if (!confirm(`Void credit note ${cn.creditNoteNumber}? A reversing journal entry will post and any invoice it reduced returns to its previous balance.`)) return;
    try {
      const res = await api.post(`/api/accounting/ap/credit-notes/${cn._id}/void`);
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(extractApiError(e) || 'Void failed');
    }
  }

  const payable = invoices.filter((i) => ['booked', 'partially_paid'].includes(i.status));
  const creditable = invoices.filter((i) => ['booked', 'partially_paid', 'paid'].includes(i.status));
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
            <p className="text-sm text-gray-500">3-way matching · payment execution · corrections</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => openCreditNote(null)}><FileMinus2 size={15} /> Credit Note</Btn>
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
          {['invoices', 'batches', 'credit-notes'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
              {t === 'invoices' ? `Invoices (${invoices.length})`
                : t === 'batches' ? `Payment Batches (${batches.length})`
                : `Credit Notes (${creditNotes.length})`}
            </button>
          ))}
        </div>

        {tab === 'invoices' && (
          <Card>
            <Table
              headers={['Ref', 'Supplier', 'Invoice #', 'Due', { label: 'Total', right: true }, { label: 'Paid', right: true }, { label: 'Credit', right: true }, '3-Way Match', 'Status', '']}
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
                  <td className="py-2 pr-3 text-right font-mono text-xs">
                    {inv.creditApplied > 0 ? <span className="text-purple-600">₦{fmt(inv.creditApplied)}</span> : <span className="text-gray-300">—</span>}
                  </td>
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
                    {['booked', 'partially_paid', 'paid'].includes(inv.status) && (
                      <button onClick={() => openCreditNote(inv)} className="p-1 text-gray-400 hover:text-purple-600" title="Issue a credit note against this invoice">
                        <FileMinus2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        )}

        {tab === 'batches' && (
          <>
            <Hint>
              A payment batch pays one or more booked invoices in a single run. Made a mistake — wrong amount,
              a bounced check, or a duplicate payment? Use <b>Reverse</b> (the ↺ button) on an executed batch.
              It cancels the payment in the books and re-opens the invoices so they show as unpaid again, ready
              to be paid correctly. Nothing is deleted — the reversal is recorded for the audit trail.
            </Hint>
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
                      {b.status === 'executed' && (
                        <button onClick={() => { setReverseTarget(b); setReverseReason(''); }} className="p-1 text-gray-400 hover:text-red-600" title="Reverse this payment">
                          <RotateCcw size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          </>
        )}

        {tab === 'credit-notes' && (
          <>
            <Hint>
              A <b>credit note</b> is money a supplier owes back to you — because they over-billed, you returned
              goods, or the goods were damaged. It reduces what you owe that supplier. Raise one against a specific
              invoice to lower its balance, or on its own to keep as a credit you use on a future invoice. Use a
              credit note (not "void") whenever the original invoice was already paid or partly paid — voiding is
              only for a fresh invoice with no payments.
            </Hint>
            <Card>
              <Table
                headers={['Number', 'Supplier', 'Reason', 'For Invoice', { label: 'Amount', right: true }, { label: 'Applied', right: true }, 'Status', '']}
                empty={!loading && creditNotes.length === 0 ? 'No credit notes yet' : null}
              >
                {creditNotes.map((cn) => (
                  <tr key={cn._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-2 pr-3 font-mono text-xs">{cn.creditNoteNumber}</td>
                    <td className="py-2 pr-3">{cn.supplierName}</td>
                    <td className="py-2 pr-3 text-xs capitalize">{String(cn.reason || '').replace(/_/g, ' ')}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{cn.invoiceRef || <span className="text-gray-300">unapplied</span>}</td>
                    <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(cn.totalBase)}</td>
                    <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(cn.amountApplied)}</td>
                    <td className="py-2 pr-3"><StatusBadge status={cn.status} /></td>
                    <td className="py-2 whitespace-nowrap">
                      {cn.status === 'open' && (
                        <button onClick={() => { setApplyTarget(cn); setApplyInvoiceId(''); }} className="p-1 text-gray-400 hover:text-blue-600" title="Apply to an invoice">
                          <Link2 size={15} />
                        </button>
                      )}
                      {cn.status !== 'void' && (
                        <button onClick={() => voidCreditNote(cn)} className="p-1 text-gray-400 hover:text-red-600" title="Void credit note">
                          <Ban size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            </Card>
          </>
        )}

        {/* ── Register Invoice ── */}
        {showInvModal && (
          <Modal title="Register Supplier Invoice" onClose={() => setShowInvModal(false)} wide>
            <form onSubmit={createInvoice}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {/* ── New Payment Batch ── */}
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
                    <span className="font-mono text-xs">₦{fmt(openBalance(inv))}</span>
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

        {/* ── Issue Credit Note ── */}
        {showCNModal && (
          <Modal title="Issue Supplier Credit Note" onClose={() => setShowCNModal(false)} wide>
            <div className="mb-3">
              <Hint>
                Fill this in when a supplier agrees to credit you money — enter the amount they're crediting and why.
                Link it to the invoice it relates to and it lowers that invoice's balance straight away. Leave the
                invoice blank to keep it as an open credit you can apply later.
              </Hint>
            </div>
            <form onSubmit={createCreditNote}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Supplier Name *">
                  <input className={inputCls} value={cnForm.supplierName} onChange={(e) => setCnForm({ ...cnForm, supplierName: e.target.value })} required />
                </Field>
                <Field label="Reason *">
                  <select className={inputCls} value={cnForm.reason} onChange={(e) => setCnForm({ ...cnForm, reason: e.target.value })}>
                    {CN_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Apply to Invoice" hint="Optional — the invoice this credit reduces. Leave blank for an open credit.">
                <select className={inputCls} value={cnForm.invoiceId}
                  onChange={(e) => {
                    const inv = creditable.find((i) => i._id === e.target.value);
                    setCnForm({ ...cnForm, invoiceId: e.target.value, supplierName: inv?.supplierName || cnForm.supplierName });
                  }}>
                  <option value="">None (open credit)</option>
                  {creditable.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.internalRef} — {inv.supplierName} · open ₦{fmt(openBalance(inv))}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tax Code" hint="Pick the same VAT code as the invoice so the input VAT is reversed too.">
                <select className={inputCls} value={cnForm.taxCode} onChange={(e) => setCnForm({ ...cnForm, taxCode: e.target.value })}>
                  <option value="">None</option>
                  {taxes.filter((t) => t.isActive && t.kind !== 'WHT').map((t) => (
                    <option key={t.code} value={t.code}>{t.name} ({t.rate}%)</option>
                  ))}
                </select>
              </Field>

              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credit Lines <span className="font-normal text-gray-400">— what is being credited</span>
              </p>
              {cnForm.lines.map((l, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className={`${inputCls} flex-1`} placeholder="Description" value={l.description}
                    onChange={(e) => { const lines = [...cnForm.lines]; lines[i].description = e.target.value; setCnForm({ ...cnForm, lines }); }} />
                  <input type="number" step="0.01" min="0" className={`${inputCls} w-20`} placeholder="Qty" value={l.quantity}
                    onChange={(e) => { const lines = [...cnForm.lines]; lines[i].quantity = e.target.value; setCnForm({ ...cnForm, lines }); }} />
                  <input type="number" step="0.01" min="0" className={`${inputCls} w-28`} placeholder="Amount" value={l.unitCost}
                    onChange={(e) => { const lines = [...cnForm.lines]; lines[i].unitCost = e.target.value; setCnForm({ ...cnForm, lines }); }} />
                  {cnForm.lines.length > 1 && (
                    <button type="button" onClick={() => setCnForm({ ...cnForm, lines: cnForm.lines.filter((_, x) => x !== i) })} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              <div className="flex justify-between items-center mb-3">
                <Btn variant="outline" small onClick={() => setCnForm({ ...cnForm, lines: [...cnForm.lines, { description: '', quantity: 1, unitCost: '' }] })}>
                  <Plus size={13} /> Add line
                </Btn>
                <span className="text-sm font-mono">Credit subtotal: ₦{fmt(cnSubtotal)}</span>
              </div>

              <Field label="Notes">
                <input className={inputCls} value={cnForm.notes} onChange={(e) => setCnForm({ ...cnForm, notes: e.target.value })} placeholder="e.g. Supplier credit note ref #, agreed with…" />
              </Field>

              <div className="flex justify-end gap-2">
                <Btn variant="secondary" onClick={() => setShowCNModal(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}>{saving ? 'Issuing…' : 'Issue Credit Note'}</Btn>
              </div>
            </form>
          </Modal>
        )}

        {/* ── Apply Credit Note ── */}
        {applyTarget && (
          <Modal title={`Apply ${applyTarget.creditNoteNumber}`} onClose={() => setApplyTarget(null)}>
            <div className="mb-3">
              <Hint>
                This uses an open supplier credit to reduce an unpaid invoice's balance — so you pay less on that
                invoice. Only invoices from the same supplier that still owe money can be chosen.
              </Hint>
            </div>
            <form onSubmit={applyCreditNote}>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Credit available: <span className="font-mono font-semibold">₦{fmt(applyTarget.totalBase - applyTarget.amountApplied)}</span>
              </p>
              <Field label="Apply to Invoice *">
                <select className={inputCls} value={applyInvoiceId} onChange={(e) => setApplyInvoiceId(e.target.value)} required>
                  <option value="">Choose an unpaid invoice…</option>
                  {payable
                    .filter((inv) => inv.supplierName === applyTarget.supplierName)
                    .map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        {inv.internalRef} — open ₦{fmt(openBalance(inv))}
                      </option>
                    ))}
                </select>
              </Field>
              <div className="flex justify-end gap-2">
                <Btn variant="secondary" onClick={() => setApplyTarget(null)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}>{saving ? 'Applying…' : 'Apply Credit'}</Btn>
              </div>
            </form>
          </Modal>
        )}

        {/* ── Reverse Payment Batch ── */}
        {reverseTarget && (
          <Modal title={`Reverse Payment ${reverseTarget.batchNumber}`} onClose={() => setReverseTarget(null)}>
            <div className="mb-3">
              <Hint>
                Undo this payment: the money goes back in the books and every invoice this batch paid becomes
                unpaid again, ready to be paid correctly. Use this for a bounced check, wrong amount, or a
                duplicate payment. The original is kept and marked "reversed" for the audit trail — nothing is
                deleted.
              </Hint>
            </div>
            <form onSubmit={reverseBatch}>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                This will re-open <b>{reverseTarget.payments?.length || 0}</b> invoice(s) totalling{' '}
                <span className="font-mono font-semibold">₦{fmt(reverseTarget.totalAmount)}</span>.
              </p>
              <Field label="Reason" hint="Recorded on the reversal for the audit trail.">
                <input className={inputCls} value={reverseReason} onChange={(e) => setReverseReason(e.target.value)} placeholder="e.g. Cheque bounced / duplicate payment" />
              </Field>
              <div className="flex justify-end gap-2">
                <Btn variant="secondary" onClick={() => setReverseTarget(null)}>Cancel</Btn>
                <Btn type="submit" variant="danger" disabled={saving}>{saving ? 'Reversing…' : 'Reverse Payment'}</Btn>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
