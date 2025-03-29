import Section from "../../components/uicomponents/Section.jsx";
import sphere from "../../assets/sphere.png";
import stars from "../../assets/stars.svg";

const Bottom = () => {
  return (
    <Section className="overflow-hidden" id="pricing">
      <div className="container relative z-2">
        <div className="hidden relative justify-center mb-[6.5rem] lg:flex">
          <img
            src={sphere}
            className="relative z-1"
            width={255}
            height={255}
            alt="Sphere"
          />
          <div className="absolute top-1/2 left-1/2 w-[60rem] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <img
              src={stars}
              className="w-full"
              width={950}
              height={400}
              alt="Stars"
            />
          </div>
        </div>
        <h6 className="p-2 text-center text-white text-opacity-50 transition-all duration-300 lg:leading-5 hover:text-opacity-100 hover:shadow-[0_0_10px_rgba(255,255,255,0.8)]">
          Let's create a WORLD together!!
        </h6>
      </div>
    </Section>
  );
};

export default Bottom;
