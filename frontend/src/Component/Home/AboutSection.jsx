import React from "react";
import { NavLink } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AboutSection = ({
  heading,
  imageSrc,
  description,
  buttonText,
  logos = [],
  videoSrc,
  eventTitle,
  eventLink,
  resolutionsHeading,
  resolutionsDescription,
  stats = []
}) => {
  return (
    <>
      {/* Introduction Section */}
      <section className="hungar-increase-quality">
        <div className="container section-container">
          <div className="row g-0">
            {/* Left Image */}
            <div className="col-lg-8">
              <h2 className="heading-info">🙏 {heading}</h2>
              <div className="tony-img">
                <img src={imageSrc} alt="Section Visual" />
              </div>
            </div>

            {/* Right Text */}
            <div className="col-lg-4 tony-text mt-3">
              <p>{description}</p>
              <button className="btn btn-dark-pill mt-3">{buttonText}</button>
            </div>
          </div>

          {/* Logos and Video */}
          <div className="row align-items-center mt-0">
            <div className="col-lg-8 text-start featured-logos d-flex align-items-center flex-wrap">
              <span
                className="me-3"
                style={{
                  color: "#716e6e",
                  fontSize: "30px",
                  fontWeight: 600
                }}
              >
                Featured in:
              </span>
              <br />
              {/* {Array.isArray(logos) &&
                logos.map((logo, index) => ( */}
                  <img
                    // key={index}
                    src={`${BASE_URL}${logos}`} 
                    alt={logos.alt || "Logo"}
                    style={logos.style || {}}
                  />
                {/* ))} */}
            </div>

            <div className="col-lg-4 mt-2 mt-lg-0">
              <div className="transform-info-two-div-about"></div>
              <div className="bottom-right-feature">
                <video
                  loop
                  muted
                  playsInline
                  autoPlay
                  src={videoSrc}
                  style={{ height: "245px" }}
                ></video>
                <div className="info d-flex align-items-center justify-content-center">
                  <NavLink
                    to={eventLink}
                    className="btn btn-outline-light btn-sm about-watch"
                  >
                    <i className="fa fa-play"></i> Watch
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resolutions Section */}
      <section className="hungar-increase-quality">
        <div className="container section-container pt-0 pb-0">
          <div className="row align-items-center mt-1">
            {/* Heading */}
            <div className="col-lg-6 text-center text-lg-start">
              <h1 style={{ color: "#000" }}>🔔 {resolutionsHeading}</h1>
            </div>

            {/* Paragraph & Stats */}
            <div className="col-lg-6 mt-4 mt-lg-0">
              <div className="d-flex flex-column justify-content-center h-100">
                <p
                  className="mt-2"
                  style={{ color: "#444", fontSize: "1.1rem" }}
                >
                  {resolutionsDescription}
                </p>
                <ul className="list-unstyled text-dark fw-bold mb-3 ps-0">
                  {Array.isArray(stats) &&
                    stats.map((stat, index) => (
                      <li key={index}>
                        <span style={{ fontSize: "2rem", color: "#246DE3" }}>
                          {stat.value}
                        </span>{" "}
                        {stat.label}
                      </li>
                    ))}
                </ul>
                <NavLink
                  to="#"
                  className="btn btn-dark-pill mt-2 align-self-start"
                >
                  Learn more
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;
