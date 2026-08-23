/**
 * Reading the dates that invoices actually carry.
 *
 * `purchaseDate` is a free-text string on the purchase record, and the invoice
 * form captures it the way Nigerian paperwork writes it: DD/MM/YYYY. Passing
 * that to `new Date()` produces Invalid Date in every browser, which is not a
 * loud failure but a silent one:
 *
 *   - the table prints the words "Invalid Date"
 *   - every duration filter compares against Invalid Date, which is false for
 *     >= and <= alike, so choosing "This month" empties the list entirely
 *   - the search haystack contains "Invalid Date" instead of a date, so no
 *     search on a date can ever match
 *
 * One bad parse, three broken features. Everything that reads an invoice date
 * goes through here.
 */

/**
 * Day-first, with a round-trip check.
 *
 * The round trip is what makes it safe: 31/02/2026 builds a Date that rolls
 * over into March, and comparing the components back catches it instead of
 * silently accepting a date that does not exist.
 */
export function parseInvoiceDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  const raw = String(value).trim();
  if (!raw) return null;

  // ISO first: unambiguous, and anything stored by a date input looks like this.
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  // DD/MM/YYYY, also accepting - and . as separators.
  const dmy = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    const d = new Date(year, month - 1, day);
    // Rejects 31/02 and 13 as a month rather than rolling silently forward.
    if (d.getDate() !== day || d.getMonth() !== month - 1 || d.getFullYear() !== year) {
      return null;
    }
    return d;
  }

  // A full timestamp, which is what `createdAt` is.
  const fallback = new Date(raw);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * The date to show and filter on.
 *
 * Falls back to when the invoice was booked. A row must never print "Invalid
 * Date" at a user: if the typed date cannot be read, the recorded one is both
 * true and more defensible for an audit, since nobody can back-date it.
 */
export function invoiceDateOf(purchase) {
  return parseInvoiceDate(purchase?.purchaseDate) || parseInvoiceDate(purchase?.createdAt);
}

/** "23 Aug 2026". Unambiguous, unlike anything with slashes in it. */
export function formatInvoiceDate(value, { withTime = false } = {}) {
  const d = parseInvoiceDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/**
 * Every way somebody might type the same date into a search box.
 *
 * Searching "23/08" and searching "23 Aug" are the same intent, and a haystack
 * built from one display format answers only one of them.
 */
export function invoiceDateTokens(value) {
  const d = parseInvoiceDate(value);
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return [
    `${dd}/${mm}/${yyyy}`,
    `${dd}-${mm}-${yyyy}`,
    `${yyyy}-${mm}-${dd}`,
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
  ].join(" ");
}

/**
 * Loose matching for reference numbers.
 *
 * People type INV-001, inv 001 and INV/001 for the same invoice. Comparing the
 * alphanumerics alone means the search finds it however it was written down.
 */
export function looseRef(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
