import AuthBackdrop from "./AuthBackdrop";
import TextSlider from "./TextSlider";

/**
 * The frame every signed-out page sits in: photograph edge to edge, a card
 * floating on it, the slider centred underneath.
 *
 * Extracted once three pages needed it. Login, reset password and change
 * password are the same picture with different contents, and three copies of
 * the layout is three places for them to drift apart, which is exactly what had
 * already happened: the login card was max-w-[23rem] with rounded-lg while the
 * reset cards were max-w-md with rounded-2xl, on pages a user moves between in
 * a single sitting.
 *
 * ── One screen, no scrolling ─────────────────────────────────────────────────
 * The page is exactly the height of the viewport and does not scroll. A sign-in
 * screen is not a document: everything on it — the card, the button, the copy
 * beneath — is meant to be taken in at a glance, and a page that drifts up and
 * down under the cursor makes a fixed photograph look like it is sliding.
 *
 * Fitting is done by SHRINKING, not scrolling. The vertical rhythm — the header
 * gap, the padding round the card, the space under the slider — tightens in
 * steps as the viewport gets shorter, so a 1080p monitor gets a generous layout
 * and a 13" laptop at 100% zoom gets a compact one. Both fit.
 *
 * Keyed to viewport HEIGHT rather than width throughout, because the thing being
 * solved for is height: a landscape phone is wide and short, and a browser with
 * three toolbars open is short on any machine.
 *
 * `100dvh` rather than `100vh` so a mobile browser's collapsing address bar is
 * counted properly — with `vh` the bottom of the card sits under the chrome and
 * cannot be reached, which on a page whose last element is the submit button is
 * the worst possible place to lose a few pixels.
 */
export default function AuthShell({ children, showSlider = true }) {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden">
      <AuthBackdrop />

      {/* Wordmark, clear of the card. */}
      <header className="flex shrink-0 items-center gap-2.5 px-5 pt-4 sm:px-8 [@media(min-height:760px)]:pt-6 [@media(min-height:900px)]:pt-8">
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90 sm:text-sm">
          FuelDesk
        </span>
      </header>

      {/*
        `min-h-0` is what makes the shrinking work at all: without it a flex
        child refuses to go below its content height, the column overflows, and
        the fixed height simply clips the bottom of the form instead of
        tightening the space around it.
      */}
      <main className="flex min-h-0 w-full flex-1 items-center justify-center px-4 py-3 sm:px-6 [@media(min-height:760px)]:py-5 [@media(min-height:900px)]:py-8">
        {children}
      </main>

      {/*
        Hidden on very short viewports rather than allowed to squeeze the card:
        a landscape phone has barely room for the form, and the marketing copy
        is the part that can wait.
      */}
      {showSlider && (
        <footer className="hidden w-full shrink-0 px-5 pb-4 sm:px-8 [@media(min-height:640px)]:block [@media(min-height:760px)]:pb-6 [@media(min-height:900px)]:pb-8">
          <TextSlider centered />
        </footer>
      )}
    </div>
  );
}

/**
 * The card itself, so the three pages cannot drift on corner radius, width or
 * shadow. White on the photograph, with the dark-mode treatment kept.
 *
 * `max-h-full` with an internal scroll is a backstop, not the normal state: at
 * every ordinary window size the card fits whole and nothing scrolls. It exists
 * for the genuinely impossible case — a half-height window, a phone in
 * landscape with an error banner showing — where the alternative is a submit
 * button clipped off the bottom edge with no way to reach it.
 */
export function AuthCard({ children, className = "" }) {
  return (
    <div
      className={`flex max-h-full w-full max-w-[26rem] flex-col overflow-y-auto rounded-2xl border border-white/60 bg-white px-6 py-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] sm:px-7 backdrop-blur-sm dark:border-2 dark:border-white dark:bg-gray-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_60px_-18px_rgba(0,0,0,0.7)] [@media(min-height:760px)]:py-6 [@media(min-height:900px)]:py-7 ${className}`}
    >
      {children}
    </div>
  );
}
