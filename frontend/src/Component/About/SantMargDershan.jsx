import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SantMargDershan = () => {
  const [santMargDershanData, setSantMargDershanData] = useState(null); // State to store API data
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State for any errors that occur during fetching

  useEffect(() => {
    // Fetch the coaching data from the API
    axios
      .get(`${BASE_URL}/api/selectabout_saintsdarshan`, {
        headers: { apikey: "12345" },
      })
      .then((response) => {
        setSantMargDershanData(
          Array.isArray(response.data) && response.data.length > 0
            ? response.data[0]
            : null
        );
        setLoading(false); // Stop loading when the data is fetched
      })
      .catch((err) => {
        setError("Error fetching data"); // Set error message if API call fails
        setLoading(false); // Stop loading in case of error
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

  // If santMargDershanData is null, render a fallback UI
  if (!santMargDershanData) {
    return <div>No data available</div>;
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
              🧘‍♂️ {santMargDershanData.heading}
            </h1>
            <p className="mb-0" style={{ fontSize: "18px", lineHeight: "39px" }}>
              {santMargDershanData.introduction}
            </p>
            <p style={{ fontSize: "18px", lineHeight: "39px" }}>
              🪔 {santMargDershanData.paragraph1}
            </p>
            <p style={{ fontSize: "18px", lineHeight: "39px" }}>
              🪔 {santMargDershanData.paragraph2}
            </p>
          </div>

          {/* Right: Image */}
          <div className="col-md-5">
            <img
              src={`${BASE_URL}${santMargDershanData.imageSrc || "/default-image.jpg"}`}
              alt="Pujya Gurudev"
              className="img-fluid mb-3 about-gurudev"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SantMargDershan;
