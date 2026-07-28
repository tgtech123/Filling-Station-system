/**
 * The signed-in user, read from localStorage.
 *
 * Exists because several screens were each deriving identity their own way —
 * one hardcoded "admin-user-1", another used `u.id || u._id || "admin-default"`.
 * Anything keyed on those (the profile image cache, most visibly) then stored
 * under one key and read under another, so an uploaded photo never appeared
 * where it was expected.
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

/**
 * Stable id for the signed-in user — the one key everything image-related
 * should use. Returns "" when signed out, so callers can skip the lookup
 * rather than colliding on a shared placeholder id.
 */
export function getCurrentUserId() {
  const u = getCurrentUser();
  return String(u.id || u._id || "");
}

/** Merge fields into the stored user object, keeping everything else intact. */
export function patchCurrentUser(patch) {
  if (typeof window === "undefined") return;
  try {
    const u = getCurrentUser();
    localStorage.setItem("user", JSON.stringify({ ...u, ...patch }));
  } catch {}
}
