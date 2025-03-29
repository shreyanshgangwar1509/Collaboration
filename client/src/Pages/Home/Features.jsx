import Section from "../../components/uicomponents/Section.jsx";
import { features } from "../../constants/constants.js";
import ClipPath from "../../assets/ClipPath.jsx";
import { useNavigate } from "react-router-dom";

const Features = () => {
    const navigate = useNavigate();
    return (
      <Section id="features" crosses>
        <div className="container relative z-2">
          <h1 className="h2 mb-4 md:mb-8 text-center">
            Edit Together, Anytime, Anywhere
          </h1>
  
          <div className="flex flex-wrap gap-10 mb-10">
            {features.map((item) => (
              <div
                onClick={() => navigate(features.path)}
                className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%] md:max-w-[24rem]"
                style={{
                  backgroundImage: `url(${item.backgroundUrl})`,
                }}
                key={item.id}
              >
                <div className="relative z-2 flex flex-col min-h-[22rem] p-[2.4rem] pointer-events-none">
                  <h5 className="h5 mb-5">{item.title}</h5>
                  <p className="body-2 mb-6 text-n-3">{item.text}</p>
                  <div className="flex items-center mt-auto">
                    <p className="ml-auto font-code text-xs font-bold text-n-1 uppercase tracking-wider">
                      Explore more &gt;
                    </p>
                  </div>
                </div>
                {item.light && (
                  <div className="absolute top-0 left-1/4 w-full aspect-square bg-radial-gradient from-[#28206C] to-[#28206C]/0 to-70% pointer-events-none" />
                )}
                <div
                  className="absolute inset-0.5 bg-n-8"
                  style={{ clipPath: "url(#benefits)" }}
                >
                  <div className="absolute inset-0 opacity-0 transition-opacity hover:opacity-15">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        width={380}
                        height={362}
                        alt={item.title}
                        className="w-full h-full object-cover   "
                      />
                    )}
                  </div>
                </div>
                <ClipPath />
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  };
  
  export default Features;
