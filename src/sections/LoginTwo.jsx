import React from 'react';
import Image from 'next/image';
import TextSlider from './login/TextSlider';

/**
 * The photographic half of the auth pages — login, reset password, change
 * password all mount this, so it carries the brand look for the whole
 * signed-out experience.
 *
 * Everything except the photograph is absolutely positioned on top of it. The
 * image is the only thing in normal flow, which is what lets it fill the column
 * at any height without the copy pushing it around or being cropped with it.
 */
const LoginTwo = () => {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <Image
        src="/Gas-station.jpg"
        alt="Filling station forecourt at dusk"
        fill
        sizes="(max-width: 1024px) 0px, 55vw"
        className="object-cover object-center"
        priority
      />

      {/*
        A gradient, not a flat wash. White text over a photograph needs the most
        cover where the text sits and the least where it does not — a uniform
        black/30 either left the copy unreadable or muddied the whole picture.
      */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/90 via-[#0b1220]/35 to-transparent" />
      <div className="absolute inset-0 bg-[#0b1220]/15" />

      {/* Wordmark, top-left — the one thing that belongs away from the copy. */}
      <div className="absolute left-8 top-8 z-10 flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)]" />
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">
          FuelDesk
        </span>
      </div>

      {/* The slider: pinned over the photograph, never in flow with it. */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-10">
        <TextSlider />
      </div>
    </div>
  );
};

export default LoginTwo;
