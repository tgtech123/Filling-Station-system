"use client";
import { API_URL } from "@/lib/config";
import React, { useState, useEffect } from "react";
import { X, Plus, Monitor } from "lucide-react";
import DynamicSalesTable from "./DynamicSalesTable";
import ReceiptModal from "./reusefilter/ReceiptModal";
import { useLubricantStore } from "@/store/lubricantStore";
import { publishToCustomerDisplay, openCustomerDisplay, CUSTOMER_DISPLAY_PATH } from "@/lib/customerDisplay";

const LubSales = () => {
  const [rows, setRows] = useState([
    {
      barcode: "",
      productName: "",
      unitPrice: "",
      quantity: "1",
      amount: "",
      lubricantId: null,
      unitName: "",
      saleUnits: [],
      baseUnit: "piece",
    },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("POS");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  /**
   * The last failed scan, kept structured rather than as a string so the banner
   * can offer the right action: registering an unknown barcode is useful,
   * offering it for a product that is merely out of stock is not.
   */
  const [scanError, setScanError] = useState(null);

  // 🆕 Get selected product from store
  const {
    selectedProductForSale,
    clearSelectedProductForSale,
    fetchAllTransactions,
    lubricants,
    fetchLubricants,
  } = useLubricantStore();

  // Load the catalogue once so scans resolve locally. Without this every beep
  // is a network round trip and the till crawls on a poor connection.
  useEffect(() => {
    if (!lubricants?.length) fetchLubricants();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  /**
   * Mirror the basket to the customer-facing screen.
   *
   * Only the four things a customer is entitled to see — what it is, how many,
   * the price each and the line total. Cost, margin and stock never leave this
   * component: a monitor facing the shop floor is a public display.
   */
  useEffect(() => {
    publishToCustomerDisplay({
      stationName: user?.station?.name || "",
      items: rows
        .filter((r) => r.productName && Number(r.amount) > 0)
        .map((r) => ({
          name: r.productName,
          quantity: Number(r.quantity) || 0,
          unitName: r.unitName && r.unitName !== r.baseUnit ? r.unitName : "",
          unitPrice: Number(r.unitPrice) || 0,
          amount: Number(r.amount) || 0,
        })),
      total: rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
      status: "active",
    });
  }, [rows, user]);


  useEffect(() => {
    if (selectedProductForSale) {
      addProductToTable(selectedProductForSale);
      clearSelectedProductForSale(); // Clear after adding
    }
  }, [selectedProductForSale]);

  /**
   * Open the customer screen and say what actually happened.
   *
   * Every failure mode here needs its own sentence — "nothing happened" leaves
   * someone standing at a till with no idea what to try next, which is exactly
   * how this ends up reported as simply not working.
   */
  const [displayHelp, setDisplayHelp] = useState(null);

  const handleOpenCustomerScreen = async () => {
    const result = await openCustomerDisplay();
    if (result.status === "placed") {
      setDisplayHelp(null);
      setMessage("✅ Customer screen opened on the second monitor");
    } else if (result.status === "opened") {
      setDisplayHelp({
        tone: "info",
        text: "Opened, but the browser chose the screen. Drag the new window onto the customer's monitor, then press F11 to make it full screen. It stays there next time.",
      });
    } else if (result.status === "nodual") {
      setDisplayHelp({
        tone: "warn",
        text: "Windows is not showing a second screen. Right-click the desktop → Display settings → set the second display to \"Extend these displays\" (not Duplicate), then press this button again.",
      });
    } else {
      setDisplayHelp({
        tone: "warn",
        text: "Your browser blocked the pop-up. Allow pop-ups for this site, or open a new browser window on the customer's monitor and go to the address below.",
      });
    }
  };

  const addProductToTable = (product) => {
   const price = Number(product.unitPrice ?? 0);
    
    // Find the first empty row
    const emptyRowIndex = rows.findIndex(row => !row.barcode && !row.productName);
    
    if (emptyRowIndex !== -1) {
      // Fill the empty row
      const updatedRows = [...rows];
      updatedRows[emptyRowIndex] = {
        barcode: product.barcode || "",
        productName: product.productName || "",
        unitPrice: price.toString(),
        quantity: "1",
        amount: price.toString(),
        lubricantId: product._id,
        // Sold by the piece until the cashier picks a bigger unit.
        unitName: product.baseUnit || "piece",
        basePrice: price.toString(),
        baseUnit: product.baseUnit || "piece",
        saleUnits: product.saleUnits || [],
      };
      setRows(updatedRows);
      
      // If this was the last row, add a new blank row
      if (emptyRowIndex === rows.length - 1) {
        setRows([
          ...updatedRows,
          {
            barcode: "",
            productName: "",
            unitPrice: "",
            quantity: "1",
            amount: "",
            lubricantId: null,
            unitName: "",
            saleUnits: [],
            baseUnit: "piece",
          },
        ]);
      }
    } else {
      // No empty row found, add to the end
      setRows([
        ...rows,
        {
          barcode: product.barcode || "",
          productName: product.productName || "",
          unitPrice: price.toString(),
          quantity: "1",
          amount: price.toString(),
          lubricantId: product._id,
          // Sold by the piece until the cashier picks a bigger unit.
          unitName: product.baseUnit || "piece",
          basePrice: price.toString(),
          baseUnit: product.baseUnit || "piece",
          saleUnits: product.saleUnits || [],
        },
        // Add another blank row for next product
        {
          barcode: "",
          productName: "",
          unitPrice: "",
          quantity: "1",
          amount: "",
          lubricantId: null,
          unitName: "",
          saleUnits: [],
          baseUnit: "piece",
        },
      ]);
    }
    
    // Show success message
    setMessage(`✅ ${product.productName} added to cart`);
  };

  /**
   * Resolve a scanned barcode and put it in the basket.
   *
   * Local first. The full product list is already in the store, so a scan is an
   * in-memory lookup — effectively instant — instead of a network round trip on
   * every beep. A till on a slow forecourt connection, or hitting a server
   * waking from idle, could otherwise take seconds per item, and a queue forms.
   *
   * The network is still consulted when the barcode is not in the local list,
   * because the catalogue may have been added to on another device since this
   * page loaded. That is the only case that pays for a round trip.
   */
  const fetchLubricant = async (code, index) => {
    const startedAt = performance.now();
    const finish = (outcome) => {
      const ms = Math.round(performance.now() - startedAt);
      // Kept as a log rather than shown to the cashier: it is for diagnosing a
      // slow till, not something they can act on.
      console.log(`[scan] ${code} → ${outcome} in ${ms}ms`);
    };

    const isAlreadyOnBill = (item) => {
      /**
       * Already on the bill?
       *
       * Scanning the same product twice almost always means the cashier lost
       * track — two bottles beeped, or one beep they did not hear. Silently
       * adding a second line for the same product is the worst answer: the
       * receipt shows it twice, the customer queries it, and the cashier has to
       * work out which line to delete with a queue waiting.
       *
       * So: refuse, say exactly where it already is, and let them set the
       * quantity by hand. Auto-incrementing is the other tempting option, but
       * then a double-beep silently charges for two and nobody ever sees it.
       *
       * Returns true when it handled the scan.
       */
      const duplicateAt = rows.findIndex(
        (r, i) => i !== index && r.lubricantId && String(r.lubricantId) === String(item._id)
      );
      if (duplicateAt !== -1) {
        setScanError({
          code: "ALREADY_ON_BILL",
          message: `${item.productName} is already on line ${duplicateAt + 1} (quantity ${rows[duplicateAt].quantity}). Change the quantity on that line instead of scanning again.`,
          barcode: code,
        });
        // Clear the code just scanned so this line stays ready for the NEXT
        // product rather than holding one that was refused.
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, barcode: "" } : r)));
        setMessage("");
        return true;
      }
      return false;
    };

    const applyScannedItem = (item) => {
      // A scanned code can be the product's own barcode or one printed on its
      // carton. Matching the carton selects the carton — that is the whole
      // reason a case has its own barcode.
      const scanned = String(code).trim();
      const scannedUnit = (item.saleUnits || []).find(
        (u) => String(u.barcode || "").trim() && String(u.barcode).trim() === scanned
      );
      const price = Number(scannedUnit ? scannedUnit.price : item.unitPrice ?? 0);

      /**
       * One functional update, not a read-then-write against `rows`.
       *
       * A hardware scanner fires faster than React re-renders. Copying `rows`
       * from the closure meant a second beep landing before the first repaint
       * started from the OLD basket and silently dropped the item that had just
       * been added — the exact failure a cashier cannot see and the customer
       * pays for. Deriving from `prev` makes every scan land, at any speed.
       */
      setRows((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          productName: item.productName || "",
          unitPrice: price.toString(),
          amount: (price * (Number(next[index].quantity) || 1)).toString(),
          lubricantId: item._id,
          unitName: scannedUnit ? scannedUnit.name : item.baseUnit || "piece",
          basePrice: String(Number(item.unitPrice ?? 0)),
          baseUnit: item.baseUnit || "piece",
          saleUnits: item.saleUnits || [],
        };

        // Keep one empty row waiting, so the next scan always has somewhere to go.
        const last = next[next.length - 1];
        if (last.barcode && last.productName) {
          next.push({ barcode: "", productName: "", unitPrice: "", quantity: "1", amount: "", lubricantId: null, unitName: "", saleUnits: [], baseUnit: "piece" });
        }
        return next;
      });
    };

    // ── Local hit ──────────────────────────────────────────────────────────
    // Matches the product's own barcode OR any of its units'. A carton carries
    // its own code, and without checking those a scanned carton fell through to
    // the network and came back "not found" — the slowest possible answer to a
    // barcode the station had actually registered.
    const target = String(code).trim();
    const local = (lubricants || []).find(
      (l) =>
        String(l.barcode || "").trim() === target ||
        (l.saleUnits || []).some((u) => String(u.barcode || "").trim() === target)
    );

    if (local) {
      if (Number(local.qtyInStock) <= 0) {
        setScanError({
          code: "OUT_OF_STOCK",
          message: `${local.productName} (${code}) has 0 in stock — restock before selling.`,
          barcode: code,
        });
        setMessage("");
        finish("out of stock");
        return;
      }
      if (isAlreadyOnBill(local)) { finish("duplicate"); return; }
      applyScannedItem(local);
      setScanError(null);
      setMessage("");
      finish("ok (local)");
      return;
    }

    // ── Not in the local catalogue: ask the server ─────────────────────────
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/lubricant/get-lubricant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ barcode: code }),
      });

      const result = await res.json();

      if (res.ok && result.data) {
        if (isAlreadyOnBill(result.data)) { finish("duplicate"); return; }
        applyScannedItem(result.data);
        setScanError(null);
        setMessage("");
        finish("ok (server)");
        return;
      }

      // Distinct outcomes need distinct messages. Collapsing them into one
      // "not found" told a cashier holding a real bottle that it did not
      // exist, when the truth was that the stock had run out.
      if (result?.code === "OUT_OF_STOCK") {
        setScanError({ code: "OUT_OF_STOCK", message: result.error, barcode: code, productName: result.productName });
        finish("out of stock");
      } else if (res.status === 404 || result?.code === "NOT_FOUND") {
        setScanError({ code: "NOT_FOUND", message: result?.error || `No product with barcode "${code}" at this station.`, barcode: code });
        finish("not found");
      } else {
        setScanError({ code: "ERROR", message: result?.error || result?.message || "Could not look up that barcode.", barcode: code });
        finish("error");
      }
      setMessage("");
    } catch (error) {
      setScanError({ code: "OFFLINE", message: "Could not reach the server. Check the connection and scan again.", barcode: code });
      finish("network error");
    }
  };

  // 🧠 Update barcode on input (no fetch yet)
  const handleBarcodeChange = (e, index) => {
    const value = e.target.value;
    // Functional, and replacing the row rather than mutating it: a scanner types
    // a whole barcode in a few milliseconds, and the old read-then-write against
    // a shallow copy could drop characters between renders.
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, barcode: value } : row)));
  };

  // ⌨️ Trigger fetch when Enter key is pressed
  const handleBarcodeKeyPress = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = rows[index].barcode.trim();
      if (code) fetchLubricant(code, index);
    }
  };

  // 🖱️ Trigger fetch when user clicks away (blur)
  const handleBarcodeBlur = (e, index) => {
    const code = rows[index].barcode.trim();
    if (code) fetchLubricant(code, index);
  };

  /**
   * Switching a line between piece, pack and carton.
   *
   * Re-prices the line from the unit's own price rather than multiplying the
   * piece price up — a pack is normally sold below twelve singles, and that
   * discount is why anyone buys one. Quantity stays as typed: 2 stays 2, it just
   * means two packs now.
   */
  const handleUnitChange = (index, name) => {
    const updatedRows = [...rows];
    const row = updatedRows[index];
    const unit = (row.saleUnits || []).find((u) => u.name === name);

    row.unitName = name;
    row.unitPrice = String(unit ? Number(unit.price) : Number(row.basePrice || 0));
    row.amount = String((parseFloat(row.quantity) || 0) * (parseFloat(row.unitPrice) || 0));

    setRows(updatedRows);
  };

  /** "Pack of 12" — what one of this unit contains, for the dropdown. */
  const unitLabel = (row, unit) =>
    unit ? `${unit.name} of ${unit.factor}` : row.baseUnit || "piece";

  const handleQtyChange = (e, index) => {
    const value = e.target.value;
    const updatedRows = [...rows];
    updatedRows[index].quantity = value;
    const qtyNum = parseFloat(value) || 0;
    const total = qtyNum * (parseFloat(updatedRows[index].unitPrice) || 0);
    updatedRows[index].amount = total.toString();
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(
      updatedRows.length
        ? updatedRows
        : [
            {
              barcode: "",
              productName: "",
              unitPrice: "",
              quantity: "1",
              amount: "",
              lubricantId: null,
              unitName: "",
              saleUnits: [],
              baseUnit: "piece",
            },
          ]
    );
  };

  const handleSubmit = async ({ paymentBreakdown } = {}) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const validItems = rows.filter((row) => row.lubricantId);
      if (!validItems.length) {
        setMessage("❌ Please scan at least one valid product");
        return;
      }

      const normalizedPaymentMethod =
        paymentMethod === "POS" ? "POS" : paymentMethod.toLowerCase();

      // ✅ Send ALL items in ONE request
      const response = await fetch(
        `${API_URL}/api/lubricant/sell-lubricant-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: validItems.map((item) => ({
              lubricantId: item.lubricantId,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
            })),
            paymentMethod: normalizedPaymentMethod,
            ...(normalizedPaymentMethod === "mixed" && paymentBreakdown
              ? { paymentBreakdown }
              : {}),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || result.error || "Failed to record sale"
        );
      }

      const totalAmount = validItems.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );

      // Generate receipt
      const receiptPayload = {
        cashier: `${user.firstName} ${user.lastName}`,
        station: user.station?.name || "N/A",
        address: user.station?.address || "N/A",
        logo: user.station?.logoUrl || user.station?.logo || null,
        date: new Date().toLocaleString(),
        paymentType: paymentMethod,
        txnId: result.data.txnId,
        items: validItems.map((item, i) => ({
          sn: i + 1,
          name: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          amount: item.amount,
        })),
        total: totalAmount,
      };

      setMessage("✅ Sale recorded successfully!");
      // Refresh transaction store so reprint tables update immediately
      fetchAllTransactions();

      setTimeout(() => {
        setReceiptData(receiptPayload);
        setIsModalOpen(true);
        setRows([
          {
            barcode: "",
            productName: "",
            unitPrice: "",
            quantity: "1",
            amount: "",
            lubricantId: null,
            unitName: "",
            saleUnits: [],
            baseUnit: "piece",
          },
        ]);
        setMessage("");
      }, 2000);
    } catch (err) {
      setMessage(`❌ ${err.message || "Server error, please try again."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 flex flex-col rounded-xl gap-6 text-neutral-800 dark:text-neutral-100 w-full min-w-0">
      <div className="mb-2 flex flex-col text-neutral-800 dark:text-neutral-100 gap-2 sm:gap-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Lubricant &amp; Store Sales</h1>
            <p className="text-lg sm:text-xl font-medium">
              Record, print and export all sales receipt
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Opens the customer-facing screen on the second monitor. Pressed
                once at the start of a shift; the window then mirrors every
                basket on its own. */}
            <button
              onClick={handleOpenCustomerScreen}
              title="Open the customer-facing screen"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold"
            >
              <Monitor size={15} /> Customer screen
            </button>
          </div>
        </div>
      </div>

      {/* Customer screen didn't land where it should. The address is shown
          because opening it by hand on the second monitor always works, whatever
          the browser decided to do. */}
      {displayHelp && (
        <div
          className={`p-3.5 rounded-xl border ${
            displayHelp.tone === "warn"
              ? "bg-amber-50 border-amber-300 text-amber-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold">Customer screen</p>
              <p className="text-sm mt-0.5">{displayHelp.text}</p>
              <p className="text-xs mt-1.5 font-mono break-all opacity-90">
                {typeof window !== "undefined" ? window.location.origin : ""}
                {CUSTOMER_DISPLAY_PATH}
              </p>
            </div>
            <button
              onClick={() => setDisplayHelp(null)}
              className="shrink-0 p-1 rounded-lg hover:bg-black/5"
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Scan failures ─────────────────────────────────────────────────
          Named precisely, because "not found" for an out-of-stock product
          sends a cashier hunting for a barcode that is perfectly correct. */}
      {scanError && (
        <div
          // Amber is "stop and look", red is "this cannot proceed". A duplicate
          // scan and an empty shelf are both recoverable at the till; an unknown
          // barcode is not.
          className={`p-3.5 rounded-xl border ${
            ["OUT_OF_STOCK", "ALREADY_ON_BILL"].includes(scanError.code)
              ? "bg-amber-50 border-amber-300 text-amber-800"
              : "bg-red-50 border-red-300 text-red-700"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold">
                {scanError.code === "ALREADY_ON_BILL"
                  ? "Already on this bill"
                  : scanError.code === "OUT_OF_STOCK"
                  ? "Out of stock"
                  : scanError.code === "NOT_FOUND"
                  ? "Not registered at this station"
                  : scanError.code === "OFFLINE"
                  ? "No connection"
                  : "Scan failed"}
              </p>
              <p className="text-sm mt-0.5">{scanError.message}</p>
              {scanError.code === "OUT_OF_STOCK" && (
                <p className="text-xs mt-1 opacity-80">
                  This item cannot be added to the sale until stock is received or adjusted.
                </p>
              )}
            </div>
            <button
              onClick={() => setScanError(null)}
              className="shrink-0 p-1 rounded-lg hover:bg-black/5"
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>
          </div>

          {/* No "register it now" button.
              What the shop stocks, and what it sells for, is a management
              decision — an unknown barcode at the till is a call to the
              supervisor, not a form for the cashier to fill in. Telling them
              exactly what to say is more use than a button that would put an
              unpriced product in the system. */}
          {scanError.code === "NOT_FOUND" && (
            <p className="mt-2.5 text-xs text-red-700 bg-white/60 rounded-lg px-3 py-2">
              Ask your manager or supervisor to add this item. Give them the
              barcode <span className="font-mono font-bold">{scanError.barcode}</span>.
            </p>
          )}
        </div>
      )}

      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-semibold ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message}
        </div>
      )}

      {/* ── Mobile card layout (< sm) ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {rows.map((row, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">
                Item {index + 1}
              </span>
              <button
                onClick={() => handleDeleteRow(index)}
                className="flex items-center gap-1 text-red-500 text-xs font-semibold hover:text-red-400"
              >
                Remove <X size={13} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {/* Barcode — full width */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                  Barcode
                </label>
                <input
                  type="text"
                  value={row.barcode}
                  onChange={(e) => handleBarcodeChange(e, index)}
                  onKeyDown={(e) => handleBarcodeKeyPress(e, index)}
                  onBlur={(e) => handleBarcodeBlur(e, index)}
                  placeholder="Scan or type barcode, press Enter"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100 rounded-lg text-sm"
                />
              </div>

              {/* Product name — full width */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                  Product Name
                </label>
                <input
                  type="text"
                  value={row.productName}
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded-lg text-sm"
                />
              </div>

              {/* Sold as — only when the product has bigger units defined */}
              {row.saleUnits?.length > 0 && (
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                    Sold as
                  </label>
                  <select
                    value={row.unitName || row.baseUnit || "piece"}
                    onChange={(e) => handleUnitChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100 rounded-lg text-sm capitalize"
                  >
                    <option value={row.baseUnit || "piece"}>{row.baseUnit || "piece"}</option>
                    {row.saleUnits.map((u) => (
                      <option key={u.name} value={u.name}>
                        {unitLabel(row, u)} — ₦{Number(u.price).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Unit price + Quantity side by side */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                    Unit Price (₦)
                  </label>
                  <input
                    type="text"
                    value={row.unitPrice}
                    disabled
                    className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) => handleQtyChange(e, index)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Amount — full width, highlighted */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                  Amount (₦)
                </label>
                <input
                  type="text"
                  value={row.amount ? `₦${Number(row.amount).toLocaleString()}` : ""}
                  disabled
                  className="w-full px-3 py-2 border border-blue-200 bg-blue-50 dark:bg-gray-600 dark:border-gray-500 rounded-lg text-sm font-semibold text-blue-700 dark:text-blue-300"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table layout (≥ sm) ── */}
      <div className="hidden sm:block w-full overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700 pb-2">
        <table className="min-w-[760px] text-sm text-left text-gray-700 dark:text-gray-200 w-full">
          <thead className="bg-gray-100 dark:bg-gray-700 text-md font-semibold text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3">Barcode</th>
              <th className="px-4 py-3">Product name</th>
              <th className="px-4 py-3">Sold as</th>
              <th className="px-4 py-3">Unit price (₦)</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {rows.map((row, index) => (
              <tr key={index} className="text-sm">
                <td className="px-5 py-2">
                  <input
                    type="text"
                    value={row.barcode}
                    onChange={(e) => handleBarcodeChange(e, index)}
                    onKeyDown={(e) => handleBarcodeKeyPress(e, index)}
                    onBlur={(e) => handleBarcodeBlur(e, index)}
                    placeholder="Enter barcode and press Enter"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 rounded-xl mt-2"
                  />
                </td>
                <td className="px-5 py-2">
                  <input
                    type="text"
                    value={row.productName}
                    disabled
                    className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 rounded-xl mt-2"
                  />
                </td>
                <td className="px-5 py-2">
                  {row.saleUnits?.length > 0 ? (
                    <select
                      value={row.unitName || row.baseUnit || "piece"}
                      onChange={(e) => handleUnitChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 rounded-xl mt-2 capitalize"
                    >
                      <option value={row.baseUnit || "piece"}>{row.baseUnit || "piece"}</option>
                      {row.saleUnits.map((u) => (
                        <option key={u.name} value={u.name}>
                          {unitLabel(row, u)} — ₦{Number(u.price).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="px-3 py-2 mt-2 text-gray-400 capitalize">{row.baseUnit || "piece"}</p>
                  )}
                </td>
                <td className="px-5 py-2">
                  <input
                    type="text"
                    value={row.unitPrice}
                    disabled
                    className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 rounded-xl mt-2"
                  />
                </td>
                <td className="px-5 py-2">
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) => handleQtyChange(e, index)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 rounded-xl mt-2"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.amount}
                    disabled
                    className="w-full px-3 py-2 border border-neutral-300 bg-neutral-100 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 rounded-xl mt-2"
                  />
                </td>
                <td className="px-4 py-2">
                  <div
                    onClick={() => handleDeleteRow(index)}
                    className="flex items-center gap-1 text-red-500 font-semibold cursor-pointer hover:text-red-400 mt-2"
                  >
                    Delete <X size={16} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DynamicSalesTable
        totalAmount={rows.reduce(
          (sum, r) => sum + (parseFloat(r.amount) || 0),
          0
        )}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onSubmit={handleSubmit}
        loading={isSubmitting}
      />

      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        receiptData={receiptData}
      />

    </div>
  );
};

export default LubSales;