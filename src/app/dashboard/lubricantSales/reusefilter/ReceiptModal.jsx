"use client";
import React, { useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LiaTimesSolid } from "react-icons/lia";
import { BsPrinter } from "react-icons/bs";
import { toWords } from "number-to-words";

const QUOTES = [
  "Quality service is not a coincidence — it's a commitment.",
  "Every great journey begins with a single step.",
  "Excellence is not an act, but a habit.",
  "Integrity is doing the right thing, even when no one is watching.",
  "Your loyalty drives us to serve better every day.",
  "Small steps, big progress. Thank you for choosing us.",
  "Great things are built one transaction at a time.",
  "The secret of getting ahead is getting started.",
  "Your trust is our greatest asset.",
  "Powered by purpose, driven by service.",
];

const Divider = ({ dashed }) => (
  <div className={`w-full border-t ${dashed ? "border-dashed border-gray-300" : "border-gray-200"} my-3`} />
);

/**
 * How many slips one print job produces.
 *
 * No browser API can preset the copy count in the print dialog, and a station
 * on silent/kiosk printing never sees a dialog to type it into. So the copies
 * go into the job itself: the thermal block is rendered N times with a page
 * break between, which on an 80mm roll is N receipts off one press.
 */
const MAX_COPIES = 5;

const ReceiptModal = ({ isOpen, onClose, receiptData, autoPrint = false, copies = 1 }) => {
  const copyCount = Math.min(MAX_COPIES, Math.max(1, Number(copies) || 1));
  const quote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen]
  );

  // Auto-print support: when opened with autoPrint (row quick-print), trigger
  // the SAME robust print path (image-wait + afterprint close) once the modal
  // is mounted — never a blind timer racing the fetch/render, which printed
  // the raw gray dashboard page when it lost.
  const printedRef = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      printedRef.current = false;
      return;
    }
    if (autoPrint && !printedRef.current) {
      printedRef.current = true;
      // Next frame so the portal content (incl. thermal block) is in the DOM.
      requestAnimationFrame(() => handlePrint());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoPrint]);

  if (!isOpen) return null;

  const {
    cashier    = "Unknown",
    station    = "Filling Station",
    address    = "",
    phone      = "",
    email      = "",
    receiptNote = "",
    logo       = null,
    date       = new Date().toLocaleString(),
    txnId      = "N/A",
    paymentType = "N/A",
    items      = [],
    total      = 0,
  } = receiptData || {};

  const handlePrint = () => {
    const afterPrint = () => {
      window.removeEventListener("afterprint", afterPrint);
      onClose();
    };

    // Wait for every image inside the thermal block to finish loading
    // before opening the print dialog — avoids blank logo on slow/remote URLs.
    const thermalBlock = document.querySelector(".receipt-thermal-print");
    const images = thermalBlock ? Array.from(thermalBlock.querySelectorAll("img")) : [];
    const imageReadyPromises = images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
          } else {
            img.onload  = resolve;
            img.onerror = resolve; // still proceed even if img fails to load
          }
        })
    );

    Promise.all(imageReadyPromises).then(() => {
      window.addEventListener("afterprint", afterPrint);
      window.print();
    });
  };

  return createPortal(
    <>
      <style>{`
        @page { size: 80mm auto; margin: 4mm 4mm; }

        /* ── Screen: thermal block invisible ── */
        #receipt-print-root .receipt-thermal-print { display: none; }

        /* ══════════════════════════════════════════
           PRINT STYLES
           Strategy: hide the Tailwind screen card
           entirely; show only the clean thermal block
           so no Tailwind class bleeds through.
        ══════════════════════════════════════════ */
        @media print {
          body > *:not(#receipt-print-root) { display: none !important; }

          /* Strip every screen-layout property from the root.
             Tailwind fixed/inset-0/flex/items-center must all be cancelled
             so the root shrinks to its content width and flows normally. */
          #receipt-print-root {
            display:          block   !important;
            position:         static  !important;
            inset:            auto    !important;
            top:              auto    !important;
            right:            auto    !important;
            bottom:           auto    !important;
            left:             auto    !important;
            width:            76mm    !important;
            max-width:        76mm    !important;
            margin:           0 auto  !important;
            padding:          0       !important;
            background:       #ffffff !important;
            z-index:          auto    !important;
            flex-direction:   unset   !important;
            align-items:      unset   !important;
            justify-content:  unset   !important;
            gap:              0       !important;
            overflow:         visible !important;
          }

          /* Hide overlay (the dark bg-black/60 div) and the screen card */
          #receipt-print-root .no-print     { display: none !important; }
          #receipt-print-root .receipt-card { display: none !important; }

          /* Show thermal block */
          #receipt-print-root .receipt-thermal-print {
            display:    block   !important;
            width:      76mm    !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust:         exact !important;
          }

          /**
           * Why the old slip printed faint, and what actually fixes it.
           *
           * Three things were working against the paper at once:
           *
           * 1. Courier New is a THIN typewriter face. Its strokes are about as
           *    narrow as a thermal head can burn, so they come out grey.
           * 2. font-weight 800 asked for a weight Courier New does not have, so
           *    the browser SYNTHESISED one. A faked bold is drawn by smearing
           *    the glyph, which anti-aliases into light dots rather than
           *    burning a solid line.
           * 3. Anti-aliasing on a one-bit printer turns any grey pixel into a
           *    dot that either fires weakly or not at all.
           *
           * So: a genuinely heavy FACE, filled with pure black, at a size the
           * printer can render as solid dots. Nothing clever. An outline drawn
           * around lighter type was tried and made it worse, because a stroke
           * thinner than one dot can only be anti-aliased.
           */
          #receipt-print-root .receipt-thermal-print,
          #receipt-print-root .receipt-thermal-print * {
            font-family: 'Arial Black', 'Arial Bold', Arial, Helvetica, sans-serif !important;
            color:            #000000 !important;
            background:       transparent !important;
            font-size:        11pt   !important;
            font-weight:      900    !important;
            line-height:      1.4    !important;
            letter-spacing:   0.02em !important;
            /**
             * No text-stroke, and that is the point.
             *
             * A 0.28pt outline is thinner than one device dot, so the renderer
             * CANNOT draw it solid: it anti-aliases, and every glyph gains a
             * fringe of grey pixels. On a one-bit thermal head those half-lit
             * dots either fire weakly or not at all, which is precisely the
             * "dark grey rather than black" this was meant to cure. Asking for
             * a thicker line produced a softer one.
             *
             * Solid black glyphs come from a genuinely heavy FACE filled with
             * pure black, not from an outline drawn around a lighter one.
             */
            opacity: 1 !important;
            -webkit-font-smoothing: none !important;
            -moz-osx-font-smoothing: grayscale !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust:         exact !important;
            margin:  0 !important;
            padding: 0 !important;
          }

          /* The lines worth burning darkest: the shop's name and the money.
             A wider stroke, not a heavier weight, because the weight would be
             synthesised and print lighter rather than darker. */
          /* The name and the money stand out by SIZE, which a printer can
             render solid, rather than by an outline it can only approximate. */
          #receipt-print-root .receipt-thermal-print .t-station-name,
          #receipt-print-root .receipt-thermal-print .t-total-label,
          #receipt-print-root .receipt-thermal-print .t-total-amount {
            color: #000000 !important;
            opacity: 1 !important;
          }

          /* Station headline */
          #receipt-print-root .receipt-thermal-print .t-station-name {
            font-size:      14pt  !important;
            font-weight:    700   !important;
            text-align:     center !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em  !important;
            line-height:    1.3     !important;
            display:        block   !important;
            margin-bottom:  2pt     !important;
          }

          /* Address */
          #receipt-print-root .receipt-thermal-print .t-address {
            font-size:   8pt    !important;
            font-weight: 700    !important;
            text-align:  center !important;
            line-height: 1.5    !important;
            display:     block  !important;
          }

          /* Receipt type label */
          #receipt-print-root .receipt-thermal-print .t-receipt-title {
            font-size:      11pt   !important;
            font-weight:    700    !important;
            text-align:     center !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em    !important;
            display:        block     !important;
            padding:        3pt 0     !important;
          }

          /* Meta rows (date, cashier, etc.) */
          #receipt-print-root .receipt-thermal-print .t-meta-row {
            display:         flex          !important;
            justify-content: space-between !important;
            font-size:       8.5pt         !important;
            font-weight:     700           !important;
            line-height:     1.7           !important;
          }
          #receipt-print-root .receipt-thermal-print .t-meta-row span:first-child { font-weight: 700 !important; }
          #receipt-print-root .receipt-thermal-print .t-meta-row span:last-child  { font-weight: 700 !important; }

          /* Divider lines */
          #receipt-print-root .receipt-thermal-print .t-line-solid {
            border-top:    2.5pt solid #000 !important;
            margin:        4pt 0            !important;
            display:       block            !important;
          }
          #receipt-print-root .receipt-thermal-print .t-line-dashed {
            border-top:    1.8pt dashed #000 !important;
            margin:        4pt 0           !important;
            display:       block           !important;
          }

          /* Items table */
          #receipt-print-root .receipt-thermal-print .t-table {
            width:           100%     !important;
            border-collapse: collapse !important;
            display:         table    !important;
          }
          #receipt-print-root .receipt-thermal-print .t-table thead tr {
            border-top:    2.5pt solid #000 !important;
            border-bottom: 2.5pt solid #000 !important;
            display:       table-row        !important;
          }
          #receipt-print-root .receipt-thermal-print .t-table th {
            font-size:      8pt       !important;
            font-weight:    700       !important;
            text-transform: uppercase !important;
            padding:        3pt 2pt   !important;
            display:        table-cell !important;
          }
          #receipt-print-root .receipt-thermal-print .t-table td {
            font-size:    9pt        !important;
            font-weight:  700        !important;
            padding:      3pt 2pt    !important;
            border-bottom: 1pt dashed #000 !important;
            vertical-align: top       !important;
            display:      table-cell  !important;
          }

          /* Total row */
          #receipt-print-root .receipt-thermal-print .t-total-row {
            display:         flex          !important;
            justify-content: space-between !important;
            align-items:     center        !important;
            padding:         3pt 0         !important;
          }
          #receipt-print-root .receipt-thermal-print .t-total-label {
            font-size:      12pt      !important;
            font-weight:    700       !important;
            text-transform: uppercase !important;
          }
          #receipt-print-root .receipt-thermal-print .t-total-amount {
            font-size:   14pt !important;
            font-weight: 700  !important;
          }

          /* Amount in words */
          #receipt-print-root .receipt-thermal-print .t-words {
            font-size:       8.5pt   !important;
            font-weight:     700     !important;
            text-align:      center  !important;
            font-style:      italic  !important;
            text-transform:  capitalize !important;
            display:         block   !important;
            padding:         2pt 0   !important;
          }

          /* Footer */
          #receipt-print-root .receipt-thermal-print .t-footer-line {
            font-size:   8pt    !important;
            font-weight: 700    !important;
            text-align:  center !important;
            font-style:  italic !important;
            line-height: 1.6    !important;
            display:     block  !important;
          }

          /* Station logo — must be fully-qualified to beat the wildcard */
          #receipt-print-root .receipt-thermal-print .t-logo-wrap {
            display:         block     !important;
            text-align:      center    !important;
            margin-bottom:   4pt       !important;
            padding:         0         !important;
          }
          #receipt-print-root .receipt-thermal-print .t-logo-wrap img {
            display:        inline-block  !important;
            width:          auto         !important;
            height:         44pt         !important;
            max-width:      64pt         !important;
            object-fit:     contain      !important;
            filter:         grayscale(100%) contrast(1.5) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust:         exact !important;
            margin:         0 auto       !important;
            padding:        0            !important;
          }

          /* Station contact — the line a customer acts on, so it is set a
             step above the quote and the branding beneath it. */
          #receipt-print-root .receipt-thermal-print .t-contact-head {
            font-size:      8pt       !important;
            font-weight:    700       !important;
            text-align:     center    !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em    !important;
            display:        block     !important;
            padding-bottom: 1pt       !important;
          }
          #receipt-print-root .receipt-thermal-print .t-contact-line {
            font-size:   8.5pt  !important;
            font-weight: 700    !important;
            text-align:  center !important;
            line-height: 1.6    !important;
            display:     block  !important;
            word-break:  break-all !important;
          }

          /* One copy per page: a break before every copy but the first. On
             roll paper each page is a slip, so this is where it tears. */
          #receipt-print-root .receipt-thermal-print .t-copy { display: block !important; }
          #receipt-print-root .receipt-thermal-print .t-copy + .t-copy {
            break-before:      page   !important;
            page-break-before: always !important;
          }
          #receipt-print-root .receipt-thermal-print .t-copy-label {
            font-size:      7.5pt    !important;
            font-weight:    700      !important;
            text-align:     center   !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em   !important;
            display:        block    !important;
            padding-top:    2pt      !important;
          }

          /* The station's terms. Set apart from the quote above it, which is
             decoration, because this one is a statement the station stands
             behind and a customer may quote back at the counter. */
          #receipt-print-root .receipt-thermal-print .t-note {
            font-size:      8.5pt    !important;
            font-weight:    700      !important;
            text-align:     center   !important;
            text-transform: uppercase !important;
            letter-spacing: 0.03em   !important;
            line-height:    1.5      !important;
            display:        block    !important;
            padding:        2pt 0    !important;
          }

          /* An email can be longer than half a slip, so its value wraps under
             the label instead of colliding with it. */
          #receipt-print-root .receipt-thermal-print .t-meta-email {
            flex-wrap: wrap !important;
          }
          #receipt-print-root .receipt-thermal-print .t-meta-email span:last-child {
            font-size:  8pt !important;
            word-break: break-all !important;
          }

          /* The unit a price belongs to, under the figure rather than beside
             it. An 80mm slip has no room for a sixth column, and "2,300" alone
             does not say whether it bought one bottle or a carton of them. */
          #receipt-print-root .receipt-thermal-print .t-unit-label {
            display:        block     !important;
            font-size:      7pt       !important;
            font-weight:    700       !important;
            text-transform: uppercase !important;
            letter-spacing: 0.04em    !important;
            line-height:    1.2       !important;
          }

          /* Powered-by branding */
          #receipt-print-root .receipt-thermal-print .t-powered-by {
            font-size:      6.5pt   !important;
            font-weight:    700     !important;
            text-align:     center  !important;
            font-style:     normal  !important;
            letter-spacing: 0.03em  !important;
            line-height:    1.5     !important;
            display:        block   !important;
            margin-top:     4pt     !important;
            color:          #000000 !important;
          }
        }
      `}</style>

      <div id="receipt-print-root" className="fixed inset-0 z-50 flex items-center justify-center p-4">

        {/* ── Overlay (screen only) ── */}
        <div className="no-print absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* ══════════════════════════════════════════
            SCREEN CARD — unchanged, untouched
        ══════════════════════════════════════════ */}
        <div className="receipt-card relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-50 overflow-hidden">
          <div className="receipt-top-bar h-1.5 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500" />

          <div className="receipt-inner px-6 py-5">

            {/* Station header */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className="receipt-logo-wrap w-20 h-20 rounded-full overflow-hidden border-4 border-green-100 shadow-md mb-3 flex items-center justify-center bg-gray-50">
                {logo ? (
                  <img src={logo} alt="Station logo" className="w-full h-full object-contain" />
                ) : (
                  // Initial rather than a stock badge, for the same reason the
                  // printed slip carries none.
                  <span className="text-2xl font-bold text-gray-300">
                    {String(station || "?").trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="receipt-station-name text-lg font-bold text-gray-900 leading-tight">{station}</h2>
              {address && (
                <p className="text-xs text-gray-500 mt-0.5 max-w-[240px] leading-snug">{address}</p>
              )}
            </div>

            <Divider />

            <div className="text-center mb-3">
              <span className="inline-block bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-green-200">
                Lubricant & Retail Sales Receipt
              </span>
            </div>

            <div className="px-1 text-xs text-gray-600 space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Transaction ID</span>
                <span className="font-semibold text-gray-800">{txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Date</span>
                <span className="font-semibold text-gray-800">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Cashier</span>
                <span className="font-semibold text-gray-800">{cashier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Payment</span>
                <span className="font-semibold text-gray-800">{paymentType}</span>
              </div>
            </div>

            {(phone || email) && (
              <div className="px-1 text-xs text-gray-600 space-y-1.5 mb-4">
                {phone && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400 font-medium shrink-0">Complaints</span>
                    <span className="font-semibold text-gray-800 text-right">{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400 font-medium shrink-0">Email</span>
                    <span className="font-semibold text-gray-800 text-right break-all">{email}</span>
                  </div>
                )}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs mb-1">
                <thead>
                  <tr className="text-gray-400 uppercase tracking-wide border-b border-dashed border-gray-200">
                    <th className="text-left pb-2 font-semibold">Item</th>
                    <th className="text-center pb-2 font-semibold">Qty</th>
                    <th className="text-right pb-2 font-semibold">Unit (₦)</th>
                    <th className="text-right pb-2 font-semibold">Amt (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dashed divide-gray-100">
                  {items.length > 0 ? (
                    items.map((item, i) => (
                      <tr key={i} className="text-gray-700">
                        <td className="receipt-item-name py-2 font-medium max-w-[110px] truncate">{item.name}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">
                          {Number(item.unitPrice).toLocaleString()}
                          {item.unitName && (
                            <span className="block text-[10px] uppercase tracking-wide text-gray-400 leading-tight">
                              {item.unitName}
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-right font-semibold">
                          {(Number(item.unitPrice) * Number(item.quantity)).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400">No items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Divider dashed />

            <div className="flex items-end justify-between mb-1">
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Total</span>
              <div className="text-right">
                <p className="receipt-total-amount text-xl font-extrabold text-gray-900">
                  ₦{Number(total).toLocaleString()}
                </p>
                {total > 0 && (
                  <p className="text-[10px] text-gray-400 capitalize mt-0.5">
                    {toWords(total)} naira only
                  </p>
                )}
              </div>
            </div>

            <Divider />

            {receiptNote && (
              <p className="text-center px-2 mb-3 text-[11px] font-bold uppercase tracking-wide text-gray-600">
                {receiptNote}
              </p>
            )}

            <div className="text-center px-2 mb-4">
              <p className="text-[11px] italic text-gray-400 leading-relaxed">"{quote}"</p>
              <p className="text-[10px] text-gray-300 mt-2 font-medium tracking-wide uppercase">
                Thank you for your business
              </p>
            </div>

            <div className="receipt-bottom-bar h-1 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500 rounded-full mb-4" />

            {/* Action buttons */}
            <div className="no-print flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-red-400 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
              >
                <LiaTimesSolid size={16} /> Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
              >
                <BsPrinter size={16} /> Print
              </button>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════
            THERMAL PRINT BLOCK
            Hidden on screen. On print, this is the
            ONLY thing rendered — no Tailwind class
            pollution, no specificity wars, pure
            black bold Courier New on white paper.
        ══════════════════════════════════════════ */}
        <div className="receipt-thermal-print">
          {Array.from({ length: copyCount }, (_, copyIndex) => (
          <div className="t-copy" key={copyIndex}>

          {/* Only this station's own logo. No stock fallback: a packaged badge
              on a receipt is somebody else's mark on this station's paper, and
              the name printed underneath already identifies the slip. */}
          {logo && (
            <div className="t-logo-wrap">
              <img src={logo} alt="Station logo" />
            </div>
          )}

          {/* Station name */}
          <div className="t-station-name">{station}</div>
          {address && <div className="t-address">{address}</div>}

          <div className="t-line-solid" />

          {/* Receipt type */}
          <div className="t-receipt-title">Lubricant &amp; Retail Sales Receipt</div>

          <div className="t-line-dashed" />

          {/* Transaction meta */}
          <div className="t-meta-row"><span>Ref</span><span>{txnId}</span></div>
          <div className="t-meta-row"><span>Date</span><span>{date}</span></div>
          <div className="t-meta-row"><span>Cashier</span><span>{cashier}</span></div>
          <div className="t-meta-row"><span>Payment</span><span>{paymentType}</span></div>

          {/* How to reach the STATION, sitting with the rest of the transaction
              header rather than at the very bottom. On a long receipt the foot
              of the slip is the part a customer never unrolls, and a complaints
              line nobody reads is the same as not printing one. The vendor
              credit stays at the bottom, where a credit belongs. */}
          {(phone || email) && (
            <>
              <div className="t-line-dashed" />
              {phone && (
                <div className="t-meta-row">
                  <span>Complaints</span><span>{phone}</span>
                </div>
              )}
              {email && (
                <div className="t-meta-row t-meta-email">
                  <span>Email</span><span>{email}</span>
                </div>
              )}
            </>
          )}

          <div className="t-line-solid" />

          {/* Items table */}
          <table className="t-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left",  width: "6%" }}>#</th>
                <th style={{ textAlign: "left",  width: "40%" }}>Item</th>
                <th style={{ textAlign: "center",width: "12%" }}>Qty</th>
                <th style={{ textAlign: "right", width: "20%" }}>Unit (₦)</th>
                <th style={{ textAlign: "right", width: "22%" }}>Amt (₦)</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: "left"   }}>{i + 1}</td>
                    <td style={{ textAlign: "left", wordBreak: "break-word" }}>{item.name}</td>
                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>
                      {Number(item.unitPrice).toLocaleString()}
                      {item.unitName && (
                        <span className="t-unit-label">{item.unitName}</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right"  }}>
                      {(Number(item.unitPrice) * Number(item.quantity)).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>No items</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="t-line-solid" />

          {/* Total */}
          <div className="t-total-row">
            <span className="t-total-label">TOTAL</span>
            <span className="t-total-amount">₦{Number(total).toLocaleString()}</span>
          </div>

          <div className="t-line-dashed" />

          {/* Amount in words */}
          {total > 0 && (
            <div className="t-words">{toWords(total)} naira only</div>
          )}

          <div className="t-line-solid" />

          {/* Footer */}
          <div className="t-footer-line">"{quote}"</div>
          <div className="t-footer-line">— Thank you for your business —</div>

          {receiptNote && (
            <>
              <div className="t-line-dashed" />
              <div className="t-note">{receiptNote}</div>
            </>
          )}

          <div className="t-line-dashed" />

          {/* Branding */}
          <div className="t-powered-by">Powered by Techsol Dev Concepts | +234 7068690589</div>

          {copyCount > 1 && (
            <div className="t-copy-label">Copy {copyIndex + 1} of {copyCount}</div>
          )}

          </div>
          ))}
        </div>

      </div>
    </>,
    document.body
  );
};

export default ReceiptModal;
