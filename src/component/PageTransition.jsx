import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import './Style/PageTransition.css';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fade-in");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fade-out");
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === "fade-out") {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fade-in");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, location]);

  return (
    <div key={displayLocation.pathname} className={`page-transition ${transitionStage}`}>
      {children}
    </div>
  );
};

export default PageTransition;
