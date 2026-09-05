'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import { Plus, Trash2, FileCheck2, Calculator } from 'lucide-react';
import { api, Card, Modal, Field, inputCls, Btn, Table, Hint, fmt, fmtDate, exportRowsAsCsv } from '../shared';
import { extractApiError } from '@/lib/config';

export default function TaxPage() {
  const [config, setConfig] = useState(null);
  const [report, setReport] = useState(null);
  const [period, setPeriod] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTax, setShowTax] = useState(false);
  const [taxForm, setTaxForm] = useState({ code: '', name: '', kind: 'VAT', rate: '' });
  const [calc, setCalc] = useState({ amount: '', taxCode: '', result: null });

  const load = async () => {
    setLoading(true);
    try {
      const [cfg, rep] = await Promise.all([
        api.get('/api/accounting/tax/config'),
        api.get(`/api/accounting/tax/liability${period ? `?period=${period}` : ''}`),
      ]);
      setConfig(cfg.data.data);
      setReport(rep.data.data);
    } catch (e) {
      toast.error(extractApiError(e) || 'Failed to load tax data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [period]);

  async function addTax(e) {
    e.preventDefault();
    try {
      const taxes = [...(config?.taxes || []), { ...taxForm, rate: Number(taxForm.rate), isActive: true }];
      await api.put('/api/accounting/tax/config', { taxes });
      toast.success('Tax code added');
      setShowTax(false);
      setTaxForm({ code: '', name: '', kind: 'VAT', rate: '' });
      load();
    } catch (e2) {
      toast.error(extractApiError(e2) || 'Failed');
    }
  }

  async function toggleTax(code) {
    const taxes = config.taxes.map((t) => (t.code === code ? { ...t, isActive: !t.isActive } : t));
    await api.put('/api/accounting/tax/config', { taxes });
    load();
  }

  async function removeTax(code) {
    if (!confirm(`Remove tax code ${code}? Historical records keep their data.`)) return;
    const taxes = config.taxes.filter((t) => t.code !== code);
    await api.put('/api/accounting/tax/config', { taxes });
    load();
  }

  async function runCalc() {
    if (!calc.amount || !calc.taxCode) return;
    try {
      const res = await api.get(`/api/accounting/tax/calculate?amount=${calc.amount}&taxCode=${calc.taxCode}`);
      setCalc({ ...calc, result: res.data.data });
    } catch (e) {
      toast.error(extractApiError(e) || 'Calculation failed');
    }
  }

  async function markFiled(p, taxCode) {
    if (!confirm(`Mark ${taxCode || 'all taxes'} for ${p} as filed with ${config?.taxAuthorityName || 'the tax authority'}?`)) return;
    try {
      const res = await api.post('/api/accounting/tax/mark-filed', { period: p, taxCode });
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(extractApiError(e) || 'Failed');
    }
  }

  function exportFiling() {
    if (!report?.summary?.length) return;
    exportRowsAsCsv(
      ['Period', 'TaxCode', 'Kind', 'Direction', 'BaseAmount', 'TaxAmount', 'Transactions'],
      report.summary.map((r) => [r.period, r.taxCode, r.kind, r.direction, r.baseAmount, r.taxAmount, r.count]),
      `tax-filing-${period || 'all'}.csv`
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Tax Engine</h1>
            <p className="text-sm text-gray-500">VAT · Sales Tax · Withholding — authority: {config?.taxAuthorityName || 'FIRS'}</p>
          </div>
          <Btn onClick={() => setShowTax(true)}><Plus size={15} /> Tax Code</Btn>
        </div>

        <Hint>
          Define your own tax codes here — none exist until you create them. VAT and Sales Tax are added on top
          of invoices you issue; Withholding Tax (WHT) is deducted from payments you make to suppliers. Once a
          code exists, every invoice that uses it calculates the tax automatically and records it, so the
          liability report below always shows exactly what you owe the tax authority per month — ready to file,
          with a CSV export. Mark a period "filed" after you submit the return.
        </Hint>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <Card title="Configured Taxes" className="lg:col-span-2">
            <Table headers={['Code', 'Name', 'Kind', { label: 'Rate', right: true }, 'Active', '']}
              empty={!loading && !config?.taxes?.length ? 'No tax codes' : null}>
              {(config?.taxes || []).map((t) => (
                <tr key={t.code}>
                  <td className="py-2 pr-3 font-mono text-xs">{t.code}</td>
                  <td className="py-2 pr-3">{t.name}</td>
                  <td className="py-2 pr-3 text-xs">{t.kind}</td>
                  <td className="py-2 pr-3 text-right font-mono text-xs">{t.rate}%</td>
                  <td className="py-2 pr-3">
                    <button onClick={() => toggleTax(t.code)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-2">
                    <button onClick={() => removeTax(t.code)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card title="Tax Calculator">
            <Field label="Amount (₦)">
              <input type="number" className={inputCls} value={calc.amount} onChange={(e) => setCalc({ ...calc, amount: e.target.value, result: null })} />
            </Field>
            <Field label="Tax Code">
              <select className={inputCls} value={calc.taxCode} onChange={(e) => setCalc({ ...calc, taxCode: e.target.value, result: null })}>
                <option value="">Select…</option>
                {(config?.taxes || []).filter((t) => t.isActive).map((t) => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </select>
            </Field>
            <Btn onClick={runCalc} variant="outline"><Calculator size={15} /> Calculate</Btn>
            {calc.result && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-gray-800 rounded-lg text-sm space-y-1">
                <p>Base: <b>₦{fmt(calc.result.baseAmount)}</b></p>
                <p>{calc.result.kind} ({calc.result.rate}%): <b>₦{fmt(calc.result.taxAmount)}</b></p>
                <p>Total: <b>₦{fmt(calc.result.total)}</b></p>
                {calc.result.note && <p className="text-xs text-amber-600">{calc.result.note}</p>}
              </div>
            )}
          </Card>
        </div>

        <Card
          title="Tax Liability & Filing Report"
          actions={
            <div className="flex items-center gap-2">
              <input type="month" className={`${inputCls} !w-40 !py-1`} value={period} onChange={(e) => setPeriod(e.target.value)} />
              <Btn small variant="outline" onClick={exportFiling}>Export CSV</Btn>
            </div>
          }
        >
          {report?.vatNetPosition?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">VAT Net Position (output − input)</p>
              <Table headers={['Period', { label: 'Output VAT', right: true }, { label: 'Input VAT', right: true }, { label: 'Net Payable', right: true }, '']}>
                {report.vatNetPosition.map((v) => (
                  <tr key={v.period}>
                    <td className="py-2 pr-3 font-mono text-xs">{v.period}</td>
                    <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(v.output)}</td>
                    <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(v.input)}</td>
                    <td className="py-2 pr-3 text-right font-mono text-xs font-bold">₦{fmt(v.netPayable)}</td>
                    <td className="py-2">
                      <Btn small variant="outline" onClick={() => markFiled(v.period)}>
                        <FileCheck2 size={13} /> Mark Filed
                      </Btn>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">All Tax Activity</p>
          <Table
            headers={['Period', 'Code', 'Kind', 'Direction', { label: 'Base', right: true }, { label: 'Tax', right: true }, 'Docs']}
            empty={!loading && !report?.summary?.length ? 'No tax activity recorded yet — taxes accrue automatically from AP/AR documents' : null}
          >
            {(report?.summary || []).map((r, i) => (
              <tr key={i}>
                <td className="py-2 pr-3 font-mono text-xs">{r.period}</td>
                <td className="py-2 pr-3 font-mono text-xs">{r.taxCode}</td>
                <td className="py-2 pr-3 text-xs">{r.kind}</td>
                <td className="py-2 pr-3 text-xs capitalize">{r.direction}</td>
                <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(r.baseAmount)}</td>
                <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(r.taxAmount)}</td>
                <td className="py-2 text-xs text-gray-400">{r.count}</td>
              </tr>
            ))}
          </Table>
        </Card>

        {showTax && (
          <Modal title="New Tax Code" onClose={() => setShowTax(false)}>
            <form onSubmit={addTax}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Code *" hint="e.g. VAT-STD, WHT-5">
                  <input className={inputCls} value={taxForm.code} onChange={(e) => setTaxForm({ ...taxForm, code: e.target.value.toUpperCase() })} required />
                </Field>
                <Field label="Rate (%) *">
                  <input type="number" step="0.01" min="0" max="100" className={inputCls} value={taxForm.rate} onChange={(e) => setTaxForm({ ...taxForm, rate: e.target.value })} required />
                </Field>
              </div>
              <Field label="Name *">
                <input className={inputCls} value={taxForm.name} onChange={(e) => setTaxForm({ ...taxForm, name: e.target.value })} required />
              </Field>
              <Field label="Kind *" hint="VAT/Sales Tax add to invoices; WHT is withheld from payments">
                <select className={inputCls} value={taxForm.kind} onChange={(e) => setTaxForm({ ...taxForm, kind: e.target.value })}>
                  <option value="VAT">VAT</option>
                  <option value="SalesTax">Sales Tax</option>
                  <option value="WHT">Withholding Tax</option>
                </select>
              </Field>
              <div className="flex justify-end gap-2 mt-3">
                <Btn variant="secondary" onClick={() => setShowTax(false)}>Cancel</Btn>
                <Btn type="submit">Add</Btn>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
