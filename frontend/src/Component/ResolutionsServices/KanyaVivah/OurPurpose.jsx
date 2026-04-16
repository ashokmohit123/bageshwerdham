import React, { useState, useEffect } from "react";
import axios from "axios"; // Make sure axios is installed

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const OurPurpose = () => {
  const [ourpurpose, setOurPurpose] = useState(null); // To store the fetched data
  const [loading, setLoading] = useState(true); // To manage loading state
  const [error, setError] = useState(null); // To store any errors

  useEffect(() => {
    // Fetch data from API
    axios
      .get(`${BASE_URL}/api/selectkanyavivah_ourpurpose`, {
        headers: { apikey: "12345" }, // Replace with your actual API key
      })
      .then((res) => {
        // Log the raw response to inspect the structure
       // console.log("API Response:", JSON.stringify(res.data, null, 2));

        // Check if the data is an array and take the first item
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          setOurPurpose(res.data[0]); // Access the first object in the array
          setLoading(false); // Set loading to false after data is fetched
        } else {
          setError("No valid data found in the response.");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching section data:", err);
        setError("Error fetching data. Please try again later.");
        setLoading(false); // Set loading to false on error
      });
  }, []); // Empty dependency array ensures this runs only once

  // Show a loading message while data is being fetched
  if (loading) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }

  // Show an error message if data fetch failed
  if (error) {
    return <p className="text-center text-danger py-5">{error}</p>;
  }

  // Render the component with fetched data
  return (
    <section className="kanya-vivah-purpose">
      <div className="wrapper2 py-5">
        <div className="row g-4 align-items-start">
          {/* Left Side Video Section */}
          <div className="col-lg-6">
            <div className="ratio ratio-16x9 rounded overflow-hidden shadow-sm">
              <iframe src={ourpurpose.videoUrl} title="YouTube video" allowFullScreen></iframe>

            </div>

            {/* Info Card */}
            <div className="info-card mt-3">
              <p>🌼 {ourpurpose.infoText}</p> {/* Assuming 'infoText' is the correct field */}
            </div>
          </div>

          {/* Right Side Content */}
          <div className="col-lg-6">
            <h2 className="section-title mb-4">👰 {ourpurpose.title}</h2> {/* Assuming 'title' is correct */}

            <div className="highlight-box">
              <h4 className="text-primary">🎯 {ourpurpose.purposeTitle}</h4> {/* Assuming 'purposeTitle' is correct */}
              <p className="mb-0">{ourpurpose.purposeText}</p> {/* Assuming 'purposeText' is correct */}
            </div>

            <div className="highlight-box mt-3">
              <h3 className="text-primary">🛤️ {ourpurpose.journeyTitle}</h3> {/* Assuming 'journeyTitle' is correct */}
              <p className="mb-0">{ourpurpose.journeyText}</p> {/* Assuming 'journeyText' is correct */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurPurpose;
