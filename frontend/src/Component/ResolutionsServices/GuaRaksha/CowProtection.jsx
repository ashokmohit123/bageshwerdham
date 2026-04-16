import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CowProtection = () => {
  const [cowProtectionData, setCowProtectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectguaraksha_cowprotection`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          setCowProtectionData(res.data);
        } else {
          setError("No valid data found.");
        }
      })
      .catch(() => setError("Error fetching data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-5">Loading...</p>;
  if (error) return <p className="text-center text-danger py-5">{error}</p>;

  const item = cowProtectionData[0]; // ⭐ important fix

  if (!item) return <p>No data available.</p>;

  return (
    <section className="cow-protection">
      <div className="wrapper2 py-5">
        <div className="row">

          {/* Images */}
          <div className="col-md-7 image-grid">
            <div className="row g-3">
              {item.images?.map((img, index) => (
                <div className="col-6" key={index}>
                  <img src={`${BASE_URL}/uploads/${img}`} alt={`img-${index}`} />
                </div>
              ))}
            </div>

            <div className="row mt-4">
              <div className="col-12">
                <div className="note-box">
                  <p className="cross">{item.wrongNote}</p>
                  <p className="tick">{item.rightNote}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="col-md-5 cow-protection-content">
            <h3 className="section-title mb-3 pt-4">
              {item.title}
            </h3>

            <div className="content-box mb-3">
              {item.paragraphs?.map((p, i) => (
                <p key={i}>{i === 0 ? <em>{p}</em> : p}</p>
              ))}
            </div>

            <div className="alert-box">
              <p><strong>{item.alert}</strong></p>
            </div>

            <div className="cta-box mt-3">
              <p><strong>{item.cta}</strong></p>
            </div>

            <div className="mt-3 text-center">
              <p><strong>{item.bottomText}</strong></p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default CowProtection;
