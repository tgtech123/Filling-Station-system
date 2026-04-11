/**
 * Returns true when the logged-in user's station is in read-only (grace period) mode.
 * Use this to disable write actions anywhere in the dashboard.
 *
 * @example
 * import { isReadOnly } from "@/utils/accessMode";
 *
 * <button disabled={isReadOnly()} title={isReadOnly() ? "Read-only mode — contact support" : undefined}>
 *   Save
 * </button>
 */
export const isReadOnly = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.accessMode === "read-only";
  } catch {
    return false;
  }
};
