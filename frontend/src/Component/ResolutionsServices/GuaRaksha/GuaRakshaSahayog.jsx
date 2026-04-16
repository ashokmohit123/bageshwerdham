import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const GuaRakshaSahayog = () => {
  const [sahayogData, setSahayogData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectgauraksha_sahayog`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        console.log("✅ API Data:", res.data);
        // ✅ API returns an array — pick the first item
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSahayogData(res.data[0]);
        } else {
          setError("No data found");
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to fetch data");
      });
  }, []);

  if (error) {
    return <p className="text-center text-danger py-5">Error: {error}</p>;
  }

  if (!sahayogData) {
    return <p className="text-center py-5">Loading...</p>;
  }

  return (
    <section className="gou-sahayog-section">
      <div className="wrapper2 pt-3">
        <div className="gau-card text-center">
          <h2>
            {sahayogData.titleEmojiStart}{" "}
            <span>{sahayogData.titleText}</span>{" "}
            {sahayogData.titleEmojiEnd}
          </h2>

          <p className="mt-4">{sahayogData.line1}</p>
          <p className="mt-4">{sahayogData.line2}</p>
          <p className="mt-4">{sahayogData.line3}</p>

          <p className="quote">{sahayogData.quote}</p>
          <p className="highlight mt-3">{sahayogData.highlight}</p>

          <div className="mt-4">
            <NavLink to={sahayogData.buttonLink} className="btn btn-gau">
              {sahayogData.buttonText}
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuaRakshaSahayog;
