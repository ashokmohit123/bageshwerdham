import React from 'react';
import { NavLink } from "react-router-dom";

const LiveKathaSection = ({ videoSrc, title, description, buttonText}) => {


  return (
   <>
    <section>
      <div className="hero-section">
        {/* Background Video */}
        <video className="hero-video" autoPlay muted loop playsInline>
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Content */}
        <div className="hero-content">
          <h1 dangerouslySetInnerHTML={{ __html: title }} />
          <p>{description}</p>
          <NavLink to="/about" className="kathastartbtn btn btn-start">
            {buttonText}
          </NavLink>
        </div>
      </div>
    </section>
   </>
  )
}

export default LiveKathaSection
