import React, { useState, useEffect } from "react";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ExtraOrdinaryLifeData = ({ lifeData }) => {
  // handle empty data safely
  const [activePillar, setActivePillar] = useState(null);

  useEffect(() => {
    if (lifeData && lifeData.length > 0) {
      setActivePillar(lifeData[0].key_name); // ✅ use key_name, not key
    }
  }, [lifeData]);

  if (!lifeData || lifeData.length === 0) {
    return <p className="text-center">Loading pillars...</p>;
  }

  return (
    <section className="wrapper hover-imges-right-show">
      <div className="row align-items-start">
        {/* Left: Pillars */}
        <div className="col-md-6 col-sm-6 col-12 mb-4 mt-5">
          <p className="pillars-title">● Pillars for an Extraordinary Life</p>
          <ul className="pillar-list">
            {lifeData.map((lifeItem) => (
              <li
                key={lifeItem.id} // ✅ use id as React key
                onMouseOver={() => setActivePillar(lifeItem.key_name)}
                className={activePillar === lifeItem.key_name ? "active" : ""}
              >
                {lifeItem.title}{" "}
                <i
                  className="fas fa-chevron-right"
                  style={{ fontSize: "35px" }}
                ></i>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Images */}
        <div className="col-md-6 col-sm-6 col-12 pillar-image mt-3">
          {lifeData.map((lifeItem) => (
            <img
              key={lifeItem.id}
              src={`${BASE_URL}${lifeItem.image_url}`} // ✅ full path
              alt={lifeItem.title}
              className={`img-item ${
                activePillar === lifeItem.key_name ? "active" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExtraOrdinaryLifeData;
