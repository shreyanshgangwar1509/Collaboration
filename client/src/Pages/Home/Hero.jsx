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
      className="pt-[10rem] pb-[4rem] lg:pt-[12rem] lg:pb-[8rem] overflow-hidden"
      crosses
      customPaddings
      id="hero"
    >
      <div className="container relative z-10" ref={parallaxRef}>
        <div className="relative z-1 max-w-[62rem] mx-auto text-center mb-[4rem] md:mb-20 lg:mb-[6rem]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            Seamless Collaboration
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 animate-slide-up">
            Collaborate Without 
            <span className="block mt-2">
              <span className="gradient-text relative">
                Boundaries{" "}
                <img
                  src={curve}
                  className="absolute top-full left-0 w-full opacity-60"
                  width={624}
                  height={28}
                  alt="Curve"
                />
              </span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            The ultimate all-in-one workspace for teams. Write code, draw ideas, 
            build presentations, and chat in real-time — all in one powerful platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={() => navigate("/login")} 
              className="btn-primary text-base px-10 py-4 rounded-xl hover:scale-105 transition-all shadow-lg shadow-violet-500/20"
            >
              Get Started for Free
            </button>
            <button 
              onClick={() => {
                const features = document.getElementById('features');
                features?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-secondary text-base px-10 py-4 rounded-xl hover:bg-white/5 transition-all"
            >
              Explore Features
            </button>
          </div>
        </div>

        {/* Visual Asset Section */}
        <div className="relative max-w-[90%] mx-auto md:max-w-5xl group">
          <div className="relative z-1 p-1 rounded-2xl bg-gradient-to-br from-violet-600/50 via-indigo-600/50 to-cyan-600/50 backdrop-blur-sm shadow-2xl">
            <div className="relative bg-[#0b0b14] rounded-xl overflow-hidden border border-white/5">
              <div className="h-10 bg-white/5 flex items-center px-4 gap-2 border-bottom border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <div className="mx-auto text-[10px] text-white/20 font-mono tracking-widest uppercase">CollabSpace Workspace</div>
              </div>
              <div className="aspect-[16/10] md:aspect-[1024/540] overflow-hidden">
                <img
                  src={heroBanner}
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                  alt="CollabSpace Interface"
                />
              </div>
            </div>
            <Gradient />
          </div>

          {/* Glowing background orbs */}
          <div className="absolute -top-[50%] left-1/2 w-[180%] -translate-x-1/2 -z-10 opacity-40 pointer-events-none">
            <img
              src={heroBackground}
              className="w-full mix-blend-screen"
              width={1440}
              height={1800}
              alt=""
            />
          </div>
          <BackgroundCircles />
        </div>
      </div>
    </Section>
  );
};

export default Hero;