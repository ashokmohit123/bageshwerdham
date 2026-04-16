import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL; 

const KanyaVivahSahyog = () => {
  // State variables
  const [supportInfo, setSupportInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state

  // Fetch data from API
  useEffect(() => {
    // Fetch data from API
    axios
      .get(`${BASE_URL}/api/selectkanyavivah_support`, {
        headers: { apikey: "12345" }, // Replace with your actual API key
      })
      .then((res) => {
        // Log the raw response to inspect the structure
        console.log("API Response:", res.data);
  
        // Check if the response has the expected structure and data
        if (res && res.data && Array.isArray(res.data)) {
          setSupportInfo(res.data[0]); // Set the first item of the array
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
  // ✅ Render only when supportInfo exists
  return (
    <section className="kanya-vivah-sahyog">
      <div className="wrapper2 pt-0">
        <div className="support-container">
          <div className="support-card">
            <h2 className="support-title">
              🌸 {supportInfo.title} 👰
            </h2>
            <p className="support-text">{supportInfo.description} 🙏</p>
            <p className="support-text">💖 {supportInfo.additional_info}</p>
            <p className="support-text mb-5">🤝 {supportInfo.closing_note} ❤️</p>

            {supportInfo.button_link && (
              <NavLink to={supportInfo.button_link} className="support-btn">
                🙏 {supportInfo.button_text}
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KanyaVivahSahyog;
