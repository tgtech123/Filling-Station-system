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
export const CUSTOMER_DISPLAY_PATH = "/dashboard/customer-display";

/**
 * Open the customer screen, on the second monitor where the browser allows it.
 *
 * Returns a result rather than a window, because every failure here needs a
 * different sentence in front of the cashier. "Nothing happened" is the one
 * outcome that leaves someone stuck at a till with no idea what to try.
 *
 *   placed   — put on the external monitor automatically
 *   opened   — opened, but the browser chose where; drag it across
 *   blocked  — popup blocker stopped it; they must allow popups or open the URL
 *   nodual   — Windows is not extending onto a second screen at all
 */
export async function openCustomerDisplay() {
  if (typeof window === "undefined") return { status: "blocked" };

  let external = null;
  let screenCount = 1;

  try {
    if ("getScreenDetails" in window) {
      const details = await window.getScreenDetails();
      screenCount = details.screens.length;
      external = details.screens.find((s) => !s.isPrimary) || null;
    } else if (window.screen?.isExtended) {
      // Chrome knows the desktop is extended even before permission is granted.
      screenCount = 2;
    }
  } catch {
    // Permission refused. Not fatal — we can still open a window, we just
    // cannot choose which screen it lands on.
  }

  if (external) {
    const features = `left=${external.left},top=${external.top},width=${external.availWidth},height=${external.availHeight}`;
    const win = window.open(CUSTOMER_DISPLAY_PATH, "fueldesk-customer-display", features);
    if (win) {
      win.focus();

      /**
       * Take it full screen from here.
       *
       * On a rear-mounted customer display nobody will EVER click that screen —
       * it faces away from the cashier and the customer cannot reach it. So the
       * "click to go full screen" fallback inside that page would never fire,
       * and the customer would look at a browser address bar all day.
       *
       * Same origin, and this runs inside the cashier's own click, so the
       * gesture requirement is satisfied. Wrapped because a refused fullscreen
       * must not stop the window being useful.
       */
      const goFullscreen = () => {
        try {
          win.document.documentElement?.requestFullscreen?.().catch(() => {});
        } catch {
          /* not loaded yet, or blocked — the window still works */
        }
      };
      if (win.document?.readyState === "complete") goFullscreen();
      else win.addEventListener?.("load", goFullscreen, { once: true });

      // Focus belongs back on the till: the cashier is about to scan, and a
      // scanner types into whichever window has focus.
      setTimeout(() => window.focus(), 300);

      return { status: "placed", window: win };
    }
    return { status: "blocked" };
  }

  const win = window.open(CUSTOMER_DISPLAY_PATH, "fueldesk-customer-display", "width=1024,height=768");
  if (!win) return { status: "blocked" };

  // Focus must end on the TILL, not the customer window. A barcode scanner is a
  // keyboard: it types into whatever has focus, so leaving the customer window
  // in front means the next scan goes nowhere and the cashier cannot see why.
  setTimeout(() => window.focus(), 300);

  // Only one screen as far as the browser is concerned. Usually Windows is set
  // to Duplicate rather than Extend, which is the single most common reason
  // this appears not to work at all.
  return { status: screenCount > 1 ? "opened" : "nodual", window: win };
}
