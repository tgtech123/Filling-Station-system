"use client";
import { forwardRef } from "react";

/**
 * NumericInput — mobile-friendly numeric field.
 * Triggers the correct keypad and strips invalid characters as the user types.
 *
 * Variants:
 *   "tel"      → phone number  (type="tel", digits only, preserves leading zeros)
 *   "numeric"  → integer       (OTP, quantity, count)
 *   "decimal"  → number+point  (price, amount, percentage)
 *   "card"     → card number   (digits + spaces)
 */
const NumericInput = forwardRef(function NumericInput(
  { variant = "numeric", value, onChange, onValueChange, className = "", ...props },
  ref
) {
  const config = {
    tel: {
      type: "tel",
      inputMode: "tel",
      pattern: "[0-9]*",
      autoComplete: "tel",
      filter: (v) => v.replace(/\D/g, ""),
    },
    numeric: {
      type: "text",
      inputMode: "numeric",
      pattern: "[0-9]*",
      filter: (v) => v.replace(/\D/g, ""),
    },
    decimal: {
      type: "text",
      inputMode: "decimal",
      pattern: "[0-9]*[.,]?[0-9]*",
      filter: (v) => {
        const cleaned = v.replace(/[^0-9.]/g, "");
        const parts = cleaned.split(".");
        return parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;
      },
    },
    card: {
      type: "text",
      inputMode: "numeric",
      pattern: "[0-9\\s]*",
      autoComplete: "cc-number",
      filter: (v) => v.replace(/[^0-9\s]/g, ""),
    },
  }[variant];

  const handleChange = (e) => {
    const filtered = config.filter(e.target.value);
    e.target.value = filtered;
    onChange?.(e);
    onValueChange?.(filtered);
  };

  return (
    <input
      ref={ref}
      type={config.type}
      inputMode={config.inputMode}
      pattern={config.pattern}
      autoComplete={config.autoComplete}
      value={value}
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
});

export default NumericInput;