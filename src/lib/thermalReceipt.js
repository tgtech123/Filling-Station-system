/**
 * Shared 80mm thermal receipt printing (Xprinter 80mm and compatible).
 *
 * Lifted verbatim from the lubricant sales receipt, which is the reference
 * implementation, so every receipt in the app prints identically instead of
 * each screen carrying its own slightly different copy of the rules.
 *
 * The approach that makes it reliable: the on-screen card is NOT what gets
 * printed. A separate, plain "thermal block" is rendered hidden on screen and
 * revealed only for print, so no Tailwind class can bleed into the output and
 * distort it on a 1-bit thermal head.
 *
 * Usage:
 *   <style>{thermalReceiptCss("gas-receipt-print-root")}</style>
 *   <div id="gas-receipt-print-root">
 *     <div className="no-print">…overlay…</div>
 *     <div className="receipt-card">…on-screen card…</div>
 *     <div className="receipt-thermal-print">…plain print markup…</div>
 *   </div>
 *   <button onClick={printThermalReceipt}>Print</button>
 */

const CSS_TEMPLATE = String.raw`
        @page { size: 80mm auto; margin: 4mm 4mm; }

        /* ── Screen: thermal block invisible ── */
        __ROOT__ .receipt-thermal-print { display: none; }

        /* ══════════════════════════════════════════
           PRINT STYLES
           Strategy: hide the Tailwind screen card
           entirely; show only the clean thermal block
           so no Tailwind class bleeds through.
        ══════════════════════════════════════════ */
        @media print {
          body > *:not(__ROOT__) { display: none !important; }

          /* Strip every screen-layout property from the root.
             Tailwind fixed/inset-0/flex/items-center must all be cancelled
             so the root shrinks to its content width and flows normally. */
          __ROOT__ {
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
          __ROOT__ .no-print     { display: none !important; }
          __ROOT__ .receipt-card { display: none !important; }

          /* Show thermal block */
          __ROOT__ .receipt-thermal-print {
            display:    block   !important;
            width:      76mm    !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust:         exact !important;
          }

          /* Base: every element is pure black, heavy weight, Courier New */
          __ROOT__ .receipt-thermal-print,
          __ROOT__ .receipt-thermal-print * {
            font-family: 'Courier New', Courier, monospace !important;
            color:       #000000 !important;
            background:  transparent !important;
            font-size:   9.5pt  !important;
            font-weight: 800    !important;
            line-height: 1.5    !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust:         exact !important;
            margin:  0 !important;
            padding: 0 !important;
          }

          /* Station headline */
          .t-station-name {
            font-size:      14pt  !important;
            font-weight:    900   !important;
            text-align:     center !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em  !important;
            line-height:    1.3     !important;
            display:        block   !important;
            margin-bottom:  2pt     !important;
          }

          /* Address */
          .t-address {
            font-size:   8pt    !important;
            font-weight: 700    !important;
            text-align:  center !important;
            line-height: 1.5    !important;
            display:     block  !important;
          }

          /* Receipt type label */
          .t-receipt-title {
            font-size:      11pt   !important;
            font-weight:    900    !important;
            text-align:     center !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em    !important;
            display:        block     !important;
            padding:        3pt 0     !important;
          }

          /* Meta rows (date, cashier, etc.) */
          .t-meta-row {
            display:         flex          !important;
            justify-content: space-between !important;
            font-size:       8.5pt         !important;
            font-weight:     700           !important;
            line-height:     1.7           !important;
          }
          .t-meta-row span:first-child { font-weight: 700 !important; }
          .t-meta-row span:last-child  { font-weight: 900 !important; }

          /* Divider lines */
          .t-line-solid {
            border-top:    1.5pt solid #000 !important;
            margin:        4pt 0            !important;
            display:       block            !important;
          }
          .t-line-dashed {
            border-top:    1pt dashed #000 !important;
            margin:        4pt 0           !important;
            display:       block           !important;
          }

          /* Items table */
          .t-table {
            width:           100%     !important;
            border-collapse: collapse !important;
            display:         table    !important;
          }
          .t-table thead tr {
            border-top:    1.5pt solid #000 !important;
            border-bottom: 1.5pt solid #000 !important;
            display:       table-row        !important;
          }
          .t-table th {
            font-size:      8pt       !important;
            font-weight:    900       !important;
            text-transform: uppercase !important;
            padding:        3pt 2pt   !important;
            display:        table-cell !important;
          }
          .t-table td {
            font-size:    9pt        !important;
            font-weight:  700        !important;
            padding:      3pt 2pt    !important;
            border-bottom: 0.5pt dashed #000 !important;
            vertical-align: top       !important;
            display:      table-cell  !important;
          }

          /* Total row */
          .t-total-row {
            display:         flex          !important;
            justify-content: space-between !important;
            align-items:     center        !important;
            padding:         3pt 0         !important;
          }
          .t-total-label {
            font-size:      12pt      !important;
            font-weight:    900       !important;
            text-transform: uppercase !important;
          }
          .t-total-amount {
            font-size:   14pt !important;
            font-weight: 900  !important;
          }

          /* Amount in words */
          .t-words {
            font-size:       8.5pt   !important;
            font-weight:     700     !important;
            text-align:      center  !important;
            font-style:      italic  !important;
            text-transform:  capitalize !important;
            display:         block   !important;
            padding:         2pt 0   !important;
          }

          /* Footer */
          .t-footer-line {
            font-size:   8pt    !important;
            font-weight: 700    !important;
            text-align:  center !important;
            font-style:  italic !important;
            line-height: 1.6    !important;
            display:     block  !important;
          }

          /* Station logo — must be fully-qualified to beat the wildcard */
          __ROOT__ .receipt-thermal-print .t-logo-wrap {
            display:         block     !important;
            text-align:      center    !important;
            margin-bottom:   4pt       !important;
            padding:         0         !important;
          }
          __ROOT__ .receipt-thermal-print .t-logo-wrap img {
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

          /* Powered-by branding */
          .t-powered-by {
            font-size:      6.5pt   !important;
            font-weight:    800     !important;
            text-align:     center  !important;
            font-style:     normal  !important;
            letter-spacing: 0.03em  !important;
            line-height:    1.5     !important;
            display:        block   !important;
            margin-top:     4pt     !important;
            color:          #000000 !important;
          }
        }
      `;

/** Print CSS scoped to the given root element id. */
export function thermalReceiptCss(rootId = "receipt-print-root") {
  return CSS_TEMPLATE.split("__ROOT__").join("#" + rootId);
}

/**
 * Open the print dialog once every image in the thermal block has loaded.
 *
 * Without this the station logo prints blank whenever it is served from a
 * remote URL and has not finished downloading — the browser snapshots the page
 * the instant window.print() is called.
 */
export function printThermalReceipt(onAfterPrint) {
  const thermalBlock = document.querySelector(".receipt-thermal-print");
  const images = thermalBlock ? Array.from(thermalBlock.querySelectorAll("img")) : [];

  const ready = images.map(
    (img) =>
      new Promise((resolve) => {
        if (img.complete && img.naturalWidth > 0) resolve();
        else {
          img.onload = resolve;
          img.onerror = resolve; // print anyway rather than hang on a bad URL
        }
      })
  );

  return Promise.all(ready).then(() => {
    if (typeof onAfterPrint === "function") {
      const handler = () => {
        window.removeEventListener("afterprint", handler);
        onAfterPrint();
      };
      window.addEventListener("afterprint", handler);
    }
    window.print();
  });
}
