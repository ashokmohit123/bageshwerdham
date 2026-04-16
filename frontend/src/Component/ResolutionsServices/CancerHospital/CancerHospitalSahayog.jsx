import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL; // ✅ e.g., http://localhost/api

const CancerHospitalSahayog = () => {
  const [sahayogData, setSahayogData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSahayogData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/selectcancerhospital_sahayog`, {
          headers: { apikey: "12345" },
        });
        setSahayogData(res.data[0]);
      } catch (err) {
        console.error("❌ Error fetching Sahayog data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSahayogData();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (!sahayogData) {
    return <div className="text-center py-5">No data found.</div>;
  }

  // ✅ Collect points dynamically
  const points = Object.keys(sahayogData)
    .filter((key) => key.startsWith("point"))
    .map((key) => sahayogData[key]);

  return (
   <section className="cancer-hospital-sahayog" style={{ padding: "40px 0" }}>
      <div className="wrapper2 section pt-0">
      <div className="card-container text-center">
        <h2 className="section-title" style={{ fontSize: "28px", fontWeight: "bold" }}>
          {sahayogData.title}
        </h2>

        <p className="mt-3">
          {sahayogData.description}
        </p>

        <div className="row mt-4 text-start justify-content-center">
          {points.map((point, index) => (
            <div key={index} className="col-md-6 mb-3">
              <div
                className="highlight-card"
                style={{
                  background: "rgb(227 246 255);",
                  borderRadius: "12px",
                 
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                {point}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <NavLink
            to={sahayogData.buttonLink}
            className="support-btn"
           
          >
            {sahayogData.buttonText}
          </NavLink>
        </div>

        <div className="footer-note mt-4" style={{ fontStyle: "italic", color: "#444" }}>
          {sahayogData.footerNote}
        </div>
      </div>
      </div>
    </section>
  );
};

export default CancerHospitalSahayog;
