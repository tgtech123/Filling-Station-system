import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/dashboard",
}));

import { useSessionTimeout } from "../useSessionTimeout";

const LAST_SEEN_KEY = "fueldesk:lastSeenAt";
const MINUTE = 60 * 1000;

/** A token whose `iat` is `issuedMsAgo` milliseconds in the past. */
function tokenIssuedMsAgo(issuedMsAgo) {
  const payload = { iat: Math.floor((Date.now() - issuedMsAgo) / 1000) };
  const b64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${b64}.signature`;
}

function signIn({ issuedMsAgo = 0, lastSeenMsAgo = null } = {}) {
  localStorage.setItem("token", tokenIssuedMsAgo(issuedMsAgo));
  localStorage.setItem("user", JSON.stringify({ id: "1" }));
  if (lastSeenMsAgo !== null) {
    localStorage.setItem(LAST_SEEN_KEY, String(Date.now() - lastSeenMsAgo));
  }
}

/** Pretend to be a phone, or not. userAgentData wins when it is present. */
function setDevice(kind) {
  Object.defineProperty(navigator, "userAgentData", {
    value: { mobile: kind === "phone" },
    configurable: true,
  });
}

describe("useSessionTimeout", () => {
  beforeEach(() => {
    replace.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("on a phone, the away window is 30 minutes", () => {
    beforeEach(() => setDevice("phone"));

    it("signs out a session that was left for 31 minutes", () => {
      // The reported problem: a phone discards the page while backgrounded, so
      // on return the app starts cold with no timer state — only the stored
      // timestamp can tell us how long it has been.
      signIn({ issuedMsAgo: 2 * 60 * MINUTE, lastSeenMsAgo: 31 * MINUTE });

      renderHook(() => useSessionTimeout());

      expect(replace).toHaveBeenCalledWith("/login?reason=idle");
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });

    it("signs out a session that was left for days", () => {
      signIn({ issuedMsAgo: 5 * 24 * 60 * MINUTE, lastSeenMsAgo: 3 * 24 * 60 * MINUTE });

      renderHook(() => useSessionTimeout());

      expect(replace).toHaveBeenCalledWith("/login?reason=idle");
      expect(localStorage.getItem("token")).toBeNull();
    });

    it("keeps a session that was only away for 10 minutes", () => {
      signIn({ issuedMsAgo: 60 * MINUTE, lastSeenMsAgo: 10 * MINUTE });

      renderHook(() => useSessionTimeout());

      expect(replace).not.toHaveBeenCalled();
      expect(localStorage.getItem("token")).not.toBeNull();
    });
  });

  describe("on anything that is not a phone, the 40-minute idle rule applies", () => {
    beforeEach(() => setDevice("desktop"));

    it("keeps a till or desktop session that was away for 31 minutes", () => {
      // The shorter window is deliberately phone-only: a touchscreen POS
      // terminal is a fixed device in a controlled place, and an earlier
      // version of this rule logged cashiers out mid-sale.
      signIn({ issuedMsAgo: 60 * MINUTE, lastSeenMsAgo: 31 * MINUTE });

      renderHook(() => useSessionTimeout());

      expect(replace).not.toHaveBeenCalled();
      expect(localStorage.getItem("token")).not.toBeNull();
    });

    it("signs out once past 40 minutes", () => {
      signIn({ issuedMsAgo: 60 * MINUTE, lastSeenMsAgo: 41 * MINUTE });

      renderHook(() => useSessionTimeout());

      expect(replace).toHaveBeenCalledWith("/login?reason=idle");
    });
  });

  it("does not punish a fresh sign-in for an old timestamp", () => {
    // Signing out elsewhere in the app clears the token but not the stamp. A
    // token issued just now means the session started after it, so the stale
    // stamp must be ignored — otherwise logging back in two days later bounces
    // straight to the login form.
    setDevice("phone");
    signIn({ issuedMsAgo: 0, lastSeenMsAgo: 2 * 24 * 60 * MINUTE });

    renderHook(() => useSessionTimeout());

    expect(replace).not.toHaveBeenCalled();
    expect(localStorage.getItem("token")).not.toBeNull();
  });

  it("records a timestamp so the next cold start can measure the gap", () => {
    setDevice("phone");
    signIn({ issuedMsAgo: MINUTE });

    renderHook(() => useSessionTimeout());

    const stamp = Number(localStorage.getItem(LAST_SEEN_KEY));
    expect(stamp).toBeGreaterThan(Date.now() - 5000);
  });

  it("does nothing at all when nobody is signed in", () => {
    setDevice("phone");
    localStorage.setItem(LAST_SEEN_KEY, String(Date.now() - 10 * 24 * 60 * MINUTE));

    renderHook(() => useSessionTimeout());

    expect(replace).not.toHaveBeenCalled();
  });
});
