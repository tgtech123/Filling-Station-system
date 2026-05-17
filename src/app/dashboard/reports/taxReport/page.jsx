'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { RxTriangleRight } from 'react-icons/rx';
import Link from 'next/link';
import {
  FileText, ChevronDown, ChevronUp, Info,
  AlertCircle, TrendingUp, Shield, Receipt,
  Printer, SlidersHorizontal, CheckCircle2, Calendar,
  Database, Users, ArrowLeft,
} from 'lucide-react';
import useAccountantStore from '@/store/useAccountantStore';

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmt(n) {
  return Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function currentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthToRange(m) {
  const [y, mo] = m.split('-').map(Number);
  const pad = (n) => String(n).padStart(2, '0');
  // Build strings manually — toISOString() shifts UTC+1 midnight to the previous day
  return {
    startDate: `${y}-${pad(mo)}-01`,
    endDate:   `${y}-${pad(mo)}-${new Date(y, mo, 0).getDate()}`,
  };
}
function monthLabel(m) {
  if (!m) return '';
  const [y, mo] = m.split('-');
  return `${MONTHS[Number(mo) - 1]} ${y}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SummaryCard({ label, value, sub, colorClass, icon }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border-l-4 ${colorClass} shadow-sm border border-gray-100`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800 truncate">₦{fmt(value)}</p>
          {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="text-gray-200 shrink-0 ml-2">{icon}</div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, accentClass, badge, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`px-4 sm:px-6 py-4 border-b border-gray-100 border-l-4 ${accentClass} flex items-start justify-between gap-2`}>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-700 text-sm sm:text-base leading-snug">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5 leading-snug">{subtitle}</p>}
        </div>
        {badge && (
          <span className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
      <div className="px-4 sm:px-6 py-4 sm:py-5">{children}</div>
    </div>
  );
}

function TaxRow({ label, value, bold, indent, highlight, note, tag }) {
  return (
    <div className={`flex justify-between items-start py-2.5 border-b border-gray-50 last:border-0
      ${highlight ? 'bg-blue-50 -mx-1 px-1 sm:-mx-2 sm:px-2 rounded-lg my-1' : ''}
      ${indent ? 'pl-3 sm:pl-5' : ''}`}>
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs sm:text-sm leading-snug ${bold ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{label}</span>
          {tag && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">{tag}</span>
          )}
        </div>
        {note && <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 leading-snug">{note}</p>}
      </div>
      <span className={`text-xs sm:text-sm font-mono tabular-nums shrink-0 ${bold ? 'font-bold text-gray-800' : 'text-gray-700'}`}>
        ₦{fmt(value)}
      </span>
    </div>
  );
}

function InfoBanner({ color, icon, children }) {
  const colors = {
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
    blue:   'bg-blue-50 border-blue-100 text-blue-700',
    green:  'bg-green-50 border-green-100 text-green-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    gray:   'bg-gray-50 border-gray-200 text-gray-600',
  };
  return (
    <div className={`flex items-start gap-2.5 border rounded-xl px-4 py-3 mb-4 ${colors[color]}`}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <p className="text-xs leading-relaxed">{children}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TaxReport() {
  const [period, setPeriod]       = useState(currentMonthStr);
  const [showRates, setShowRates] = useState(false);
  const [vatRate, setVatRate]     = useState(7.5);
  const [citRate, setCitRate]     = useState(30);

  const { taxReport, loading, errors, fetchTaxReport } = useAccountantStore();

  useEffect(() => {
    const { startDate, endDate } = monthToRange(period);
    fetchTaxReport(startDate, endDate);
  }, [period, fetchTaxReport]);

  // ── Pull from store (real DB data) ────────────────────────────────────────
  const TR = taxReport || {};
  const rev        = TR.revenue      || {};
  const vat        = TR.vat          || {};
  const paye       = TR.paye         || {};
  const cit        = TR.cit          || {};
  const expenses   = TR.expenses     || {};
  const procurement= TR.procurement  || {};

  // Allow user to override VAT/CIT rates and recompute on the fly
  const outputVAT              = (Number(rev.vatTaxableRevenue || 0) * vatRate) / (100 + vatRate);
  const inputVATLub            = (Number(procurement.lubricantPurchaseCost || 0) * vatRate) / (100 + vatRate);
  const inputVATExpenses       = Number(vat.inputVATFromExpenses || 0); // real vatAmount from expense records
  const inputVAT               = inputVATLub + inputVATExpenses;
  const netVATPayable          = Math.max(0, outputVAT - inputVAT);

  const assessableProfit  = Number(cit.assessableProfit || 0);
  const companyIncomeTax  = assessableProfit * (citRate / 100);
  const educationTax      = assessableProfit * 0.025;
  const totalCITLiability = companyIncomeTax + educationTax;

  const totalPAYE         = Number(paye.totalPAYEDeducted || 0);
  const totalTaxLiability = netVATPayable + totalPAYE + totalCITLiability;

  // ── Filing deadlines ─────────────────────────────────────────────────────
  const [y, mo] = period.split('-').map(Number);
  const deadlines = [
    { name: 'VAT Return (FIRS)',             due: new Date(y, mo, 21), desc: 'Monthly VAT return — FIRS e-Tax portal', type: 'monthly' },
    { name: 'PAYE Remittance (State IRS)',   due: new Date(y, mo, 10), desc: 'Monthly PAYE — State Internal Revenue Service', type: 'monthly' },
    { name: 'Pension Contribution (PenCom)', due: new Date(y, mo, 7),  desc: '7 working days after salary payment date', type: 'monthly' },
    { name: 'Company Income Tax (FIRS)',     due: null, desc: 'Annual return — 6 months after your financial year end', type: 'annual' },
    { name: 'Education Development Levy',    due: null, desc: 'Assessed alongside CIT in the annual tax return', type: 'annual' },
  ];

  const today = new Date(); today.setHours(0, 0, 0, 0);
  function deadlineStatus(d) {
    if (!d.due) return 'annual';
    const due = new Date(d.due); due.setHours(0, 0, 0, 0);
    if (due < today) return 'overdue';
    return (due - today) / 86400000 <= 7 ? 'soon' : 'upcoming';
  }
  const statusStyle = {
    overdue:  { pill: 'bg-red-100 text-red-600',     dot: 'bg-red-500',    label: 'Past Due'  },
    soon:     { pill: 'bg-amber-100 text-amber-600',  dot: 'bg-amber-400',  label: 'Due Soon'  },
    upcoming: { pill: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  label: 'Upcoming'  },
    annual:   { pill: 'bg-purple-100 text-purple-600',dot: 'bg-purple-400', label: 'Annual'    },
  };

  const isLoading = loading.taxReport && !taxReport;

  return (
    <DashboardLayout>
      <div className="w-full max-w-full overflow-x-hidden px-4 sm:px-6 lg:px-2 pb-16">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/dashboard/financial-overview"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors shrink-0"
            title="Back to Financial Overview"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-700 mb-1">Reports</h1>
            <div className="flex flex-wrap items-center gap-1 text-sm">
              <p className="text-neutral-400 font-medium">Report</p>
              <RxTriangleRight size={20} className="text-neutral-500" />
              <p className="text-blue-600 font-semibold">Tax-Ready Report</p>
            </div>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700">Tax-Ready Report</h2>
              </div>
              <p className="text-sm text-gray-400">
                Tax obligations for <span className="font-semibold text-gray-600">{monthLabel(period)}</span> — Nigeria FIRS Standards
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {paye.source === 'salary_draft' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    <Database size={10} /> PAYE from Salary Draft
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    <Database size={10} /> PAYE estimated — no salary draft for this month
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  <Database size={10} /> All figures from database
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
              <input
                type="month" value={period} onChange={e => setPeriod(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer min-w-0"
              />
              <button
                onClick={() => setShowRates(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl text-sm font-medium transition-colors ${
                  showRates ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <SlidersHorizontal size={14} />
                <span className="hidden xs:inline">Tax Rates</span>
                {showRates ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Printer size={14} />
                <span className="hidden xs:inline">Print</span>
              </button>
            </div>
          </div>

          {/* Configurable Rates */}
          {showRates && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Override Rates (affects displayed figures only)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'VAT Rate (%)',      val: vatRate,  setter: setVatRate,  editable: true  },
                  { label: 'CIT Rate (%)',       val: citRate,  setter: setCitRate,  editable: true  },
                  { label: 'Education Tax (%)',  val: 2.5,      setter: null,        editable: false },
                  { label: 'PAYE Eff. Rate (%)', val: paye.source === 'salary_draft' ? 'From payroll' : '15', setter: null, editable: false },
                ].map((r, i) => (
                  <div key={i}>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">{r.label}</label>
                    <input
                      type={r.editable ? 'number' : 'text'}
                      step="0.5" value={r.val}
                      onChange={r.editable ? e => r.setter(Number(e.target.value)) : undefined}
                      readOnly={!r.editable}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                        r.editable ? 'border-gray-300 focus:border-blue-500 bg-white' : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <p className="mt-2 text-sm text-gray-500">Fetching tax figures from database…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {errors.taxReport && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{errors.taxReport}</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <SummaryCard label="Total Tax Liability" value={totalTaxLiability} sub={monthLabel(period)} colorClass="border-red-500" icon={<Receipt size={30} />} />
              <SummaryCard label="VAT Payable (Net)" value={netVATPayable} sub={`${vatRate}% on AGO + lubricants`} colorClass="border-orange-400" icon={<TrendingUp size={30} />} />
              <SummaryCard
                label={paye.source === 'salary_draft' ? 'PAYE Deducted' : 'PAYE Est.'}
                value={totalPAYE}
                sub={paye.source === 'salary_draft' ? `From salary draft · ${paye.draftStatus}` : 'Estimated — no draft found'}
                colorClass="border-blue-500"
                icon={<Shield size={30} />}
              />
              <SummaryCard label="CIT + Edu Tax (Accrual)" value={totalCITLiability} sub={`${citRate}% CIT + 2.5% Education`} colorClass="border-green-500" icon={<FileText size={30} />} />
            </div>

            <div className="space-y-5">

              {/* ── Revenue Breakdown ─────────────────────────────────────── */}
              <Section title="Revenue & VAT Schedule" subtitle={`FIRS — ${vatRate}% standard rate · ${monthLabel(period)}`} accentClass="border-orange-400" badge="Monthly Filing">
                <InfoBanner color="orange" icon={<Info size={14} className="text-orange-500" />}>
                  <strong>PMS (Petrol) is VAT-exempt</strong> under Nigerian law. VAT is computed on{' '}
                  AGO (Diesel) and Lubricant sales only. Input VAT is claimed from lubricant purchase invoices in your system.
                </InfoBanner>

                <TaxRow label="PMS Sales" value={rev.pmsRevenue} indent note="VAT-exempt — PMS under FIRS exemption list" />
                <TaxRow label="DPK / Kerosene Sales" value={rev.dpkRevenue} indent note="VAT-exempt" />
                <TaxRow label="AGO / Diesel Sales" value={rev.agoRevenue} indent tag="Taxable" />
                <TaxRow label="Lubricant Sales" value={rev.lubricantRevenue} indent tag="Taxable" />
                <TaxRow label="Total Revenue" value={rev.totalRevenue} bold />
                <div className="h-px bg-gray-100 my-2" />
                <TaxRow label="Total VAT-Taxable Revenue" value={rev.vatTaxableRevenue} />
                <TaxRow label={`Output VAT (${vatRate}% incl. extracted)`} value={outputVAT} indent />
                <TaxRow label="Lubricant Procurement Cost" value={procurement.lubricantPurchaseCost} indent note="From lubricant purchase records" />
                <TaxRow label="Input VAT — Lubricant Purchases" value={inputVATLub} indent note="7.5% extracted from lubricant procurement cost" />
                <TaxRow label="Input VAT — Expense Invoices" value={inputVATExpenses} indent note="VAT recorded on approved expense records (repairs, utilities, etc.)" />
                <TaxRow label="Total Input VAT Claimable" value={inputVAT} />
                <TaxRow label="Net VAT Payable to FIRS" value={netVATPayable} bold highlight />

                <div className="mt-4 flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                  <Calendar size={13} className="text-orange-500 shrink-0" />
                  <p className="text-xs text-orange-700"><strong>Due:</strong> 21st of the following month — file at tin.firs.gov.ng</p>
                </div>
              </Section>

              {/* ── PAYE ────────────────────────────────────────────────────── */}
              <Section
                title="Pay-As-You-Earn (PAYE) Schedule"
                subtitle="State Internal Revenue Service — Monthly deduction & remittance"
                accentClass="border-blue-500"
                badge="Monthly Filing"
              >
                {paye.source === 'salary_draft' ? (
                  <InfoBanner color="green" icon={<Database size={14} className="text-green-600" />}>
                    PAYE figures are <strong>pulled directly from your validated Salary Draft</strong> for {monthLabel(period)}
                    {paye.draftStatus && <> (status: <strong>{paye.draftStatus}</strong>)</>}.
                    These are the actual tax amounts deducted per employee, not estimates.
                  </InfoBanner>
                ) : (
                  <InfoBanner color="orange" icon={<AlertCircle size={14} className="text-orange-500" />}>
                    No salary draft found for {monthLabel(period)}. PAYE is <strong>estimated at 15% effective rate</strong> on
                    approved salary expenses. Create and validate a salary draft in the{' '}
                    <strong>Salary module</strong> for exact figures.
                  </InfoBanner>
                )}

                <TaxRow label="Total Gross Salary" value={paye.totalGrossSalary} />
                <TaxRow
                  label="Total PAYE Deducted"
                  value={totalPAYE}
                  bold highlight
                  tag={paye.source === 'salary_draft' ? 'Actual' : 'Estimated'}
                />

                {/* Per-staff breakdown */}
                {paye.staffBreakdown?.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Users size={12} /> Staff Payroll Breakdown
                    </p>

                    {/* Mobile cards */}
                    <div className="sm:hidden space-y-3">
                      {paye.staffBreakdown.map((s, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                              <p className="text-[11px] text-gray-400 capitalize">{s.role}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[10px] text-gray-400">Net Pay</p>
                              <p className="text-sm font-bold text-green-700 font-mono">₦{fmt(s.salaryToPay)}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t border-gray-200">
                            {[
                              { label: 'Basic Salary', value: s.basicSalary, cls: 'text-gray-700' },
                              { label: 'Bonus',        value: s.bonus,       cls: 'text-gray-700' },
                              { label: 'Tax (PAYE)',   value: s.taxAmount,   cls: 'text-red-600 font-semibold' },
                              ...(paye.pensionEnabled !== false ? [
                                { label: 'Emp. Pension',  value: s.employeePension, cls: 'text-indigo-600' },
                                { label: 'Emplr. Pension',value: s.employerPension, cls: 'text-indigo-600' },
                              ] : []),
                            ].map(({ label, value, cls }) => (
                              <div key={label}>
                                <p className="text-[10px] text-gray-400">{label}</p>
                                <p className={`text-xs font-mono ${cls}`}>₦{fmt(value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-400 border-b border-gray-100">
                            <th className="pb-2 font-semibold whitespace-nowrap">Name</th>
                            <th className="pb-2 font-semibold whitespace-nowrap">Role</th>
                            <th className="pb-2 font-semibold text-right whitespace-nowrap">Basic Salary</th>
                            <th className="pb-2 font-semibold text-right whitespace-nowrap">Bonus</th>
                            <th className="pb-2 font-semibold text-right whitespace-nowrap">Tax (PAYE)</th>
                            {paye.pensionEnabled !== false && (
                              <>
                                <th className="pb-2 font-semibold text-right whitespace-nowrap text-indigo-500">Emp. Pension</th>
                                <th className="pb-2 font-semibold text-right whitespace-nowrap text-indigo-500">Emplr. Pension</th>
                              </>
                            )}
                            <th className="pb-2 font-semibold text-right whitespace-nowrap">Net Pay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paye.staffBreakdown.map((s, i) => (
                            <tr key={i} className="border-b border-gray-50 last:border-0">
                              <td className="py-2 text-gray-700 font-medium whitespace-nowrap">{s.name}</td>
                              <td className="py-2 text-gray-500 capitalize whitespace-nowrap">{s.role}</td>
                              <td className="py-2 text-right text-gray-700 font-mono whitespace-nowrap">₦{fmt(s.basicSalary)}</td>
                              <td className="py-2 text-right text-gray-700 font-mono whitespace-nowrap">₦{fmt(s.bonus)}</td>
                              <td className="py-2 text-right text-red-600 font-mono font-semibold whitespace-nowrap">₦{fmt(s.taxAmount)}</td>
                              {paye.pensionEnabled !== false && (
                                <>
                                  <td className="py-2 text-right text-indigo-600 font-mono whitespace-nowrap">₦{fmt(s.employeePension)}</td>
                                  <td className="py-2 text-right text-indigo-600 font-mono whitespace-nowrap">₦{fmt(s.employerPension)}</td>
                                </>
                              )}
                              <td className="py-2 text-right text-green-700 font-mono font-semibold whitespace-nowrap">₦{fmt(s.salaryToPay)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Pension Contributions (PenCom)</p>
                  {paye.pensionEnabled === false ? (
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500">
                      <AlertCircle size={13} className="shrink-0" />
                      Pension was <strong>disabled</strong> for this payroll period — ₦0 recorded.
                    </div>
                  ) : (
                    <>
                      <TaxRow label="Employee Contribution (8% of gross)" value={paye.employeePension} note="Deducted from employee's pay" />
                      <TaxRow label="Employer Contribution (10% of gross)" value={paye.employerPension} note="Borne by the business" />
                      <TaxRow label="Total Monthly Pension Outflow" value={paye.totalPension} bold />
                    </>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <Calendar size={13} className="text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700"><strong>PAYE due:</strong> 10th of following month — State IRS</p>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <Calendar size={13} className="text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700"><strong>Pension due:</strong> 7 working days after payroll date</p>
                  </div>
                </div>
              </Section>

              {/* ── CIT + Education Tax ──────────────────────────────────────── */}
              <Section
                title="Company Income Tax (CIT) & Education Development Levy"
                subtitle="FIRS — Monthly provision based on net profit"
                accentClass="border-green-500"
                badge="Annual Return"
              >
                <InfoBanner color="green" icon={<Info size={14} className="text-green-600" />}>
                  CIT is an <strong>annual tax</strong>. The amount below is your <strong>monthly provision</strong> — set it aside
                  each month so the bill isn't a shock at year end. File your annual return 6 months after
                  your financial year end. <strong>Small companies (turnover &lt; ₦25M/year)</strong> may be CIT-exempt.
                </InfoBanner>

                <TaxRow label="Total Revenue" value={cit.totalRevenue} />
                <TaxRow label="Cost of Goods Sold (Fuel + Lubricant procurement)" value={cit.totalCOGS} indent />
                <TaxRow label="Gross Profit" value={cit.grossProfit} />
                <TaxRow label="Total Approved Operating Expenses" value={cit.totalExpenses} indent />
                <TaxRow label="Net Profit (Assessable Profit)" value={assessableProfit} bold />
                <div className="h-px bg-gray-100 my-2" />
                <TaxRow
                  label={`CIT Provision (${citRate}%)`}
                  value={companyIncomeTax}
                  indent
                  note={Number(rev.totalRevenue) * 12 < 25_000_000 ? 'Annual turnover may be under ₦25M — verify small company exemption' : ''}
                />
                <TaxRow label="Education Development Levy (2.5%)" value={educationTax} indent note="Finance Act 2021 — all companies" />
                <TaxRow label="Total CIT + Education Provision" value={totalCITLiability} bold highlight />

                {assessableProfit === 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    No CIT liability this period — net profit is zero or negative.
                  </div>
                )}
              </Section>

              {/* ── Expense Deductibility ─────────────────────────────────────── */}
              <Section
                title="Deductible Operating Expenses"
                subtitle="Approved expenses by category — all deductible for CIT purposes"
                accentClass="border-gray-400"
              >
                <InfoBanner color="gray" icon={<Info size={14} className="text-gray-500" />}>
                  Only <strong>Approved</strong> expenses are included. Ensure all business expenses are submitted
                  and approved in the Expense module before filing.
                </InfoBanner>
                <TaxRow label="Salaries & Wages"       value={expenses.salaries}      note="From approved Salaries expenses" />
                <TaxRow label="Maintenance & Repairs"  value={expenses.maintenance}   />
                <TaxRow label="Utilities"              value={expenses.utilities}     />
                <TaxRow label="Operational Expenses"   value={expenses.operational}   />
                <TaxRow label="Admin & Other"          value={expenses.adminAndOther} />
                <TaxRow label="Depreciation"           value={expenses.depreciation}  note="From Fixed Asset Register" />
                <TaxRow label="Total Deductible Expenses" value={expenses.totalExpenses} bold highlight />
              </Section>

              {/* ── Filing Calendar ──────────────────────────────────────────── */}
              <Section title="Tax Filing Calendar" subtitle={`Key FIRS & regulatory deadlines · ${monthLabel(period)}`} accentClass="border-purple-400">
                <div className="space-y-3">
                  {deadlines.map((d, i) => {
                    const st = deadlineStatus(d);
                    const s  = statusStyle[st];
                    return (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${s.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-700">{d.name}</p>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold shrink-0 ${s.pill}`}>{s.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
                          <p className="text-xs font-medium text-gray-600 mt-1">
                            Due: {d.due
                              ? d.due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '6 months after financial year end'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* ── Total Summary ─────────────────────────────────────────────── */}
              <Section title="Total Monthly Tax Obligation Summary" subtitle={monthLabel(period)} accentClass="border-red-400">
                <TaxRow label="Net VAT Payable (FIRS)"              value={netVATPayable}         tag="21st" />
                <TaxRow label="PAYE Remittance (State IRS)"         value={totalPAYE}             tag="10th" />
                <TaxRow label="Pension Contributions (PenCom)"      value={Number(paye.totalPension || 0)} tag="7 days" />
                <TaxRow label="CIT + Education Tax Provision"       value={totalCITLiability}     tag="Annual" />
                <div className="h-px bg-gray-200 my-2" />
                <TaxRow label="TOTAL ESTIMATED TAX OUTFLOW" value={totalTaxLiability + Number(paye.totalPension || 0)} bold highlight />
              </Section>

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-700 mb-1">Important Disclaimer</p>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    All figures are computed from your recorded transactions. PAYE amounts come directly from
                    your validated Salary Draft where available, and are estimates otherwise. PMS VAT exemption
                    status, applicable PAYE bands, WHT obligations on contracts, and your CIT rate tier must be
                    confirmed by a licensed tax practitioner (ICAN/CITN). Always file via{' '}
                    <strong>tin.firs.gov.ng</strong> using your company TIN.
                  </p>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
