import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VedicGurukulSahayog = () => {
  const [vedicgurukulsahayog, setVedicGurukulSahayog] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectvedicgurukul_sahayog`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        console.log("✅ API Data:", res.data);

        // ✅ API returns an array — we only need the first object
        if (Array.isArray(res.data) && res.data.length > 0) {
          setVedicGurukulSahayog(res.data[0]);
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

  if (!vedicgurukulsahayog) {
    return <p className="text-center py-5">Loading...</p>;
  }

  // ✅ Now we render a single object instead of using .map()
  return (
    <section className="gou-sahayog-section">
      <div className="wrapper2 pt-3">
        <div className="gau-card text-center">
          <h2>
            <span>{vedicgurukulsahayog.title}</span>
          </h2>

          <p>{vedicgurukulsahayog.description}</p>

          <p className="highlight mt-3">{vedicgurukulsahayog.highlight}</p>

          <div className="mt-4">
            <NavLink to={vedicgurukulsahayog.ctaLink} className="btn btn-gau">
              {vedicgurukulsahayog.ctaText}
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VedicGurukulSahayog;
