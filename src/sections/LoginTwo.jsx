import React from 'react';
import Image from 'next/image';
import TextSlider from './login/TextSlider';

const LoginTwo = () => {
  return (
    <div className="h-screen w-full overflow-hidden relative">
      {/* Background Image */}
      <div className="h-full w-[720px]">
        <Image
          src="/Onboarding.png"
          alt="Onboarding"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* TextSlider Positioned at Bottom */}
      <div className="absolute bottom-[-88px] w-full px-4">
        <TextSlider />
      </div>
    </div>
  );
};

export default LoginTwo;
