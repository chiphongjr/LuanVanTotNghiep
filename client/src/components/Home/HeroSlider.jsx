import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Laptop Gaming Hiệu Năng Cao",
      description:
        "Laptop mạnh mẽ với đèn nền RGB, thiết kế bắt mắt cho game và làm việc",
      image:
        "https://easy-peasy.ai/cdn-cgi/image/quality%3D95%2Cformat%3Dauto%2Cwidth%3D800/https%3A//media.easy-peasy.ai/27feb2bb-aeb4-4a83-9fb6-8f3f2a15885e/fc73a858-6a63-4774-9516-d3ff16dd3d00.png",
    },
    {
      id: 2,
      title: "Tai Nghe Không Dây Sắc Màu",
      description:
        "Tai nghe Bluetooth nhiều màu sắc, âm thanh sống động, phong cách thời thượng",
      image:
        "https://img.pikbest.com/wp/202347/close-up-photo-background-view-of-headphones-in-neon-light-against-black-3d-illustration_9756660.jpg%21w700wp",
    },
    
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const slide = slides[currentSlide];

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-2xl">
      {/* Slide */}
      <div className="relative h-full">
        <div
          className="absolute inset-0 bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
              {slide.title}
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              {slide.description}
            </p>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="hidden sm:block absolute left-6 top-1/2 transform -translate-y-1/2 p-3 glass-card hover:glow-on-hover animate-smooth"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden sm:block absolute right-6 top-1/2 transform -translate-y-1/2 p-3 glass-card hover:glow-on-hover animate-smooth"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === currentSlide ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
