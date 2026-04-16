import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const BottomLandingSection = () => {
  const [sectionData, setSectionData] = useState(null);

  useEffect(() => {
    // Fetch bottom landing section data from API
    axios
      .get(`${BASE_URL}/api/selectbottomlandingsection`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        // Assuming API returns an array, take the first item
        if (res.data.length > 0) {
          setSectionData(res.data[0]);
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  if (!sectionData) {
    return (
      <section className="position-relative overflow-hidden" style={{ minHeight: "100vh" }}>
        <div className="d-flex justify-content-center align-items-center text-white" style={{ minHeight: "100vh" }}>
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bottom-landing-page position-relative overflow-hidden"
      style={{ minHeight: "100vh", zIndex: 1 }}
    >
      {/* Background Image */}
      <img
        src={`${BASE_URL}${sectionData.backgroundImage}`}
        alt="Background"
        className="position-absolute top-0 start-0 w-100 h-100 object-cover"
        style={{ objectPosition: "center", color: "transparent" }}
      />

      {/* Gradient Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ background: "linear-gradient(to top, black, transparent)" }}
      ></div>

      {/* Content */}
      <div
  className="position-relative d-flex justify-content-end align-items-center text-white px-3"
  style={{ zIndex: 2, minHeight: "100vh" }}
>
  <div className="container">
    <div
      className="mb-4"
      style={{ maxWidth: "768px", marginLeft: "auto", marginRight: "0", textAlign:"center" }}
    >
      <h2 className="fw-bold display-5">{sectionData.heading}</h2>
      <p className="lead mb-4">{sectionData.subheading}</p>
      <NavLink to="/contactus"
        className="btn btn-light btn-lg rounded-pill px-4 py-2 fw-semibold"
        
      >
        {sectionData.buttonText}
      </NavLink>
    </div>
  </div>
</div>

    </section>
  );
};

export default BottomLandingSection;
