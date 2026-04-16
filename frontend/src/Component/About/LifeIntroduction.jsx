import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LifeIntroduction = () => {
  const [lifeIntroData, setLifeIntroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectabout_lifeintroduction`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
setLifeIntroData(Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null);

      })
      .catch((err) => {
       // console.error("Error fetching section data:", err);
        setError("Failed to load life introduction data.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-muted py-5">Loading...</p>;

  if (error) return <p className="text-center text-muted py-5">{error}</p>;

  if (!lifeIntroData)
    return <p className="text-center text-muted py-5">No data found</p>;

  // **Now lifeIntroData is guaranteed to be non-null!**
  return (
    <section
      className="py-md-5"
      style={{ background: "rgba(240, 240, 240, 1)", color: "#111" }}
    >
      <div className="wrapper2">
        <div className="row g-4 g-md-5 align-items-start">
          <div className="col-md-7">
            <h3 className="mb-3" style={{ fontSize: "40px" }}>
              📜 {lifeIntroData.title || "Title not available"}
            </h3>
            <p className="mb-0" style={{ fontSize: "18px", lineHeight: "39px" }}>
              <span style={{ color: "rgb(4, 95, 191)" }}>
                {lifeIntroData.highlight || "Highlight not available"}
              </span>
            </p>
            <p style={{ fontSize: "18px", lineHeight: "39px" }}>
              {lifeIntroData.paragraphs || "Paragraph not available"}
            </p>
          </div>
          <div className="col-md-5">
            <img
              src={`${BASE_URL}${lifeIntroData.image_url || "/default-image.jpg"}`}
              alt="Life Introduction"
              className="img-fluid mb-3 about-gurudev"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LifeIntroduction;
