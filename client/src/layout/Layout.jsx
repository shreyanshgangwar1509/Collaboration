import React from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Global Navbar */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

