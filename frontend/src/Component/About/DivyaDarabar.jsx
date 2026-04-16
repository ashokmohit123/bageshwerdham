import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;


const DivyaDarabar = () => {
  const [divyadarabar, setDivyaDarabarData] = useState(null); // State to store API data
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State for any errors that occur during fetching

  // Replace with your API URL
 

  useEffect(() => {
    // Fetch the coaching data from the API
    axios
      .get(`${BASE_URL}/api/selectabout_divyadarabar`, {
        headers: { apikey: "12345" },
      })
      .then((response) => {
        setDivyaDarabarData(Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null);
        //setDivyaDarabarData(response.data); // Set the data into state
        setLoading(false); // Stop loading when the data is fetched
      })
      .catch((err) => {
        setError("Error fetching data"); // Set error message if API call fails
        setLoading(false); // Stop loading in case of error
      });
  }, []);

  // Render loading, error, or the actual data
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
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
               🔱 {divyadarabar.heading}
            </h1>
            <p className="mb-0" style={{ fontSize: "18px", lineHeight: "39px" }}>
               {divyadarabar.introduction}
            </p>
            <p style={{ fontSize: "18px", lineHeight: "39px" }}>
             🔱 {divyadarabar.paragraph1}
            </p>
            <p style={{ fontSize: "18px", lineHeight: "39px" }}>
              🛐 {divyadarabar.paragraph2}
            </p>
              <p style={{ fontSize: "18px", lineHeight: "39px" }}>
              🔱 {divyadarabar.paragraph3}
            </p>

          </div>

          {/* Right: Image */}
          <div className="col-md-5">
            <img
              src={`${BASE_URL}${divyadarabar.imageSrc || "/default-image.jpg"}`}
              alt="Pujya Gurudev"
              className="img-fluid mb-3 about-gurudev"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DivyaDarabar;
