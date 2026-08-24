/**
 * Baskets set aside, and the one currently on the counter.
 *
 * Two problems, one store.
 *
 * A refresh used to empty the till. That is a page reload wiping a customer's
 * shopping, and the only recovery was to scan the lot again with them standing
 * there. The live basket is now written down as it changes, so a reload, a
 * crash or a stray F5 puts it straight back.
 *
 * And a queue does not arrive one finished sale at a time. Somebody asks for
 * another item, or goes back for their wallet, and the cashier needs the
 * counter clear for the next person without losing what was already scanned.
 * Parking does exactly that.
 *
 * Held in localStorage rather than on the server on purpose: a parked basket
 * belongs to THIS till, it is worth nothing to anyone else, and it has to keep
 * working when the forecourt connection does not.
 */

const LIVE_KEY = "fueldesk:till:live";
const PARKED_KEY = "fueldesk:till:parked";

/** Parked baskets are per station, so two branches never see each other's. */
const stationOf = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const s = u.station;
    return String(s?._id || s?.id || s || "unknown");
  } catch {
    return "unknown";
  }
};

const keyFor = (base) => `${base}:${stationOf()}`;

const read = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(keyFor(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(keyFor(key), JSON.stringify(value));
  } catch {
    // A full quota must never stop a sale. Losing the backup is survivable;
    // throwing here would not be.
  }
};

/* ── The live basket ─────────────────────────────────────────────────────── */

/** Only rows holding a product are worth keeping. */
const meaningful = (rows) => (rows || []).filter((r) => r && r.lubricantId);

export function saveLiveBasket(rows, paymentMethod) {
  const kept = meaningful(rows);
  if (!kept.length) {
    clearLiveBasket();
    return;
  }
  write(LIVE_KEY, { rows: kept, paymentMethod, at: Date.now() });
}

export function loadLiveBasket() {
  const saved = read(LIVE_KEY, null);
  if (!saved?.rows?.length) return null;

  /**
   * A basket left overnight is not a sale in progress, it is yesterday's
   * accident. Twelve hours is long enough to cover a shift and a reload, short
   * enough that nobody inherits a stranger's trolley in the morning.
   */
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  if (Date.now() - (saved.at || 0) > TWELVE_HOURS) {
    clearLiveBasket();
    return null;
  }
  return saved;
}

export function clearLiveBasket() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(keyFor(LIVE_KEY));
  } catch {}
}

/* ── Parked baskets ──────────────────────────────────────────────────────── */

/**
 * How many baskets may sit on hold at once.
 *
 * Three, and no more. A hold is a promise that a specific customer is coming
 * back, and a till with a dozen of them is not managing a queue, it is
 * accumulating stock that has left the shelf count without being sold and
 * without anybody watching it. Three is what a person can actually keep in
 * their head and point at across a counter.
 *
 * Silently dropping the oldest, which is what the old cap did, is the worst
 * option available: the basket a customer is walking back towards is the one
 * that disappears, and nothing says so.
 */
export const MAX_PARKED = 3;

export function listParkedSales() {
  const list = read(PARKED_KEY, []);
  return Array.isArray(list) ? list : [];
}

/**
 * Set the current basket aside and hand back the updated list.
 *
 * `label` is whatever the cashier can shout across a counter: a name, "blue
 * shirt", a car colour. Free text on purpose, because a queue does not come
 * with reference numbers.
 */
/**
 * Set the current basket aside.
 *
 * Returns { ok, parked, reason } rather than a bare list, so a refusal can be
 * told apart from a hold that simply had nothing in it. Refusing is the whole
 * point of the limit: dropping one quietly to make room for another is how a
 * waiting customer's shopping vanishes.
 */
export function parkSale(rows, paymentMethod, label) {
  const kept = meaningful(rows);
  if (!kept.length) return { ok: false, reason: "EMPTY", parked: listParkedSales() };

  const existing = listParkedSales();
  if (existing.length >= MAX_PARKED) {
    return { ok: false, reason: "LIMIT", parked: existing };
  }

  const total = kept.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const entry = {
    id: `park_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    label: String(label || "").trim() || `Sale of ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    rows: kept,
    paymentMethod,
    total,
    itemCount: kept.length,
    at: Date.now(),
  };

  // Newest first: the person who just stepped aside is the likeliest to return.
  const next = [entry, ...existing];
  write(PARKED_KEY, next);
  clearLiveBasket();
  return { ok: true, parked: next };
}

export function removeParkedSale(id) {
  const next = listParkedSales().filter((p) => p.id !== id);
  write(PARKED_KEY, next);
  return next;
}

export function getParkedSale(id) {
  return listParkedSales().find((p) => p.id === id) || null;
}
