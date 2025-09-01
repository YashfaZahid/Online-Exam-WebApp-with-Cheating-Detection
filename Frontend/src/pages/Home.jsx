import Button from "../components/button";
import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const goToLogin = () => {
    navigate("/Login");
  };
  return (
    <>
      <div className="container">
        
          <img src="/logo.png" alt="Logo"/>
          <h2>Welcome to</h2>
          <h1 id="home-logo-name">Proctor Eye</h1>
          <p id="home-tagline-name">Exams Made Smarter.</p>
          <Button txt={"Get Started"} myFucntion={goToLogin}/>
        </div>
    </>
  );
}

export default Home;
