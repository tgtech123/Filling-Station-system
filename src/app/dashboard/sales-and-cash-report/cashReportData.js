// src/app/dashboard/reports/salesReport/cashReportData.js
import { TbCurrencyNaira } from "react-icons/tb";
import Image from "next/image";

export const getCashData = (cashOverview) => {
  /**
   * The pump reconciliation cards say nothing about the till, so the counter's
   * takings are added beside them rather than folded in. The two are counted by
   * different people at different moments, and merging them would hide which
   * side a shortfall came from.
   */
  const counter = cashOverview?.counterSalesToday;
  const gas = cashOverview?.gasSalesToday;
  const gasTender = gas?.byTender || {};
  const tender = counter?.byTender || {};
  const kind = counter?.byKind || {};

  const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

  return [
  {
    title: "Expected Cash",
    date: "Pumps, today",
    amount: cashOverview
      ? `₦${cashOverview.expectedCashToday.toLocaleString()}`
      : "—",
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  },
  {
    title: "Actual Cash",
    date: "Pumps, today",
    amount: cashOverview
      ? `₦${cashOverview.actualCashToday.toLocaleString()}`
      : "—",
    icon: (
      <Image
        src="/house.png"
        alt="house icon"
        width={24}
        height={24}
        className="max-w-[1.5rem] max-h-[1.5rem]"
      />
    ),
  },
  {
    title: "Total Discrepancy",
    date: "   ",
    amount: cashOverview
      ? `₦${cashOverview.totalDiscrepancy.toLocaleString()}`
      : "—",
    icon: (
      <Image
        src="/danger.png"
        alt="danger icon"
        width={24}
        height={24}
        className="max-w-[1.5rem] max-h-[1.5rem]"
      />
    ),
  },
  {
    title: "Reconciliation Rate",
    date: "   ",
    amount: cashOverview ? `${cashOverview.reconciliationRate}%` : "—",
    icon: (
      <Image
        src="/target.png"
        alt="target icon"
        width={24}
        height={24}
        className="max-w-[1.5rem] max-h-[1.5rem]"
      />
    ),
  },

  // ── Counter, audited on its own terms ─────────────────────────────────────
  {
    title: "Counter Cash",
    // The figure that must physically be in the drawer.
    date: counter ? `${counter.transactions} sale${counter.transactions === 1 ? "" : "s"} today` : "Today",
    amount: counter ? naira(tender.cash) : "—",
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  },
  {
    title: "Counter POS & Transfer",
    // The figures that must appear on a statement, not in the drawer.
    date: counter ? `POS ${naira(tender.POS)} · Transfer ${naira(tender.transfer)}` : "Today",
    amount: counter ? naira(Number(tender.POS || 0) + Number(tender.transfer || 0)) : "—",
    icon: (
      <Image
        src="/house.png"
        alt="card icon"
        width={24}
        height={24}
        className="max-w-[1.5rem] max-h-[1.5rem]"
      />
    ),
  },
  // Present only when the gas department is on, so the cash tab does not grow
  // three empty cards for a station that sells no LPG.
  ...(gas
    ? [
        {
          title: "Gas Cash",
          date: `${gas.transactions} sale${gas.transactions === 1 ? "" : "s"} today`,
          amount: naira(gasTender.cash),
          icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
        },
        {
          title: "Gas POS & Transfer",
          date: `POS ${naira(gasTender.POS)} · Transfer ${naira(gasTender.transfer)}`,
          amount: naira(Number(gasTender.POS || 0) + Number(gasTender.transfer || 0)),
          icon: (
            <Image
              src="/house.png"
              alt="card icon"
              width={24}
              height={24}
              className="max-w-[1.5rem] max-h-[1.5rem]"
            />
          ),
        },
      ]
    : []),
  {
    title: "Counter Takings",
    // Split by what was sold. Not crossed with tender: a payment is recorded
    // against the whole sale, so apportioning cash across a mixed basket would
    // be an invention rather than a fact.
    date: counter
      ? `Lubricant ${naira(kind.lubricant?.amount)} · Store ${naira(kind.store?.amount)}`
      : "Today",
    amount: counter ? naira(counter.total) : "—",
    icon: <TbCurrencyNaira size={25} className="text-neutral-800 text-lg" />,
  },
  ];
};