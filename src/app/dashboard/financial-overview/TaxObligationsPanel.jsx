'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFinancialStore } from '@/store/useFinancialStore';
import {
  AlertCircle, CheckCircle2, Clock, ExternalLink,
  ChevronDown, ChevronUp, HelpCircle, ArrowRight,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function currentMonthRange() {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  const pad = (n) => String(n).padStart(2, '0');
  // Build date strings manually — avoids toISOString() UTC shift in UTC+1 browsers
  return {
    startDate: `${y}-${pad(m + 1)}-01`,
    endDate:   `${y}-${pad(m + 1)}-${new Date(y, m + 1, 0).getDate()}`,
    label: d.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }),
  };
}

function fmt(n) {
  return Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function deadlineBadge(dayOfNextMonth) {
  const d   = new Date();
  const due = new Date(d.getFullYear(), d.getMonth() + 1, dayOfNextMonth);
  const diff = Math.ceil((due - d) / 86400000);
  if (diff < 0)  return { text: 'OVERDUE',        cls: 'bg-red-100 text-red-700'   };
  if (diff <= 7) return { text: `Due in ${diff}d`, cls: 'bg-amber-100 text-amber-700' };
  return           { text: `Due ${due.toLocaleDateString('en-GB', { day:'numeric', month:'short' })}`, cls: 'bg-green-100 text-green-700' };
}

// Plain-English explanation for each tax — shown always, not on hover
const TAX_PLAIN = {
  vat: {
    title:      'VAT — Value Added Tax',
    emoji:      '🏦',
    who:        'Pay to: FIRS (Federal Government)',
    plain:
      'When your station sells diesel (AGO) or lubricants, ' +
      '7.5% of the selling price is NOT your money — it belongs to the government. ' +
      'You are just holding it. At the end of the month you hand it over to FIRS.',
    example:    'Customer pays ₦107,500 for diesel → ₦100,000 is yours → ₦7,500 goes to FIRS.',
    note:       'PMS (Petrol) is exempt — you keep 100% of petrol sales.',
  },
  paye: {
    title:      'PAYE — Staff Income Tax',
    emoji:      '👷',
    who:        'Pay to: Your State Tax Authority (not FIRS)',
    plain:
      'Before you hand your staff their salary, you are required by law to ' +
      'remove a portion of it as income tax and send it to the government. ' +
      'The staff member never sees that money — you take it out and pay the government on their behalf.',
    example:    'Staff earns ₦100,000 → you deduct ₦12,000 tax → staff gets ₦88,000 → you send ₦12,000 to State IRS.',
    note:       'This is NOT your money. Failing to send it is a criminal offence.',
    sourceSteps: [
      { step: '1', label: 'Staff Management',  detail: 'Each staff member has a Basic Salary set in their profile' },
      { step: '2', label: 'Salary Module',      detail: 'Accountant opens the monthly Salary Draft and types a Tax % for each staff member' },
      { step: '3', label: 'Formula applied',    detail: 'Tax Deducted = Basic Salary × Tax %  (e.g. ₦200,000 × 12% = ₦24,000)' },
      { step: '4', label: 'This figure',        detail: 'Sum of all staff tax deductions for the month' },
    ],
    sourceNote: 'The Tax % is entered manually by the accountant — it is not automatically calculated from tax bands. Ask your accountant to confirm the correct rate for each staff member.',
  },
  pension: {
    title:      'Pension Contributions',
    emoji:      '🏡',
    who:        'Pay to: Pension Fund Administrator (PenCom)',
    plain:
      'Every month, you save money for your employees\' retirement. ' +
      '8% is cut from the employee\'s salary (their contribution). ' +
      'You add another 10% from the business (your contribution). ' +
      'Both go into each employee\'s personal pension account.',
    example:    'Staff salary ₦100,000 → deduct ₦8,000 from staff + add ₦10,000 from business → ₦18,000 saved.',
    note:       'Must be sent within 7 working days of paying salary. Late = penalty.',
    sourceSteps: [
      { step: '1', label: 'Staff Management',  detail: 'Each staff member has a Basic Salary set in their profile (used as the pension base)' },
      { step: '2', label: 'Salary Draft',       detail: 'The accountant opens the monthly Salary Draft — basic salaries are pulled in automatically' },
      { step: '3', label: 'Auto-calculated',    detail: 'Employee contribution = Basic Salary × 8%.  Business contribution = Basic Salary × 10%' },
      { step: '4', label: 'This figure',        detail: 'Total of all staff pension (employee 8% + employer 10% = 18% per person)' },
    ],
    sourceNote: 'This is calculated automatically — the accountant does not type anything for pension. The only input required is the correct Basic Salary in each staff member\'s profile.',
  },
  cit: {
    title:      'Company Tax Provision',
    emoji:      '📊',
    who:        'Pay to: FIRS (once per year)',
    plain:
      'At the end of your financial year, the government takes 30% of your business profit as tax, ' +
      'plus 2.5% for Education. This figure is what you should SET ASIDE this month ' +
      'so the annual bill does not shock you. Think of it like saving a little every month.',
    example:    'Monthly profit ₦500,000 → set aside ₦162,500 (32.5%) → ready for annual tax filing.',
    note:       'You do NOT pay this monthly. File once a year. Small stations under ₦25M annual revenue may be exempt.',
  },
};

// ── Expandable explanation card ───────────────────────────────────────────────
function TaxTile({ taxKey, amount, subLabel, deadlineDay }) {
  const [openExample, setOpenExample] = useState(false);
  const [openSource,  setOpenSource]  = useState(false);
  const info  = TAX_PLAIN[taxKey];
  const badge = deadlineBadge(deadlineDay);

  const borderColors = {
    vat:     'border-l-orange-400',
    paye:    'border-l-blue-500',
    pension: 'border-l-purple-400',
    cit:     'border-l-green-500',
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${borderColors[taxKey]} shadow-sm overflow-hidden`}>

      {/* ── Top row ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{info.emoji}</span>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-tight">
                {info.title}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">₦{fmt(amount)}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-1 ${badge.cls}`}>
            {badge.text}
          </span>
        </div>
        <p className="text-[11px] text-gray-500 mt-1.5 leading-snug">{subLabel}</p>
        <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{info.who}</p>
      </div>

      {/* ── Where this number comes from (paye & pension only) — collapsed by default ── */}
      {info.sourceSteps && (
        <>
          <button
            onClick={() => setOpenSource(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle size={12} className="text-gray-400" />
              Where does this figure come from?
            </span>
            {openSource ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
          </button>

          {openSource && (
            <div className="px-4 pb-3 pt-1 space-y-2.5 border-t border-gray-50 bg-gray-50">
              {/* plain-English first */}
              <p className="text-[11px] text-gray-600 leading-relaxed pt-2">{info.plain}</p>

              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide pt-1">
                Step-by-step source
              </p>
              <div className="space-y-2">
                {info.sourceSteps.map((s) => (
                  <div key={s.step} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {s.step}
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-700 flex items-center gap-1">
                        {s.label}
                        {Number(s.step) < info.sourceSteps.length && (
                          <ArrowRight size={9} className="text-gray-400" />
                        )}
                      </p>
                      <p className="text-[10px] text-gray-500 leading-snug">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {info.sourceNote && (
                <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
                  <AlertCircle size={11} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 leading-snug">{info.sourceNote}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Show example toggle ── */}
      <button
        onClick={() => setOpenExample(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
      >
        <span className="flex items-center gap-1.5">
          <HelpCircle size={12} />
          {openExample ? 'Hide example' : 'Show example'}
        </span>
        {openExample ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {openExample && (
        <div className="px-4 pb-3 pt-2 space-y-1.5 bg-blue-50 border-t border-blue-100">
          <p className="text-[11px] font-semibold text-blue-700">Example:</p>
          <p className="text-[11px] text-blue-800 leading-relaxed">{info.example}</p>
          {info.note && (
            <div className="flex items-start gap-1.5 mt-1.5">
              <AlertCircle size={11} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 leading-relaxed">{info.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function TaxObligationsPanel() {
  const { taxSummary, loading, errors, fetchTaxSummary } = useFinancialStore();
  const { startDate, endDate, label } = currentMonthRange();

  useEffect(() => {
    fetchTaxSummary(startDate, endDate);
  }, [fetchTaxSummary, startDate, endDate]);

  const T  = taxSummary || {};
  const s  = T.summary  || {};
  const p  = T.paye     || {};
  const c  = T.cit      || {};

  const vatPayable   = Number(s.netVATPayable     || 0);
  const payeDue      = Number(s.totalPAYEDeducted || 0);
  const pensionDue   = Number(s.totalPension      || 0);
  const citProvision = Number(s.totalCITLiability || 0);
  const grandTotal   = vatPayable + payeDue + pensionDue + citProvision;
  const netProfit    = Number(c.netProfit || 0);

  if (loading.taxSummary && !taxSummary) {
    return (
      <div className="bg-white rounded-2xl p-6 mx-10 mt-6 flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
        <p className="text-sm text-gray-500">Loading tax obligations…</p>
      </div>
    );
  }

  if (errors.taxSummary) {
    return (
      <div className="bg-white rounded-2xl p-5 mx-10 mt-6 flex items-center gap-3 border border-red-100">
        <AlertCircle size={18} className="text-red-500 shrink-0" />
        <p className="text-sm text-red-600">Could not load tax data: {errors.taxSummary}</p>
      </div>
    );
  }

  return (
    <div className="mx-10 mt-6 space-y-4">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl px-6 py-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">This Month's Tax Obligations</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {label} · Everything your business owes the government this month, computed from your records.
            Each card below explains what the tax is in plain English.
          </p>
        </div>
        <Link
          href="/dashboard/accounting/tax"
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors shrink-0 whitespace-nowrap"
        >
          Full Breakdown <ExternalLink size={12} />
        </Link>
      </div>

      {/* ── Four tax tiles ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <TaxTile
          taxKey="vat"
          amount={vatPayable}
          subLabel="Net VAT after subtracting what you paid suppliers"
          deadlineDay={21}
        />
        <TaxTile
          taxKey="paye"
          amount={payeDue}
          subLabel={p.source === 'salary_draft'
            ? 'Exact figure from validated salary draft'
            : 'Estimated — salary draft not yet created'}
          deadlineDay={10}
        />
        <TaxTile
          taxKey="pension"
          amount={pensionDue}
          subLabel="Staff contribution (8%) + Your contribution (10%)"
          deadlineDay={7}
        />
        <TaxTile
          taxKey="cit"
          amount={citProvision}
          subLabel="Monthly amount to set aside — paid once per year"
          deadlineDay={365}
        />
      </div>

      {/* ── Grand Total ────────────────────────────────────────────────── */}
      <div className="bg-gray-900 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-white font-bold text-lg">Total Tax Outflow — {label}</p>
          <p className="text-gray-400 text-xs mt-1">
            This is every naira leaving your business for tax purposes combined.
            It covers VAT, staff income tax, pension contributions, and company tax provision.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-3xl font-bold text-white">₦{fmt(grandTotal)}</p>
          {netProfit > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              = {((grandTotal / netProfit) * 100).toFixed(1)}% of this month's net profit
            </p>
          )}
          {netProfit <= 0 && (
            <p className="text-xs text-amber-400 mt-1">Station operating at a loss — CIT does not apply</p>
          )}
        </div>
      </div>

      {/* ── Readiness check ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-sm">
        <p className="font-semibold text-gray-700 mb-1">Is everything ready to file?</p>
        <p className="text-xs text-gray-400 mb-4">
          These two things must be done before the accountant can file accurately.
          If either shows a warning, action is needed.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <div className={`flex items-start gap-3 rounded-xl px-4 py-3.5 border ${
            p.source === 'salary_draft'
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            {p.source === 'salary_draft'
              ? <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
              : <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />}
            <div>
              <p className={`text-sm font-bold ${p.source === 'salary_draft' ? 'text-green-700' : 'text-amber-700'}`}>
                {p.source === 'salary_draft' ? '✓ Salary Payroll Done' : '⚠ Salary Payroll Pending'}
              </p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {p.source === 'salary_draft'
                  ? `The accountant has processed this month's payroll. PAYE figures are exact — status: ${p.draftStatus}.`
                  : `The accountant has not yet created this month's salary draft. PAYE shown is an estimate. Remind your accountant to process payroll in the Salary module.`}
              </p>
            </div>
          </div>

          <div className={`flex items-start gap-3 rounded-xl px-4 py-3.5 border ${
            netProfit >= 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            {netProfit >= 0
              ? <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
              : <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />}
            <div>
              <p className={`text-sm font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {netProfit >= 0 ? '✓ Business is Profitable' : '⚠ Business Made a Loss'}
              </p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {netProfit >= 0
                  ? `Net profit this period is ₦${fmt(netProfit)}. Company tax provision has been calculated and set aside.`
                  : `Expenses exceeded revenue this period. No company income tax applies when there is no profit. Review expenses and sales.`}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom disclaimer ──────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Note for managers:</strong> These figures are automatically computed from your station's
          recorded transactions — sales, purchases, approved expenses, and payroll.
          They are estimates until your accountant validates all records for the month.
          Always confirm with your accountant before making any payment to FIRS or the State IRS.
        </p>
      </div>

    </div>
  );
}
