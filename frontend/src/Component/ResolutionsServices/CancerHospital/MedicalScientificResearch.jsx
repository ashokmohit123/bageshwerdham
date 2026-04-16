import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MedicalScientificResearch = () => {
  const [researchData, setResearchData] = useState([]); // ✅ start as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectcancerhospital_researchdata`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          // ✅ Store the full array, not just the first item
          setResearchData(res.data);
        } else {
          setError("No valid data found in the response.");
        }
      })
      .catch((err) => {
        console.error("Error fetching section data:", err);
        setError("Error fetching data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Loading and error states
  if (loading) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-danger py-5">{error}</p>;
  }

  // ✅ Defensive check
  if (!Array.isArray(researchData) || researchData.length === 0) {
    return <p className="text-center text-muted py-5">No research data available.</p>;
  }

  return (
    <section className="kanya-vivah-purpose">
      <div className="wrapper2 py-5">
        {researchData.map((item) => (
          <div key={item.id} className="row g-4 align-items-start">
            {/* Left Side Video */}
            <div className="col-lg-6">
              <div className="ratio ratio-16x9 rounded overflow-hidden shadow-sm">
                <iframe
                  src={item.video_url}
                  title={item.title}
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Right Side Content */}
            <div className="col-lg-6">
              <div className="highlight-box">
                <h2 className="section-title mb-4">🏥 {item.title}</h2>
                <h4 className="text-primary">🌟 {item.subtitle}</h4>

                {/* ✅ Handle paragraphs safely */}
                {Array.isArray(item.paragraphs) ? (
                  item.paragraphs.map((para, index) => (
                    <p key={index} className={index === 0 ? "mt-4" : "mt-5"}>
                     🔱 {para}
                    </p>
                  ))
                ) : (
                  <p className="mt-4 text-muted">No paragraph content available.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MedicalScientificResearch;
