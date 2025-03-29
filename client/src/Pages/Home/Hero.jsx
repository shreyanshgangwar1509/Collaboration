import Section from "../../components/uicomponents/Section.jsx";
import { useRef } from "react";
import curve from "../../assets/curve.png";
import heroBanner from "../../assets/heroBanner.png";
import heroBackground from "../../assets/heroBackground.png";
import { BackgroundCircles, Gradient } from "./HeroDesign.jsx";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const parallaxRef = useRef(null);
  const navigate = useNavigate();
  return (
    <Section
      className="pt-[12rem] -mt-[5.25rem]"
      crosses
      crossesOffset="lg:translate-y-[5.25rem]"
      customPaddings
      id="hero"
    >
      <div className="container relative" ref={parallaxRef}>
        <div className="relative z-1 max-w-[62rem] mx-auto text-center mb-[3.875rem] md:mb-20 lg:mb-[6.25rem]">
          <h1 className="h1 mb-6">
            Lets Collaborate with People in
            <span className="inline-block relative">
              Real Time{" "}
              <img
                src={curve}
                className="absolute top-full left-0 w-full xl:-mt-2"
                width={624}
                height={28}
                alt="Curve"
              />
            </span>
          </h1>
          <p className="body-1  max-w-3xl mx-auto mb-6 text-n-2 lg:mb-8">
            Unleash the power of collaborating with people in real time with AI.
            Upgrade your productivity with collaboration.
          </p>
          <button onClick={() => navigate("/get-started")} className="bg-white text-black px-6 py-3 rounded-lg hover:text-purple-700">
            Get Started
          </button>
        </div>
        <div className="relative max-w-[23rem] mx-auto md:max-w-5xl xl:mb-24">
          <div className="relative z-1 p-0.5 rounded-2xl bg-conic-gradient">
            <div className="relative bg-n-8 rounded-[1rem]">
              <div className="h-[1.4rem] bg-n-10 rounded-t-[0.9rem]" />
              <div className="aspect-[33/40] rounded-b-[0.9rem] overflow-hidden md:aspect-[688/490] lg:aspect-[1024/490]">
                <img
                  src={heroBanner}
                  className="w-full h-full object-cover"
                  alt="banner"
                />
              </div>
            </div>
            <Gradient />
          </div>

          <div className="absolute -top-[54%] left-1/2 w-[234%] -translate-x-1/2 md:-top-[46%] md:w-[138%] lg:-top-[104%]">
            <img
              src={heroBackground}
              className="w-full"
              width={1440}
              height={1800}
              alt="hero"
            />
          </div>
          <BackgroundCircles />
        </div>
      </div>
    </Section>
  );
};

export default Hero;