"use client";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import img1 from "../../assets/images/banner1.jpg";
import img2 from "../../assets/images/banner2.jpg";
import img3 from "../../assets/images/banner3.jpg";

const Banner = () => {
  const slides = [
    { img: img1 },
    { img: img2 },
    { img: img3 },
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
          <div key={index} className="w-full h-[40vh] relative">
            <Image
              src={slide.img}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover rounded-md"
            />
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default Banner;