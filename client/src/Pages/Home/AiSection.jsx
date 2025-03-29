import React from "react";
import Section from "../../components/uicomponents/Section";
import check from "../../assets/check.svg";
import AI from "../../assets/AI.png";

const AiSection = () => {
  return (
    <Section id="how-to-use" crosses>
      <div className="container">
        <h2 className="h2 mb-4 md:mb-8">
          AI-Powered <br />
          Collaboration Automation
        </h2>

        <div className="relative">
          <div className="relative z-1 flex items-center h-[39rem] mb-5 p-8 border border-n-1/10 rounded-3xl overflow-hidden lg:p-20 xl:h-[46rem]">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none md:w-3/5 xl:w-auto">
              <img
                className="w-full h-full object-cover md:object-right"
                width={800}
                alt="Smartest AI"
                height={730}
                src={AI}
              />
            </div>

            <div className="relative z-1 max-w-[17rem] ml-auto">
              <h4 className="h4 mb-4">Smartest AI</h4>
              <p className="body-2 mb-[3rem] text-n-3">
                Unlocks the potential of AI-powered Collaboration
              </p>
              <ul className="max-w-[22rem] mb-10 md:mb-14">
                <li className="mb-3 py-3">
                  <div className="flex items-center">
                    <img src={check} width={24} height={24} alt="check" />
                    <h6 className="body-2 ml-5">
                      Automatically check grammar and provide suggestions.
                    </h6>
                  </div>
                </li>
                <li className="mb-3 py-3">
                  <div className="flex items-center">
                    <img src={check} width={24} height={24} alt="check" />
                    <h6 className="body-2 ml-5">
                      Enhance collaboration and Smart Automation.
                    </h6>
                  </div>
                </li>
                <li className="mb-3 py-3">
                  <div className="flex items-center">
                    <img src={check} width={24} height={24} alt="check" />
                    <h6 className="body-2 ml-5">
                      Automate repetitive tasks and improve workflow efficiency
                      during teamwork.
                    </h6>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default AiSection;
