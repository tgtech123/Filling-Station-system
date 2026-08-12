/**
 * Who the SERVER lets do what in the loyalty module.
 *
 * Mirrors the three role groups declared at the top of the server's
 * `routes/fuelLoyalty.route.ts` — same names, same members — so a screen can
 * hide a control instead of offering it and letting the API answer "access
 * denied". Keep these in step with that file; it is the authority, this is a
 * copy kept for the UI.
 *
 *   STAFF        → register/search/list customers, log a sale, request redemption
 *   MGR_ACCT     → list transactions
 *   MGR_ACCT_SUP → see the redemption queue
 *   MGR_SUP      → approve/reject a redemption
 *   MGR          → settings, audit, edit/delete customers
 *   ANY_STAFF    → read settings (points rate + prices; needed to log a sale)
 *
 * Redeeming is the money-out side of loyalty — free litres leave the tank — so
 * it takes two people: anyone may raise a request, but only a manager or
 * supervisor clears it, and never one they raised themselves (the server
 * refuses self-approval outright).
 */
export const MGR          = ["manager", "admin"];
export const MGR_SUP      = ["manager", "admin", "supervisor"];
export const MGR_ACCT     = ["manager", "admin", "accountant"];
export const MGR_ACCT_SUP = ["manager", "admin", "accountant", "supervisor"];
export const STAFF        = ["manager", "admin", "cashier", "attendant", "supervisor"];
export const ANY_STAFF    = ["manager", "admin", "cashier", "attendant", "supervisor", "accountant"];

/** True when `role` is in `allowed`. Null/unknown roles are never allowed. */
export const can = (role, allowed) => !!role && allowed.includes(role);
