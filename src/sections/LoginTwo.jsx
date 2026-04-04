import React from 'react';
import Image from 'next/image';
import TextSlider from './login/TextSlider';

const LoginTwo = () => {
  return (
    <div className="h-screen w-full overflow-hidden relative">
      {/* Background Image */}
      <div className="relative h-full w-[720px]">
        <Image
          src="/Onboarding.png"
          alt="Onboarding"
          fill
          className="object-cover"
          priority
        />

      <div className="absolute bottom-0 w-full px-4">
        <TextSlider />
      </div>
      </div>

      {/* TextSlider Positioned at Bottom */}
    </div>
  );
};

export default LoginTwo;
