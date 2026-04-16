import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VedicGurukulEducation = () => {

const [vedicgurukuleducation, setVedicgurukulEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectvedicgurukul_education`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          setVedicgurukulEducation(res.data);
        } else {
          setError("No valid data found.");
        }
      })
      .catch(() => setError("Error fetching data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-5">Loading...</p>;
  if (error) return <p className="text-center text-danger py-5">{error}</p>;

  const item = vedicgurukuleducation[0]; // ⭐ important fix

  if (!item) return <p>No data available.</p>;



  return (
    <section className="cow-protection">
      <div className="wrapper2 py-5">
        {vedicgurukuleducation.map((data, index) => (
          <div key={index} className="row">
            {/* ✅ Image Grid */}
            <div className="col-md-7 image-grid">
              <div className="row g-3">
                {data.images.map((img, i) => (
                  <div key={i} className="col-6">
                   <img src={`${BASE_URL}/uploads/${img}`} alt={`gurukul-${i}`} className="vedigurukul-img" />

                  </div>
                ))}
              </div>
            </div>

            {/* ✅ Text Content */}
            <div className="col-md-5 cow-protection-content pb-3">
              <h3 className="section-title mb-3 pt-4">{data.title}</h3>

              <div className="content-box mb-3">
                {data.sections.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>

              <div className="alert-box">
                <p>{data.alert}</p>
              </div>

              <div className="cta-box mt-3">
                <p>{data.cta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VedicGurukulEducation;
