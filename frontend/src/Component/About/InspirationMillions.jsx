import React, { useEffect, useState } from "react";
import axios from "axios"; // Ensure you have axios installed or use fetch()

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const InspirationMillions = () => {
  const [inspiration, setInspiration] = useState(null); // State to store the fetched data

  useEffect(() => {
    // Fetch about introduction data from API
    axios
      .get(`${BASE_URL}/api/selectabout_inspirationmillions`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        // Assuming API returns an array, take the first item
        if (res) {
          setInspiration(res);
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // Loader
  if (!inspiration) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }
//console.log(inspiration);
  return (
    <section className="how-it-works-section">
      {/* Ensure inspiration data exists before rendering */}
      <h2 className="h2-large">{inspiration.heading}</h2>
      <p className="description">{inspiration.description}</p>

      <div className="how-it-works">
        <div className="grid">
          {/* Map over the 'data' array, which is inside the 'inspiration' object */}
        {inspiration.data.map((card, index) => (
              <div key={index} className={`card ${card.corner}`}>
                <div className="icon">{card.icon}</div>
                <div className="label">{card.label}</div>
              </div>
            ))}
            
          
        </div>
      </div>
    </section>
  );
};

export default InspirationMillions;
