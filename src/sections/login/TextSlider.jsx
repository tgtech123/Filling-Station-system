import { useState, useEffect } from 'react';

const TextSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Your slide data - customize these texts
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

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="bg-transparent min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[600px] p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 relative overflow-hidden flex items-center justify-center">
      
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto relative z-10 flex flex-col items-center justify-center text-center">
        
        {/* Text Content with Animation */}
        <div className="text-white min-h-[180px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[250px] flex items-center justify-center mb-2 sm:mb-2">
          <div 
            key={currentSlide}
            className="animate-fadeIn px-2 sm:px-4"
          >
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-3xl font-bold  mb-4 sm:mb-6 text-center">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-blue-100 max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto text-center">
              {slides[currentSlide].description}
            </p>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 justify-center px-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-yellow-400 w-8 sm:w-10 lg:w-12' 
                  : 'bg-white bg-opacity-30 w-4 sm:w-5 lg:w-6 hover:bg-opacity-50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        
        {/* Touch/Swipe indicators for mobile */}
        <div className="sm:hidden mt-4">
          <p className="text-white text-opacity-60 text-xs text-center">
            Tap indicators to navigate
          </p>
        </div>
      </div>

      
    </div>
  );
};

export default TextSlider;