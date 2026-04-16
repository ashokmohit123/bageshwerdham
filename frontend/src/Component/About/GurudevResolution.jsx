import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const GurudevResolution = () => {
  const [aboutGurudevResolution, setAboutGurudevResolution] = useState(null); // State to store API data
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State for any errors that occur during fetching

  useEffect(() => {
    // Fetch the data from the API
    axios
      .get(`${BASE_URL}/api/selectabout_gurudevresolution`, {
        headers: { apikey: "12345" },
      })
      .then((response) => {
        // Ensure that the response data is not empty
        setAboutGurudevResolution(
          Array.isArray(response.data) && response.data.length > 0
            ? response.data[0]
            : null
        );
        setLoading(false); // Stop loading once data is fetched
      })
      .catch((err) => {
        setError("Error fetching data");
        setLoading(false);
      });
  }, []);

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Handle error state
  if (error) {
    return <div>{error}</div>;
  }

  // Ensure that the data is available before rendering
  if (!aboutGurudevResolution) {
    return <div>No data available</div>; // Fallback UI when no data is available
  }

  return (
    <section
      className="py-1 py-md-1"
      style={{ background: "rgba(240, 240, 240, 1)", color: "#111" }}
    >
      <div className="wrapper2">
        <div className="row g-4 g-md-5 align-items-start">
          {/* Left: Heading */}
          <div className="col-md-7">
            <h1 className="mb-3" style={{ fontSize: "40px" }}>
              🙏 {aboutGurudevResolution.heading}
            </h1>
            <p className="mb-0" style={{ fontSize: "18px", lineHeight: "39px" }}>
              {aboutGurudevResolution.introduction}
            </p>
            <p style={{ fontSize: "18px", lineHeight: "39px" }}>
              🔱 {aboutGurudevResolution.paragraph1}
            </p>
          </div>

          {/* Right: Image */}
          <div className="col-md-5">
            <img
              src={`${BASE_URL}${aboutGurudevResolution.imageSrc || "/default-image.jpg"}`}
              alt={aboutGurudevResolution.imageAlt || "Pujya Gurudev"}
              className="img-fluid mb-3 about-gurudev"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GurudevResolution;
