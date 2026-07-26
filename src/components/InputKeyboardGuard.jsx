"use client";
import { useEffect } from "react";

/**
 * InputKeyboardGuard — app-wide input normalizer, mounted once in the root layout.
 *
 * Guarantees, for EVERY <input> in the app (existing, inside modals, or added
 * later via route change / dynamic rows), the correct on-focus mobile keyboard
 * and safe numeric entry — without having to touch each field:
 *
 *   type="number" → decimal keypad  (inputmode="decimal") + min="0", and the
 *                   keys  -  +  e  E  are rejected, so a negative value like -12
 *                   can never be typed, pasted, drag-dropped, or autofilled.
 *   type="tel"    → phone keypad     (inputmode="tel")
 *   type="email"  → email keyboard   (inputmode="email" + autocomplete="email")
 *
 * Escape hatch: add  data-allow-negative  to a number input to permit negatives
 * (e.g. a genuine signed accounting adjustment).
 *
 * This is intentionally centralized: hundreds of inline inputs across dozens of
 * pages stay correct with no per-field edits, and any future field is covered
 * automatically. Fields built on <NumericInput> already handle this at source;
 * this guard is the safety net for raw inputs. It only sets DOM attributes and
 * calls preventDefault — it never mutates input.value, so controlled React
 * inputs are never desynced.
 */

const BLOCKED_NUMERIC_KEYS = new Set(["-", "+", "e", "E"]);
const BLOCKED_NUMERIC_RE = /[-+eE]/;

function isGuardedNumberInput(el) {
  return (
    el instanceof HTMLInputElement &&
    (el.getAttribute("type") || "").toLowerCase() === "number" &&
    !el.hasAttribute("data-allow-negative")
  );
}

function normalizeInput(el) {
  if (!(el instanceof HTMLInputElement)) return;
  const type = (el.getAttribute("type") || "text").toLowerCase();
  if (type === "number") {
    if (!el.hasAttribute("inputmode")) el.setAttribute("inputmode", "decimal");
    if (!el.hasAttribute("min") && !el.hasAttribute("data-allow-negative")) {
      el.setAttribute("min", "0");
    }
  } else if (type === "email") {
    if (!el.hasAttribute("inputmode")) el.setAttribute("inputmode", "email");
    if (!el.hasAttribute("autocomplete")) el.setAttribute("autocomplete", "email");
  } else if (type === "tel") {
    if (!el.hasAttribute("inputmode")) el.setAttribute("inputmode", "tel");
  }
}

export default function InputKeyboardGuard() {
  useEffect(() => {
    // 1) Normalize every input already on the page.
    document.querySelectorAll("input").forEach(normalizeInput);

    // 2) Normalize inputs mounted later (modals, dynamic table rows, navigation).
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches?.("input")) normalizeInput(node);
          node.querySelectorAll?.("input").forEach(normalizeInput);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 3) Reject negative / scientific-notation entry on number inputs.
    const onKeyDown = (e) => {
      if (isGuardedNumberInput(e.target) && BLOCKED_NUMERIC_KEYS.has(e.key)) {
        e.preventDefault();
      }
    };
    // beforeinput covers paste, drag-drop, autofill and IME — e.data is the
    // text about to be inserted; block the whole insert if it carries a sign.
    const onBeforeInput = (e) => {
      if (
        isGuardedNumberInput(e.target) &&
        typeof e.data === "string" &&
        BLOCKED_NUMERIC_RE.test(e.data)
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("beforeinput", onBeforeInput, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("beforeinput", onBeforeInput, true);
    };
  }, []);

  return null;
}
