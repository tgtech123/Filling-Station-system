"use client";
import { API_URL } from "@/lib/config";
import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Monitor, PauseCircle, ListChecks, RotateCcw, Trash2 } from "lucide-react";
import DynamicSalesTable from "./DynamicSalesTable";
import ReceiptModal from "./reusefilter/ReceiptModal";
import { useLubricantStore } from "@/store/lubricantStore";
import { publishToCustomerDisplay, openCustomerDisplay, CUSTOMER_DISPLAY_PATH } from "@/lib/customerDisplay";
import { useSocket } from "@/hooks/useSocket";
import {
  saveLiveBasket, loadLiveBasket, clearLiveBasket,
  listParkedSales, parkSale, removeParkedSale, getParkedSale,
} from "./parkedSales";

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
  /**
   * Whether the banner reads as good news or bad.
   *
   * This used to be inferred from an emoji at the front of the message, so the
   * icon was load-bearing rather than decorative. Saying the tone outright
   * keeps the styling working and keeps pictures out of the sentence.
   */
  const [messageTone, setMessageTone] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * The in-flight latch, and the id of the basket in flight.
   *
   * `isSubmitting` disables the buttons, but it is state: it only takes effect
   * on the next render, so two taps landing in the same tick can both get past
   * it. This ref is set synchronously and closes that window outright.
   *
   * The key is the second line of defence, for what the latch cannot see — a
   * request the browser retries after a dropped response. Minted once per
   * basket and resent unchanged, it lets the server recognise the replay and
   * return the original sale instead of recording a second one. A new basket
   * gets a new key.
   */
  /**
   * The barcode inputs, so focus can follow the scanner.
   *
   * A hardware scanner types the code and sends Enter. Without moving focus,
   * the caret stays in the line just filled, and the next beep types a second
   * product's barcode ON TOP of the first one's field. The cashier sees the
   * line they already scanned change under them, and either the sale is wrong
   * or they stop and fix it with a queue waiting.
   *
   * Keyed by row index rather than held in an array, so a deleted row cannot
   * leave a stale slot pointing at the wrong input.
   */
  const barcodeRefs = useRef({});

  /**
   * Put the caret on the first line still waiting for a product.
   *
   * Deferred a frame: the row that receives focus may not exist yet at the
   * moment the scan resolves, because the empty line at the end is appended in
   * the same update.
   */
  const focusNextBarcode = () => {
    requestAnimationFrame(() => {
      setRows((current) => {
        const next = current.findIndex((r) => !r.lubricantId);
        const el = barcodeRefs.current[next === -1 ? current.length - 1 : next];
        if (el) { el.focus(); el.select?.(); }
        return current; // read-only: this updater exists to see live rows
      });
    });
  };

  const submitInFlightRef = useRef(false);
  const basketKeyRef = useRef(null);

  const basketKey = () => {
    if (!basketKeyRef.current) {
      basketKeyRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    return basketKeyRef.current;
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  /**
   * Whether the receipt should open its own print dialog.
   *
   * "Record and Print" sets it; "Save" clears it. Kept as state rather than
   * passed at call time because the modal reads it when it mounts.
   */
  const [autoPrint, setAutoPrint] = useState(false);

  /**
   * Slips per sale. A station that files its own copy wants the same number
   * every time, so the choice is remembered on the till rather than re-picked
   * on each sale. Read after mount — localStorage does not exist on the server.
   */
  /**
   * The station's own terms, printed under the totals.
   *
   * Read from the server rather than the login payload so a change the owner
   * makes in Settings reaches the till on its next load, without every cashier
   * having to sign out and back in for it to take effect.
   */
  const [receiptNote, setReceiptNote] = useState("");
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/receipt-settings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d?.data) setReceiptNote(d.data.receiptNote || ""); })
      .catch(() => {}); // a missing note must never stop a sale
    return () => { cancelled = true; };
  }, []);

  /**
   * Baskets set aside for customers who stepped away, and the panel that lists
   * them. Read once on mount; every change goes through the helpers so the
   * stored copy and the screen cannot disagree.
   */
  const [parked, setParked] = useState([]);
  const [showParked, setShowParked] = useState(false);
  const [parkLabel, setParkLabel] = useState("");
  const [askingPark, setAskingPark] = useState(false);

  useEffect(() => setParked(listParkedSales()), []);

  /**
   * Put the live basket back after a reload.
   *
   * A refresh used to empty the till, which meant re-scanning a customer's
   * shopping in front of them. Restored once, on mount, and only when the
   * basket is still empty so it can never overwrite a sale in progress.
   */
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const saved = loadLiveBasket();
    if (!saved?.rows?.length) return;
    setRows([...saved.rows, blankRow()]);
    if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
  }, []);

  /** Write the basket down as it changes, so a reload has something to find. */
  useEffect(() => {
    if (!restoredRef.current) return;
    saveLiveBasket(rows, paymentMethod);
  }, [rows, paymentMethod]);

  const [copies, setCopies] = useState(1);
  useEffect(() => {
    const saved = Number(localStorage.getItem("receiptCopies"));
    if (saved >= 1 && saved <= 5) setCopies(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("receiptCopies", String(copies));
  }, [copies]);

  /** One empty basket line — the shape every reset starts from. */
  const blankRow = () => ({
    barcode: "",
    productName: "",
    unitPrice: "",
    quantity: "1",
    amount: "",
    lubricantId: null,
    unitName: "",
    saleUnits: [],
    baseUnit: "piece",
  });

  const clearCart = () => {
    setRows([blankRow()]);
    setScanError(null);
    basketKeyRef.current = null;
    // The stored copy exists to survive a reload, not to outlive the basket.
    clearLiveBasket();
  };

  /**
   * The last failed scan, kept structured rather than as a string so the banner
   * can offer the right action: registering an unknown barcode is useful,
   * offering it for a product that is merely out of stock is not.
   */
  const [scanError, setScanError] = useState(null);

  /**
   * A duplicate found while the basket was being rewritten.
   *
   * The test has to run against `prev` inside the updater, not against `rows`
   * from the closure: a hardware scanner fires faster than React re-renders, so
   * a second beep could be handled from a render that had not yet seen the
   * first item — and the guard would wave it straight through as a new line.
   * Reporting through a ref is the price of testing against live state; this
   * flushes it into the banner on the render that follows.
   */
  const pendingScanErrorRef = useRef(null);
  useEffect(() => {
    if (!pendingScanErrorRef.current) return;
    setScanError(pendingScanErrorRef.current);
    setMessage("");
    pendingScanErrorRef.current = null;
  });

  /**
   * Where a product already sits on the bill, or -1.
   *
   * Matching is by product id, so the same item scanned from its bottle and
   * from its carton barcode still counts as one line.
   */
  const findExistingLine = (list, productId, skipIndex = -1) =>
    list.findIndex(
      (r, i) => i !== skipIndex && r.lubricantId && String(r.lubricantId) === String(productId)
    );

  const flagDuplicate = (list, at, productName, code = "") => {
    pendingScanErrorRef.current = {
      code: "ALREADY_ON_BILL",
      message: `${productName} is already on line ${at + 1} (quantity ${list[at].quantity}). Increase the quantity on that line instead of adding it again.`,
      barcode: code,
      duplicateLine: at,
    };
  };

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

  /**
   * Keep the till's catalogue current while it sits open.
   *
   * The catalogue is held in memory so a scan resolves without a network round
   * trip, which is right for speed and wrong for freshness: stock booked in on
   * the office machine left the counter still showing zero, and the cashier was
   * told an item was out of stock with the carton standing behind them.
   *
   * The server now announces every change that matters — an invoice booked,
   * goods received, a count corrected, a product registered or priced — and
   * this pulls the catalogue again when it hears one. Cheap, because it only
   * fires on a real change rather than on a timer.
   */
  useSocket({
    "catalogue:changed": () => fetchLubricants(),
  });

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
      setMessageTone("success"); setMessage("Customer screen opened on the second monitor");
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

  /**
   * The single gate every product passes before it can reach a till line.
   *
   * There were two ways into the basket — the scanner and the search box — and
   * only the scanner checked whether the item could actually be sold. A product
   * registered with no quantity went straight onto a line the moment anyone
   * searched for it, and the refusal only arrived when the customer was already
   * waiting to pay. One function, called by both, is the only arrangement where
   * that cannot drift apart again: a third entry point added later has to go
   * through here too.
   *
   * Returns true when the item was REFUSED, so callers read as a guard clause.
   */
  const blockUnsellable = (product, code = "") => {
    const barcode = code || product?.barcode || "";
    const name = product?.productName || "That item";

    const qty = Number(product?.qtyInStock);
    if (!Number.isFinite(qty) || qty <= 0) {
      setScanError({
        code: "OUT_OF_STOCK",
        message: `${name}${barcode ? ` (${barcode})` : ""} has 0 in stock — restock before selling.`,
        barcode,
        productName: name,
      });
      setMessage("");
      return true;
    }

    // Registered at the till but never priced. The server refuses to sell it
    // anyway, so letting it sit in the basket only defers the refusal to the
    // worst possible moment — the customer standing there, ready to pay.
    if (product?.pendingPricing) {
      setScanError({
        code: "NOT_PRICED",
        message: `${name}${barcode ? ` (${barcode})` : ""} has no price yet — a manager must price it before it can be sold.`,
        barcode,
        productName: name,
      });
      setMessage("");
      return true;
    }

    return false;
  };

  const addProductToTable = (product) => {
    // Picking from search is the same event as scanning, and answers to the
    // same gate.
    if (blockUnsellable(product)) return;

   const price = Number(product.unitPrice ?? 0);

    /**
     * Picking from search is the same event as scanning, so it answers the same
     * way: never a second line for a product already on the bill. This path had
     * no guard, which is why a re-selected item still doubled up even after the
     * scanner learned not to.
     */
    const already = findExistingLine(rows, product._id);
    if (already !== -1) {
      // A click is never faster than a render, so this one can report straight
      // to state — no updater to squeeze the test into.
      flagDuplicate(rows, already, product.productName || "That item", product.barcode || "");
      setScanError(pendingScanErrorRef.current);
      pendingScanErrorRef.current = null;
      setMessage("");
      return;
    }

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
    setMessageTone("success"); setMessage(`${product.productName} added to cart`);
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

    /**
     * Already on the bill?
     *
     * Scanning the same product twice almost always means the cashier lost
     * track — two bottles beeped, or one beep they did not hear. Silently
     * adding a second line is the worst answer: the receipt shows it twice, the
     * customer queries it, and the cashier has to work out which line to delete
     * with a queue waiting.
     *
     * So: refuse, say exactly where it already is, and offer to bump that
     * line's quantity. Auto-incrementing on its own is the tempting option, but
     * then a double-beep silently charges for two and nobody ever sees it.
     */
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
        const duplicateAt = findExistingLine(prev, item._id, index);
        if (duplicateAt !== -1) {
          flagDuplicate(prev, duplicateAt, item.productName, code);
          // Clear the code just scanned so this line stays ready for the NEXT
          // product rather than holding one that was refused.
          return prev.map((r, i) => (i === index ? { ...r, barcode: "" } : r));
        }

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
      if (blockUnsellable(local, code)) {
        finish("refused");
        return;
      }
      applyScannedItem(local);
      setScanError(null);
      setMessage("");
      focusNextBarcode();
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
        // The server already refuses an empty shelf, but it is one build away
        // from a lookup that does not. Re-checking what came back costs
        // nothing and keeps the rule in one place on this side too.
        if (blockUnsellable(result.data, code)) {
          finish("refused");
          return;
        }
        applyScannedItem(result.data);
        setScanError(null);
        setMessage("");
        focusNextBarcode();
        finish("ok (server)");
        return;
      }

      // Distinct outcomes need distinct messages. Collapsing them into one
      // "not found" told a cashier holding a real bottle that it did not
      // exist, when the truth was that the stock had run out.
      if (result?.code === "OUT_OF_STOCK") {
        setScanError({ code: "OUT_OF_STOCK", message: result.error, barcode: code, productName: result.productName });
        finish("out of stock");
      } else if (result?.code === "NOT_PRICED") {
        // Amber, not red: the product is real and the shop has it. Someone with
        // the authority to price it just has not yet.
        setScanError({ code: "NOT_PRICED", message: result.error, barcode: code, productName: result.productName });
        finish("not priced");
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

  /**
   * Bump the line a refused scan pointed at.
   *
   * The refusal stands on its own — this is the shortcut, not the mechanism, so
   * it only ever adds one and leaves the banner's figure visible afterwards.
   */
  const increaseDuplicateLine = () => {
    const index = scanError?.duplicateLine;
    if (index === undefined || index === null) return;
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const qty = (Number(r.quantity) || 0) + 1;
        return { ...r, quantity: String(qty), amount: String(qty * (Number(r.unitPrice) || 0)) };
      })
    );
    setScanError(null);
    setMessageTone("success"); setMessage(`Line ${index + 1} quantity increased`);
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

  const handleParkSale = () => {
    const next = parkSale(rows, paymentMethod, parkLabel);
    setParked(next);
    setParkLabel("");
    setAskingPark(false);
    clearCart();
    setMessageTone("success");
    setMessage("Sale set aside. The counter is clear for the next customer.");
  };

  /**
   * Bring a parked basket back.
   *
   * Refused while something is already on the counter rather than merging the
   * two: two customers' shopping in one basket is the one mistake here that
   * ends with somebody paying for another person's goods.
   */
  const handleRestoreParked = (id) => {
    if (rows.some((r) => r.lubricantId)) {
      setScanError({
        code: "BASKET_BUSY",
        message: "Finish or set aside the sale on the counter before restoring another.",
      });
      setShowParked(false);
      return;
    }
    const sale = getParkedSale(id);
    if (!sale) return;
    setRows([...sale.rows, blankRow()]);
    if (sale.paymentMethod) setPaymentMethod(sale.paymentMethod);
    setParked(removeParkedSale(id));
    setShowParked(false);
    setMessageTone("success");
    setMessage(`Restored ${sale.label}`);
  };

  const handleDeleteParked = (id, label) => {
    if (!window.confirm(`Delete "${label}"? The items on it are lost and would need scanning again.`)) return;
    setParked(removeParkedSale(id));
  };

  const handleCancel = () => {
    const hasItems = rows.some((r) => r.lubricantId);
    if (hasItems && !window.confirm("Clear all items from this sale?")) return;
    clearCart();
    setMessage("");
  };

  const handleSubmit = async ({ paymentBreakdown, print = true } = {}) => {
    // Synchronous, before any await — a second tap in the same tick stops here.
    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const validItems = rows.filter((row) => row.lubricantId);
      if (!validItems.length) {
        setMessageTone("error"); setMessage("Please scan at least one valid product");
        return;
      }

      const normalizedPaymentMethod =
        paymentMethod === "POS" ? "POS" : paymentMethod.toLowerCase();

      // Send ALL items in ONE request
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
              /**
               * WHICH unit was sold. Its absence was a live stock bug.
               *
               * Without it the server read every line as a base-unit sale, so a
               * carton of 24 took ONE piece off the shelf while charging the
               * carton price. The count drifted by 23 on every carton sold, and
               * nothing on screen said so.
               *
               * It surfaced as a price mismatch only because the price is now
               * checked against the shelf: the till offered the carton price
               * and the server, believing it was selling a single, quoted the
               * single's.
               */
              unitName: item.unitName || item.baseUnit || undefined,
            })),
            paymentMethod: normalizedPaymentMethod,
            idempotencyKey: basketKey(),
            ...(normalizedPaymentMethod === "mixed" && paymentBreakdown
              ? { paymentBreakdown }
              : {}),
          }),
        }
      );

      const result = await response.json();

      /**
       * The shelf price moved while this basket was open.
       *
       * The server refuses rather than posting at either figure, because a
       * receipt saying one thing while the books say another is worse than a
       * refusal. Recovering is cheap: reload the catalogue, correct the line,
       * and the cashier rings it up again at the real price.
       */
      if (result?.code === "PRICE_CHANGED") {
        await fetchLubricants();
        setRows((prev) =>
          prev.map((r) =>
            r.productName === result.productName && result.expectedPrice
              ? {
                  ...r,
                  unitPrice: String(result.expectedPrice),
                  amount: String((Number(r.quantity) || 1) * Number(result.expectedPrice)),
                }
              : r
          )
        );
        setScanError({
          code: "PRICE_CHANGED",
          message: result.error,
          productName: result.productName,
        });
        setMessage("");
        return;
      }

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
        phone: user.station?.phone || "",
        email: user.station?.email || "",
        receiptNote: receiptNote,
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

      // Refresh transaction store so reprint tables update immediately.
      // Deliberately not awaited: the receipt must not wait on a list refresh.
      fetchAllTransactions();

      if (print) {
        setAutoPrint(true);
        setReceiptData(receiptPayload);
        setIsModalOpen(true);
        setMessage("");
      } else {
        // Saved without printing — here the banner IS the confirmation, since
        // no receipt appears to stand in for one.
        setAutoPrint(false);
        setMessageTone("success"); setMessage("Sale saved");
      }
      clearCart();
    } catch (err) {
      setMessageTone("error"); setMessage(`${err.message || "Server error, please try again."}`);
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 flex flex-col rounded-xl gap-6 text-neutral-800 dark:text-neutral-100 w-full min-w-0">
      <div className="mb-2 flex flex-col text-neutral-800 dark:text-neutral-100 gap-2 sm:gap-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Lubricant &amp; Retail Sales</h1>
            <p className="text-lg sm:text-xl font-medium">
              Record, print and export all sales receipt
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Set the counter aside. Only offered when there is something to
                set aside, so it never sits there inviting a pointless press. */}
            {rows.some((r) => r.lubricantId) && (
              <button
                onClick={() => setAskingPark(true)}
                title="Hold this sale and clear the counter"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 text-sm font-semibold transition-colors"
              >
                <PauseCircle size={15} /> Hold sale
              </button>
            )}

            {parked.length > 0 && (
              <button
                onClick={() => setShowParked(true)}
                title="Sales waiting to be finished"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 text-sm font-semibold transition-colors"
              >
                <ListChecks size={15} /> On hold
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold">
                  {parked.length}
                </span>
              </button>
            )}

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
            ["OUT_OF_STOCK", "ALREADY_ON_BILL", "NOT_PRICED", "PRICE_CHANGED"].includes(scanError.code)
              ? "bg-amber-50 border-amber-300 text-amber-800"
              : "bg-red-50 border-red-300 text-red-700"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold">
                {scanError.code === "PRICE_CHANGED"
                  ? "Price has changed"
                  : scanError.code === "ALREADY_ON_BILL"
                  ? "Already on this bill"
                  : scanError.code === "OUT_OF_STOCK"
                  ? "Out of stock"
                  : scanError.code === "NOT_PRICED"
                  ? "Not priced yet"
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
              {scanError.code === "NOT_PRICED" && (
                <p className="text-xs mt-1 opacity-80">
                  Pricing is a manager's decision, so it cannot be set from the till.
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
          {scanError.code === "ALREADY_ON_BILL" && scanError.duplicateLine !== undefined && (
            <button
              onClick={increaseDuplicateLine}
              className="mt-2.5 w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
            >
              Add 1 to line {scanError.duplicateLine + 1}
            </button>
          )}

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
            messageTone === "success"
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
                  ref={(el) => { barcodeRefs.current[index] = el; }}
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
                <p className="w-full px-1 py-1 text-xs leading-snug font-medium text-gray-800 dark:text-gray-100 break-words whitespace-normal">
                  {row.productName || <span className="text-gray-400">Scan or search a product</span>}
                </p>
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
                        {unitLabel(row, u)}
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
                    ref={(el) => { barcodeRefs.current[index] = el; }}
                    value={row.barcode}
                    onChange={(e) => handleBarcodeChange(e, index)}
                    onKeyDown={(e) => handleBarcodeKeyPress(e, index)}
                    onBlur={(e) => handleBarcodeBlur(e, index)}
                    placeholder="Enter barcode and press Enter"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 rounded-xl mt-2"
                  />
                </td>
                <td className="px-5 py-2">
                  <p className="w-full px-1 py-2 text-xs leading-snug font-medium text-gray-800 dark:text-gray-100 break-words whitespace-normal">
                    {row.productName || <span className="text-gray-400">—</span>}
                  </p>
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
                          {unitLabel(row, u)}
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
        onCancel={handleCancel}
        copies={copies}
        setCopies={setCopies}
        loading={isSubmitting}
      />


      {/* ── Name this held sale ─────────────────────────────────────────── */}
      {askingPark && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setAskingPark(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <PauseCircle size={18} className="text-amber-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Hold this sale</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Give it a name you can call out when they come back. A first name or
              what they are wearing is plenty.
            </p>

            <input
              autoFocus
              value={parkLabel}
              onChange={(e) => setParkLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleParkSale(); }}
              placeholder="e.g. Musa, or blue shirt"
              className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleParkSale}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-colors"
              >
                Hold it
              </button>
              <button
                onClick={() => { setAskingPark(false); setParkLabel(""); }}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sales waiting to be finished ────────────────────────────────── */}
      {showParked && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={() => setShowParked(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">

            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Sales on hold</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {parked.length} waiting. Restoring brings one back to the counter.
                </p>
              </div>
              <button onClick={() => setShowParked(false)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {parked.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nothing on hold.</p>
              ) : (
                parked.map((sale) => (
                  <div
                    key={sale.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{sale.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {sale.itemCount} item{sale.itemCount === 1 ? "" : "s"}
                          {" · "}
                          {new Date(sale.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <p className="text-lg font-extrabold tabular-nums text-[#0080ff] dark:text-green-600 shrink-0">
                        ₦{Number(sale.total || 0).toLocaleString()}
                      </p>
                    </div>

                    {/* What is actually on it, so nobody restores blind. */}
                    <p className="text-[11px] text-gray-400 mt-1.5 truncate">
                      {sale.rows.map((r) => r.productName).filter(Boolean).join(", ")}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleRestoreParked(sale.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                      >
                        <RotateCcw size={13} /> Restore
                      </button>
                      <button
                        onClick={() => handleDeleteParked(sale.id, sale.label)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setAutoPrint(false); }}
        receiptData={receiptData}
        autoPrint={autoPrint}
        copies={copies}
      />

    </div>
  );
};

export default LubSales;