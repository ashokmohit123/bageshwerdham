import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AnnaRasoiArpan = () => {
  const [annapurnarasoi, setAnnapurnaRasoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectannarasoi_arpan`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const item = res.data[0];

          // ✅ Parse the `images` JSON string from database
          if (typeof item.images === "string") {
            try {
              item.images = JSON.parse(item.images);
            } catch {
              item.images = [];
            }
          }

          setAnnapurnaRasoi(item);
        } else {
          setError("No valid data found.");
        }
      })
      .catch(() => setError("Error fetching data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-5">Loading...</p>;
  if (error) return <p className="text-center text-danger py-5">{error}</p>;
  if (!annapurnarasoi) return <p>No data available.</p>;

  return (
    <section className="anna-rasoi-arpan">
      <div className="wrapper2 my-3">
        {/* Header Box */}
        <div className="p-4 rounded-4 shadow header-box text-center mb-5">
          <h2 className="text-primary">{annapurnarasoi.title}</h2>
          <p className="mt-3 fs-5">{annapurnarasoi.description}</p>
        </div>

        {/* Image Gallery */}
        <div className="row g-4">
          {annapurnarasoi.images?.map((img, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <img
                src={`${BASE_URL}/uploads/${img}`}
                alt={`Anna Rasoi ${index + 1}`}
                className="img-fluid rounded-4 shadow"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnnaRasoiArpan;
