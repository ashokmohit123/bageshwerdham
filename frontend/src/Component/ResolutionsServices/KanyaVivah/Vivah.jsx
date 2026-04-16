import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Vivah = () => {
  const [vivahdates, setVivahData] = useState([]); // Always initialize as an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from API
    axios
      .get(`${BASE_URL}/api/selectkanyavivah_dates`, {
        headers: { apikey: "12345" }, // Replace with your actual API key
      })
      .then((res) => {
        // Log the raw response to inspect the structure
        console.log("API Response:", res.data);
  
        // Check if the response has the expected structure and data
        if (res && res.data && Array.isArray(res.data)) {
          setVivahData(res.data); // Set the full array of data
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

  return (
    <section className="kanya-vivah-section-info">
      <div className="wrapper2 pt-0">
        <div className="timeline-container">
          <h1 className="timeline-title">
            💖 A Journey of Compassion: Highlights of Mass Marriages Over the Years
          </h1>
          <div className="timeline">
            {vivahdates.length > 0 ? (
              vivahdates.map((item, index) => (
                <div
                  className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
                  key={index}
                >
                  <div className="timeline-content">
                    <h3 className="year">{item.year}</h3>
                    <img src={`${BASE_URL}${item.img}`} alt={item.title} className="timeline-img" />
                    <h2 className="title">👰 {item.title}</h2>
                    {/* Safeguard for desc to ensure it's an array */}
                    <ul className="desc">
                      {Array.isArray(item.desc) ? (
                        // If desc is an array, map over it
                        item.desc.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))
                      ) : (
                        // If desc is not an array, render it as a single item
                        <li>{item.desc}</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted">No data available</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vivah;
