import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MarqueeStrip = () => {
  const [marquee, setMarquee] = useState(null);

  useEffect(() => {
    // Fetch about introduction data from API
    axios
      .get(`${BASE_URL}/api/selectabout_marqueestrip`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        console.log("API Response:", res.data);  // Log the response to verify data
        // Assuming API returns an array, take the first item
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMarquee(res.data);  // Set the entire array, not just the first item
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // Loader
  if (!marquee) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }

  // Verify marquee data
 // console.log("Marquee data in state:", marquee);  // Log state

  // Ensure marquee is iterable before spreading
  const marqueeItems = Array.isArray(marquee) ? [...marquee, ...marquee] : [];

  return (
    <section className="marquee-strip">
      <div className="marquee-container">
        <div className="marquee-track">
          {marqueeItems.map((it, i) => (
            <div
              key={i}
              className="marquee-item"
              style={{ width: it.w, height: it.h }}
            >
              <img
                src={`${BASE_URL}${it.img}`}
                alt={it.alt}
                className="w-100 h-100"
                style={{ objectFit: "cover" }}
              />
              <div className="overlay" />
              <p className="marquee-text">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarqueeStrip;
