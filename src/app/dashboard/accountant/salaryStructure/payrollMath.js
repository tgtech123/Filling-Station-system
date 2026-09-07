/**
 * What a payroll line adds up to — the browser's copy.
 *
 * ── Why this exists twice ────────────────────────────────────────────────────
 * The payroll table recalculates as the accountant types, so the figures have
 * to be computable without a round trip. The authority is the server, at
 * filling-station-server/src/utils/payrollMath.ts, and THIS FILE MUST MATCH IT
 * line for line. If the two drift, the screen and the saved draft disagree and
 * nobody can tell which is wrong — so any change to the pension base, the tax
 * base or the net-pay formula has to land in both files in the same commit.
 *
 * ── The pension base ─────────────────────────────────────────────────────────
 * Pension Reform Act 2014 §4(1): 18% of monthly emolument, 8% employee and 10%
 * employer. Monthly emolument is what the contract says, but not less than
 * basic + housing + transport. Housing and transport are therefore locked
 * pensionable in the station's catalogue, which is what keeps this at or above
 * the statutory floor however the rest is configured.
 *
 * Bonuses are never in the base: they are variable performance pay, not a
 * contractual monthly emolument.
 */

export const EMPLOYEE_PENSION_RATE = 0.08;
export const EMPLOYER_PENSION_RATE = 0.1;

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Compute one payroll line.
 *
 * With `allowancesEnabled` false, allowances are dropped entirely and every
 * figure reduces to what it was before allowances existed.
 */
export function computePayrollEntry(input, opts = {}) {
  const pensionEnabled = opts.pensionEnabled !== false;
  const allowancesEnabled = opts.allowancesEnabled === true;

  const basic = num(input.basicSalary);

  const allowances = allowancesEnabled
    ? (input.allowances ?? [])
        .map((a) => ({
          key: String(a?.key ?? ""),
          label: String(a?.label ?? ""),
          amount: num(a?.amount),
          pensionable: a?.pensionable === true,
        }))
        .filter((a) => a.key && a.amount > 0)
    : [];

  const totalAllowances = allowances.reduce((n, a) => n + a.amount, 0);
  const pensionableAllowances = allowances
    .filter((a) => a.pensionable)
    .reduce((n, a) => n + a.amount, 0);

  const pensionableEarnings = basic + pensionableAllowances;

  const ba = input.bonusAmounts ?? {};
  const mst = num(ba.monthlySalesTarget);
  const zd = num(ba.zeroDiscrepancies);
  const tp = num(ba.topPerformer);
  const totalBonus = mst + zd + tp;

  const grossEarnings = basic + totalAllowances;

  // Basic plus allowances, still excluding bonuses. Allowances belong in this
  // base: without them, splitting a flat wage into basic + housing + transport
  // would drop PAYE without anybody's pay having changed.
  const taxAmount = Math.round((grossEarnings * num(input.taxPercentage)) / 100);

  const employeePension = pensionEnabled
    ? Math.round(pensionableEarnings * EMPLOYEE_PENSION_RATE)
    : 0;
  const employerPension = pensionEnabled
    ? Math.round(pensionableEarnings * EMPLOYER_PENSION_RATE)
    : 0;

  const shortage = num(input.shortage);

  // The employee's 8% comes out of their pay; the employer's 10% never does.
  const salaryToPay = Math.max(
    0,
    grossEarnings + totalBonus - taxAmount - employeePension - shortage
  );

  return {
    ...input,
    allowances,
    totalAllowances,
    pensionableEarnings,
    bonusAmounts: { monthlySalesTarget: mst, zeroDiscrepancies: zd, topPerformer: tp },
    totalBonus,
    grossEarnings,
    taxAmount,
    employeePension,
    employerPension,
    shortage,
    salaryToPay,
    employerCost: grossEarnings + totalBonus + employerPension,
  };
}

export default computePayrollEntry;
