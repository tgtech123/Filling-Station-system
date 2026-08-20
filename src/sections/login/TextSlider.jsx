import { useState, useEffect } from 'react';

const TextSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Lead Operations. Control Prices. Empower Your Team.",
      description: "Oversee users, manage inventory, set fuel prices, and access full reports. You're in charge of making sure the station runs smoothly, transparently, and profitably."
    },
    {
      id: 2,
      title: "Monitor, Approve, and Maintain Operational Integrity.",
      description: "Stay on top of fuel dispensing activities, approve shift closures, compare dip readings, and ensure every pump runs efficiently — your eyes are everywhere."
    },
    {
      id: 3,
      title: "Stay Accountable.",
      description: "Audit daily fuel and lubricant sales, verify financial records, and generate tax-ready reports with ease and transparency."
    },
    {
      id: 4,
      title: "Monitor Performance. Maximize Revenue. Scale Success.",
      description: "Track key metrics, analyze customer trends, and make data-driven decisions. Build a sustainable business that grows with your ambitions and market demands."
    },
    {
      id: 5,
      title: "Scale Your Operations Seamlessly.",
      description: "Expand your business with confidence using integrated tools, automated workflows, and comprehensive analytics that support growth at every stage."
    },
    {
      id: 6,
      title: "Stay Accountable and Transparent.",
      description: "Maintain complete visibility across all operations with detailed audit trails, compliance reporting, and real-time monitoring capabilities."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => setCurrentSlide(index);

  return (
    /*
     * Left-aligned rather than centred: it sits in the bottom corner of a
     * photograph now, where centred copy reads as a caption floating in the
     * middle of nothing. A fixed min-height stops the picture jumping every
     * three seconds as a two-line title gives way to a one-line one.
     */
    <div className="mx-auto w-full max-w-xl">
      <div className="min-h-[7.5rem]">
        <div key={currentSlide} className="animate-fadeIn">
          <h2 className="text-[1.35rem] font-bold leading-snug text-white drop-shadow-sm">
            {slides[currentSlide].title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            {slides[currentSlide].description}
          </p>
        </div>
      </div>

      {/* Indicators */}
      <div className="mt-5 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-yellow-400'
                : 'w-4 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TextSlider;
