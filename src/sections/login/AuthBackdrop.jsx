import Image from "next/image";

/**
 * The photograph, edge to edge, with the sign-in card floating on top of it.
 *
 * The older layout split the screen: form in a white column on the left, photo
 * in a column on the right. That works on a wide monitor and nowhere else. On a
 * laptop the picture was a narrow strip, and on a phone it was not shown at
 * all, so most people never saw it.
 *
 * Here the photograph is the page. It is fixed rather than absolute, so on a
 * short screen the card can scroll over a backdrop that stays put instead of
 * dragging the image up with it and revealing the page behind.
 *
 * Two overlays rather than one flat wash. White text over a photograph needs
 * the most cover where the text sits and the least where it does not: a single
 * uniform tint either leaves the copy unreadable or muddies the whole picture.
 */
export default function AuthBackdrop() {
  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src="/Gas-station.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />

      {/* Darkest at the foot, where the slider copy sits. */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/95 via-[#0b1220]/55 to-[#0b1220]/40" />
      {/* A gentle overall tint so a bright sky never fights the white card. */}
      <div className="absolute inset-0 bg-[#0b1220]/25" />
    </div>
  );
}
