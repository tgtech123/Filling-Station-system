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
 * Laid out as a flex column rather than with the card absolutely centred.
 * Absolute centring looks right on a tall screen and traps the bottom of the
 * form off-screen on a short one, which is the one thing a sign-in page must
 * never do. In flow, the card takes the height it needs, the slider follows
 * beneath it, and a cramped screen simply scrolls.
 */
export default function AuthShell({ children, showSlider = true }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <AuthBackdrop />

      {/* Wordmark, clear of the card. */}
      <header className="flex items-center gap-2.5 px-5 pt-6 sm:px-8 sm:pt-8">
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90 sm:text-sm">
          FuelDesk
        </span>
      </header>

      <main className="flex w-full flex-1 items-center justify-center px-4 py-8 sm:px-6">
        {children}
      </main>

      {/*
        Hidden on very short viewports rather than allowed to squeeze the card:
        a landscape phone has barely room for the form, and the marketing copy
        is the part that can wait. Keyed to viewport HEIGHT, not width, because
        a landscape phone is wide and short.
      */}
      {showSlider && (
        <footer className="hidden w-full px-5 pb-8 sm:px-8 [@media(min-height:640px)]:block">
          <TextSlider centered />
        </footer>
      )}
    </div>
  );
}

/**
 * The card itself, so the three pages cannot drift on corner radius, width or
 * shadow. White on the photograph, with the dark-mode treatment kept.
 */
export function AuthCard({ children, className = "" }) {
  return (
    <div
      className={`flex w-full max-w-[23rem] flex-col rounded-2xl border border-white/60 bg-white px-6 py-7 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur-sm dark:border-2 dark:border-white dark:bg-gray-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_60px_-18px_rgba(0,0,0,0.7)] ${className}`}
    >
      {children}
    </div>
  );
}
