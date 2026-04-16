import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const BageshwarDhamTravel = () => {
  const [travelData, setTravelData] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectvisitdham_traveldham`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res.data.length > 0) {
          const item = res.data[0];

          setTravelData({
            title: item.title,
            howToReachTitle: item.how_to_reach_title,
            travelModes:
              typeof item.travel_modes === "string"
                ? JSON.parse(item.travel_modes)
                : item.travel_modes || [],
            image: `${BASE_URL}${item.image}`,
            mapTitle: item.map_title,
            mapUrl: item.map_url,
          });
        }
      })
      .catch((err) => console.log("Fetch Error:", err));
  }, []);

  if (!travelData) {
    return <p className="text-center py-5">Loading...</p>;
  }

  return (
    <section className="bageshwar-dham-travel">
      <div className="wrapper2 container-custom">
        <div className="row content-box">

          {/* LEFT SIDE TEXT */}
          <div className="col-md-6 text-box">
            <div className="cta-box mt-3">

              <h3 className="heading-title mb-4">{travelData.title}</h3>
              <h4>{travelData.howToReachTitle}</h4>

              <ul className="list-group">
                {travelData.travelModes.map((mode, index) => (
                  <li className="list-group-item" key={index}>
                    <strong>
                      <i className={mode.icon}></i> {mode.emoji} {mode.title}
                    </strong>{" "}
                    <i className="fa fa-arrow-right"></i>
                    <p>{mode.description}</p>
                  </li>
                ))}
              </ul>

            </div>
          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="col-md-6 image-box">
            <img
              src={travelData.image}
              alt="Bageshwar Dham"
              className="custom-image"
            />
          </div>
        </div>

        {/* GOOGLE MAP */}
        <div className="google-map mt-5">
          <h3 className="mb-4">
            <i className="fa fa-map-marker"></i> {travelData.mapTitle}
          </h3>

          <iframe
            src={travelData.mapUrl}
            height="450"
            style={{ border: 0, width: "100%", maxHeight: "450px" }}
            title="Bageshwar Dham Map"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default BageshwarDhamTravel;
