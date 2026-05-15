import React from 'react';
import Image from 'next/image';
import TextSlider from './login/TextSlider';

const LoginTwo = () => {
  return (
    <div className="h-full w-full overflow-hidden relative">
      {/* Background Image */}
      <div className="relative h-full w-full">
        <Image
          src="/Onboarding.png"
          alt="Onboarding"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Slider pinned to bottom */}
        <div className="absolute bottom-6 left-0 w-full px-4 z-10">
          <TextSlider />
        </div>
      </div>
    </div>
  );
};

export default LoginTwo;
