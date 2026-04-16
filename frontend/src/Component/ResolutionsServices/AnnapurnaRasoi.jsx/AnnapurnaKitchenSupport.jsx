import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AnnapurnaKitchenSupport = () => {
  const [annapurnasupport, setAnnapurnaSupport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectannapurnakitchen_support`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          setAnnapurnaSupport(res.data);
        } else {
          setError("No valid data found.");
        }
      })
      .catch(() => setError("Error fetching data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-5">Loading...</p>;
  if (error) return <p className="text-center text-danger py-5">{error}</p>;

  const item = annapurnasupport[0]; // ⭐ Correct object

  if (!item) return <p>No data available.</p>;

  return (
    <section className="annapurna-kitchen-support">
      <div className="wrapper2 pb-4">
        <div className="donation-box">
          <h3 className="mb-3">{item.title}</h3>

          <p>{item.description}</p>

          <div className="highlight-box my-4">{item.highlight}</div>

          {/* Info Cards */}
          <div className="row text-center g-3 mb-4">
            {item.info_cards && item.info_cards.map((text, index) => (
              <div key={index} className="col-md-4">
                <div className="info-card">{text}</div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <NavLink to={item.cta_link} className="donate-btn">
              {item.cta_text}
            </NavLink>
            <div className="quote mt-3">{item.quote}</div>
            <div className="sub-quote">{item.sub_quote}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnnapurnaKitchenSupport;
