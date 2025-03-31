

import React from "react";
import Footer from "../../layout/Footer";
import Header from "../../layout/Header";
import AiSection from "./AiSection.jsx";
import Bottom from "./Bottom.jsx";
import Features from "./Features.jsx";
import Hero from "./Hero.jsx";

const Home = () => {
  return (
    <>
      <Header />
      <Hero />
      <Features/>
      <AiSection/>
      <Bottom />
      <Footer />
    </>
  );
}

export default Home;
