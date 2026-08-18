/**
 * The link between the cashier's till and the customer-facing second screen.
 *
 * An Everson (or any dual-output) till is ONE computer driving two monitors, so
 * the customer screen is a second browser window of the same app — same origin,
 * same session. That makes BroadcastChannel exactly right: the basket goes
 * across in microseconds, with no server round trip, and it keeps working when
 * the forecourt connection does not. A socket would put the customer's screen at
 * the mercy of the network, which is the one thing it must never depend on.
 *
 * `localStorage` is the fallback for the rare browser without BroadcastChannel —
 * a storage write fires a `storage` event in every OTHER window of the origin,
 * which is precisely the delivery we need.
 */

const CHANNEL = "fueldesk:customer-display";
const MIRROR_KEY = "fueldesk:customer-display:last";

let channel = null;
const getChannel = () => {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  try {
    channel = new BroadcastChannel(CHANNEL);
  } catch {
    channel = null;
  }
  return channel;
};

/**
 * Push the current basket to the customer screen.
 *
 * Always writes to localStorage as well, so a customer window opened MID-SALE
 * paints the basket that is already on the counter instead of an empty screen
 * until the next keystroke.
 */
export function publishToCustomerDisplay(payload) {
  if (typeof window === "undefined") return;
  const message = { ...payload, at: Date.now() };
  try {
    localStorage.setItem(MIRROR_KEY, JSON.stringify(message));
  } catch {}
  const ch = getChannel();
  if (ch) ch.postMessage(message);
}

/**
 * Listen on the customer screen. Returns an unsubscribe function.
 *
 * Reads the mirror immediately for the same reason as above: the screen should
 * be correct the instant it opens, not one keystroke later.
 */
export function subscribeToCustomerDisplay(onMessage) {
  if (typeof window === "undefined") return () => {};

  try {
    const last = localStorage.getItem(MIRROR_KEY);
    if (last) onMessage(JSON.parse(last));
  } catch {}

  const ch = getChannel();
  const onChannel = (event) => onMessage(event.data);
  if (ch) ch.addEventListener("message", onChannel);

  const onStorage = (event) => {
    if (event.key !== MIRROR_KEY || !event.newValue) return;
    try {
      onMessage(JSON.parse(event.newValue));
    } catch {}
  };
  window.addEventListener("storage", onStorage);

  return () => {
    if (ch) ch.removeEventListener("message", onChannel);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Open the customer screen, on the second monitor where the browser allows it.
 *
 * The Window Management API can place the window on the external display without
 * anyone dragging it — worth trying, since a cashier should not have to arrange
 * windows at the start of every shift. It needs a permission the user may refuse,
 * so the plain popup is the fallback and the flow works either way.
 */
export async function openCustomerDisplay() {
  const url = "/dashboard/customer-display";

  try {
    if (typeof window !== "undefined" && "getScreenDetails" in window) {
      const details = await window.getScreenDetails();
      const external = details.screens.find((s) => !s.isPrimary) || details.currentScreen;
      if (external) {
        const features = `left=${external.left},top=${external.top},width=${external.availWidth},height=${external.availHeight}`;
        const win = window.open(url, "fueldesk-customer-display", features);
        // Fullscreen has to be requested from inside that window; it does so on
        // first interaction. Nothing more to do here.
        if (win) return win;
      }
    }
  } catch {
    // Permission refused or no second screen — fall through to the popup.
  }

  return window.open(url, "fueldesk-customer-display", "width=1024,height=768");
}
