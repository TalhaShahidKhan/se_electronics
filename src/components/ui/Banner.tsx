"use client";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const Banner = () => {
  const slides = [
    {
      img: "https://images.pexels.com/photos/5912616/pexels-photo-5912616.jpeg",
    },
    {
      img: "https://images.pexels.com/photos/4427225/pexels-photo-4427225.jpeg",
    },
    {
      img: "https://images.pexels.com/photos/5912616/pexels-photo-5912616.jpeg",
    },
  ];

  return (
    <section className="relative rounded-sm">
      <Carousel
        infiniteLoop
        autoPlay
        interval={5000}
        transitionTime={500}
        showStatus={false}
        showThumbs={false}
        swipeable
        emulateTouch
        showArrows={false}
        stopOnHover
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full h-[40vh]">
            <img
              src={slide.img}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default Banner;
