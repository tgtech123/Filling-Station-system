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
    <div className="bg-transparent min-h-[400px]  relative overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto text-center">
        {/* Slide Content */}
        <div className="text-white min-h-[200px] flex items-center justify-center mb-1">
          <div key={currentSlide} className="animate-fadeIn px-2">
            <h1 className="text-xl font-bold mb-2">{slides[currentSlide].title}</h1>
            <p className="text-sm text-blue-100">{slides[currentSlide].description}</p>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex gap-2 justify-center mb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-yellow-400 w-10'
                  : 'bg-white bg-opacity-30 w-5 hover:bg-opacity-50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Mobile hint removed (non-responsive version) */}
      </div>
    </div>
  );
};

export default TextSlider;
